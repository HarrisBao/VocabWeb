using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VocabWeb.Api.Data;
using VocabWeb.Api.Models;

namespace VocabWeb.Api.Controllers;

[ApiController]
[Route("api/feedback")]
[Authorize]
public class FeedbackController : ControllerBase
{
    private readonly AppDbContext _db;

    public FeedbackController(AppDbContext db)
    {
        _db = db;
    }

    private string? GetUserId() =>
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    // Score legend — constant, never stored per-record
    private static readonly Dictionary<string, int> ScoreLegend = new()
    {
        { "E",  6 },  // Excellent
        { "VG", 5 },  // Very Good
        { "G",  4 },  // Good
        { "F",  3 },  // Fair
        { "NI", 2 },  // Needs Improvement
        { "P",  1 },  // Poor
    };

    // ================================================================
    // STUDENT — read own monthly feedback table
    // ================================================================

    /// <summary>Student: get all feedback records for a cycle</summary>
    [HttpGet("student/cycles/{cycleId}")]
    public async Task<IActionResult> GetStudentFeedback(int cycleId)
    {
        var userId = GetUserId();
        var profile = await _db.StudentProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null) return Unauthorized();

        var feedbacks = await _db.StudentSkillFeedbacks
            .Where(f => f.StudentProfileId == profile.Id && f.FeedbackCycleId == cycleId)
            .Include(f => f.FeedbackCycle)
            .Include(f => f.FeedbackTemplate).ThenInclude(t => t!.Criteria.OrderBy(c => c.SortOrder))
            .Include(f => f.HostClassSkillOffering).ThenInclude(o => o!.Class)
            .Include(f => f.Scores)
            .OrderBy(f => f.Skill)
            .Select(f => new StudentFeedbackDto
            {
                Id = f.Id,
                Skill = f.Skill.ToString(),
                Status = f.Status.ToString(),
                TaFeedbackHtml = f.TaFeedbackHtml,
                TeacherFeedbackHtml = f.TeacherFeedbackHtml,
                HostClassName = f.HostClassSkillOffering != null ? f.HostClassSkillOffering.Class.Name : null,
                CompletedAt = f.CompletedAt,
                Scores = f.Scores.Select(s => new FeedbackScoreDto
                {
                    CriterionId = s.FeedbackTemplateCriterionId,
                    CriterionName = s.FeedbackTemplateCriterion.Name,
                    ScoreCode = s.ScoreCode,
                    ScoreValue = s.ScoreValue
                }).ToList(),
                Template = f.FeedbackTemplate == null ? null : new FeedbackTemplateDto
                {
                    Id = f.FeedbackTemplate.Id,
                    Name = f.FeedbackTemplate.Name,
                    Criteria = f.FeedbackTemplate.Criteria.Select(c => new FeedbackCriterionDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        SortOrder = c.SortOrder
                    }).ToList()
                }
            })
            .ToListAsync();

        var cycle = await _db.FeedbackCycles.FindAsync(cycleId);
        return Ok(new { Cycle = cycle, Feedbacks = feedbacks, ScoreLegend });
    }

    /// <summary>Student: list available feedback cycles</summary>
    [HttpGet("student/cycles")]
    public async Task<IActionResult> GetStudentCycles()
    {
        var userId = GetUserId();
        var profile = await _db.StudentProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null) return Unauthorized();

        var cycleIds = await _db.StudentSkillFeedbacks
            .Where(f => f.StudentProfileId == profile.Id)
            .Select(f => f.FeedbackCycleId)
            .Distinct()
            .ToListAsync();

        var cycles = await _db.FeedbackCycles
            .Where(c => cycleIds.Contains(c.Id))
            .OrderByDescending(c => c.StartDate)
            .ToListAsync();

        return Ok(cycles);
    }

    // ================================================================
    // TA — draft feedback for students
    // ================================================================

    /// <summary>TA: list students in a class needing feedback for a cycle</summary>
    [HttpGet("ta/classes/{classId}/cycles/{cycleId}/students")]
    [Authorize(Roles = "Teacher,TA")]
    public async Task<IActionResult> GetClassStudentsForFeedback(int classId, int cycleId)
    {
        var userId = GetUserId();
        // TA must be assigned to this class
        var hasAccess = await _db.ClassStaffAssignments
            .AnyAsync(a => a.ClassId == classId && a.UserId == userId);
        var isTeacher = await _db.Classes.AnyAsync(c => c.Id == classId && c.TeacherId == userId);
        if (!hasAccess && !isTeacher) return Forbid();

        var enrollments = await _db.ClassEnrollments
            .Where(e => e.ClassId == classId && e.IsActive)
            .Include(e => e.StudentProfile)
            .OrderBy(e => e.StudentProfile.FullName)
            .ToListAsync();

        // Fetch ALL 4 skills for each student (READING, LISTENING, WRITING, SPEAKING)
        var skills = new[] { IeltsSkill.READING, IeltsSkill.LISTENING, IeltsSkill.WRITING, IeltsSkill.SPEAKING };
        var studentIds = enrollments.Select(e => e.StudentProfileId).ToList();

        var existingFeedbacks = await _db.StudentSkillFeedbacks
            .Where(f => studentIds.Contains(f.StudentProfileId) && f.FeedbackCycleId == cycleId)
            .ToListAsync();

        var result = enrollments.Select(e => new
        {
            EnrollmentId = e.Id,
            StudentProfileId = e.StudentProfileId,
            StudentName = e.StudentProfile.FullName,
            FeedbackBySkill = skills.ToDictionary(
                s => s.ToString(),
                s =>
                {
                    var fb = existingFeedbacks.FirstOrDefault(f =>
                        f.StudentProfileId == e.StudentProfileId && f.Skill == s);
                    return fb == null
                        ? (object)new { Status = "NOT_STARTED", FeedbackId = (int?)null }
                        : new { Status = fb.Status.ToString(), FeedbackId = (int?)fb.Id };
                })
        }).ToList();

        return Ok(result);
    }

    /// <summary>TA: get or create a feedback record, then save TA draft</summary>
    [HttpPut("ta/students/{studentProfileId}/skills/{skill}/cycles/{cycleId}")]
    [Authorize(Roles = "Teacher,TA")]
    public async Task<IActionResult> SaveTaDraft(
        int studentProfileId, string skill, int cycleId,
        [FromBody] SaveTaDraftDto dto)
    {
        var userId = GetUserId();
        if (!Enum.TryParse<IeltsSkill>(skill, ignoreCase: true, out var skillEnum))
            return BadRequest("Kỹ năng không hợp lệ.");

        var enrollment = await _db.ClassEnrollments
            .FirstOrDefaultAsync(e => e.StudentProfileId == studentProfileId && e.IsActive);
        if (enrollment == null) return NotFound("Học sinh không có enrollment đang hoạt động.");

        var feedback = await _db.StudentSkillFeedbacks
            .Include(f => f.Scores)
            .FirstOrDefaultAsync(f =>
                f.StudentProfileId == studentProfileId &&
                f.Skill == skillEnum &&
                f.FeedbackCycleId == cycleId);

        if (feedback == null)
        {
            // Resolve host skill offering if student has placement in another class
            var hostAssignment = await _db.EnrollmentSkillAssignments
                .Where(a => a.ClassEnrollmentId == enrollment.Id &&
                            a.Skill == skillEnum &&
                            a.IsActive)
                .FirstOrDefaultAsync();

            int? hostOfferingId = null;
            if (hostAssignment != null)
            {
                var hostOffering = await _db.ClassSkillOfferings
                    .FirstOrDefaultAsync(o => o.ClassId == hostAssignment.TargetClassId && o.Skill == skillEnum);
                hostOfferingId = hostOffering?.Id;
            }

            // Get default template for this skill
            var template = await _db.FeedbackTemplates
                .FirstOrDefaultAsync(t => t.Skill == skillEnum && t.IsActive);

            feedback = new StudentSkillFeedback
            {
                StudentProfileId = studentProfileId,
                HomeClassEnrollmentId = enrollment.Id,
                Skill = skillEnum,
                HostClassSkillOfferingId = hostOfferingId,
                FeedbackCycleId = cycleId,
                FeedbackTemplateId = template?.Id,
                Status = FeedbackStatus.TA_DRAFT,
                TaUserId = userId
            };
            _db.StudentSkillFeedbacks.Add(feedback);
            await _db.SaveChangesAsync(); // get ID
        }
        else if (feedback.Status == FeedbackStatus.NOT_STARTED)
        {
            feedback.Status = FeedbackStatus.TA_DRAFT;
            feedback.TaUserId = userId;
        }

        feedback.TaFeedbackHtml = dto.TaFeedbackHtml;
        feedback.UpdatedAt = DateTime.UtcNow;

        // Status advancement
        if (dto.Submit && feedback.Status == FeedbackStatus.TA_DRAFT)
            feedback.Status = FeedbackStatus.WAITING_TEACHER;

        await _db.SaveChangesAsync();
        return Ok(new { FeedbackId = feedback.Id, Status = feedback.Status.ToString() });
    }

    // ================================================================
    // TEACHER — rubric scoring grid
    // ================================================================

    /// <summary>Teacher: get feedback grid for a skill offering in a cycle</summary>
    [HttpGet("teacher/offerings/{offeringId}/cycles/{cycleId}")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> GetTeacherFeedbackGrid(int offeringId, int cycleId)
    {
        var userId = GetUserId();
        var offering = await _db.ClassSkillOfferings
            .Include(o => o.Class)
            .FirstOrDefaultAsync(o => o.Id == offeringId);
        if (offering == null) return NotFound("Không tìm thấy skill offering.");
        if (offering.TeacherId != userId && offering.Class.TeacherId != userId)
            return Forbid();

        // Get home class students + cross-class students placed here
        var homeEnrollments = await _db.ClassEnrollments
            .Where(e => e.ClassId == offering.ClassId && e.IsActive)
            .Include(e => e.StudentProfile)
            .ToListAsync();

        // Cross-class students: hosted at this offering
        var crossClassEnrollmentIds = await _db.EnrollmentSkillAssignments
            .Where(a => a.TargetClassId == offering.ClassId &&
                        a.Skill == offering.Skill &&
                        a.IsActive)
            .Select(a => a.ClassEnrollmentId)
            .ToListAsync();

        var crossEnrollments = await _db.ClassEnrollments
            .Where(e => crossClassEnrollmentIds.Contains(e.Id))
            .Include(e => e.StudentProfile)
            .Include(e => e.Class)
            .ToListAsync();

        var allStudentProfileIds = homeEnrollments.Select(e => e.StudentProfileId)
            .Concat(crossEnrollments.Select(e => e.StudentProfileId))
            .Distinct().ToList();

        var feedbacks = await _db.StudentSkillFeedbacks
            .Where(f => allStudentProfileIds.Contains(f.StudentProfileId) &&
                        f.Skill == offering.Skill &&
                        f.FeedbackCycleId == cycleId)
            .Include(f => f.Scores)
            .ToListAsync();

        var template = await _db.FeedbackTemplates
            .Include(t => t.Criteria.OrderBy(c => c.SortOrder))
            .FirstOrDefaultAsync(t => t.Skill == offering.Skill && t.IsActive);

        var rows = homeEnrollments
            .OrderBy(e => e.StudentProfile.FullName)
            .Select(e => BuildFeedbackRow(e, feedbacks, false, null))
            .Concat(crossEnrollments
                .OrderBy(e => e.StudentProfile.FullName)
                .Select(e => BuildFeedbackRow(e, feedbacks, true, e.Class.Name)))
            .ToList();

        return Ok(new
        {
            OfferingId = offeringId,
            Skill = offering.Skill.ToString(),
            ClassName = offering.Class.Name,
            Template = template == null ? null : new
            {
                template.Id,
                template.Name,
                Criteria = template.Criteria.Select(c => new { c.Id, c.Name, c.SortOrder })
            },
            ScoreLegend,
            Students = rows
        });
    }

    private static object BuildFeedbackRow(
        ClassEnrollment enrollment,
        List<StudentSkillFeedback> feedbacks,
        bool isCrossClass,
        string? homeClassName)
    {
        var fb = feedbacks.FirstOrDefault(f => f.StudentProfileId == enrollment.StudentProfileId);
        return new
        {
            StudentProfileId = enrollment.StudentProfileId,
            StudentName = enrollment.StudentProfile.FullName,
            HomeClassName = homeClassName,
            IsCrossClass = isCrossClass,
            FeedbackId = fb?.Id,
            Status = fb?.Status.ToString() ?? "NOT_STARTED",
            TaFeedbackHtml = fb?.TaFeedbackHtml,
            TeacherFeedbackHtml = fb?.TeacherFeedbackHtml,
            Scores = fb?.Scores.Select(s => new
            {
                CriterionId = s.FeedbackTemplateCriterionId,
                s.ScoreCode,
                s.ScoreValue
            }) ?? Enumerable.Empty<object>()
        };
    }

    /// <summary>Teacher: save rubric scores + teacher feedback text</summary>
    [HttpPut("teacher/feedbacks/{feedbackId}")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> SaveTeacherFeedback(int feedbackId, [FromBody] SaveTeacherFeedbackDto dto)
    {
        var userId = GetUserId();
        var feedback = await _db.StudentSkillFeedbacks
            .Include(f => f.Scores)
            .Include(f => f.HostClassSkillOffering)
            .Include(f => f.HomeClassEnrollment).ThenInclude(e => e.Class)
            .FirstOrDefaultAsync(f => f.Id == feedbackId);
        if (feedback == null) return NotFound();

        feedback.TeacherFeedbackHtml = dto.TeacherFeedbackHtml;
        feedback.TeacherUserId = userId;
        feedback.UpdatedAt = DateTime.UtcNow;

        if (feedback.Status == FeedbackStatus.WAITING_TEACHER || feedback.Status == FeedbackStatus.TA_DRAFT)
            feedback.Status = FeedbackStatus.TEACHER_DRAFT;

        // Update rubric scores
        if (dto.Scores?.Any() == true)
        {
            _db.StudentSkillFeedbackScores.RemoveRange(feedback.Scores);
            foreach (var score in dto.Scores)
            {
                if (!ScoreLegend.TryGetValue(score.ScoreCode, out var scoreValue))
                    return BadRequest($"Mã điểm không hợp lệ: {score.ScoreCode}. Hợp lệ: E, VG, G, F, NI, P.");

                _db.StudentSkillFeedbackScores.Add(new StudentSkillFeedbackScore
                {
                    StudentSkillFeedbackId = feedbackId,
                    FeedbackTemplateCriterionId = score.CriterionId,
                    ScoreCode = score.ScoreCode,
                    ScoreValue = scoreValue
                });
            }
        }

        if (dto.Complete)
        {
            feedback.Status = FeedbackStatus.COMPLETED;
            feedback.CompletedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return Ok(new { FeedbackId = feedbackId, Status = feedback.Status.ToString() });
    }
}

// ================================================================
// DTOs
// ================================================================

public class SaveTaDraftDto
{
    public string? TaFeedbackHtml { get; set; }
    public bool Submit { get; set; } = false;   // true = advance to WAITING_TEACHER
}

public class SaveTeacherFeedbackDto
{
    public string? TeacherFeedbackHtml { get; set; }
    public List<ScoreInputDto>? Scores { get; set; }
    public bool Complete { get; set; } = false;  // true = mark COMPLETED
}

public class ScoreInputDto
{
    public int CriterionId { get; set; }
    public string ScoreCode { get; set; } = string.Empty;  // E, VG, G, F, NI, P
}

public class StudentFeedbackDto
{
    public int Id { get; set; }
    public string Skill { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? TaFeedbackHtml { get; set; }
    public string? TeacherFeedbackHtml { get; set; }
    public string? HostClassName { get; set; }
    public DateTime? CompletedAt { get; set; }
    public List<FeedbackScoreDto> Scores { get; set; } = new();
    public FeedbackTemplateDto? Template { get; set; }
}

public class FeedbackScoreDto
{
    public int CriterionId { get; set; }
    public string CriterionName { get; set; } = string.Empty;
    public string ScoreCode { get; set; } = string.Empty;
    public int ScoreValue { get; set; }
}

public class FeedbackTemplateDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<FeedbackCriterionDto> Criteria { get; set; } = new();
}

public class FeedbackCriterionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
