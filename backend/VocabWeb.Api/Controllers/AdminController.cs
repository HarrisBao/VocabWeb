using VocabWeb.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocabWeb.Api.Data;
using VocabWeb.Api.Models;

namespace VocabWeb.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;

    public AdminController(AppDbContext db, UserManager<ApplicationUser> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    // ============================================================
    // SKILL OFFERINGS — manage per-skill Teacher assignments
    // ============================================================

    /// <summary>GET all skill offerings for a class</summary>
    [HttpGet("classes/{classId}/skill-offerings")]
    public async Task<IActionResult> GetSkillOfferings(int classId)
    {
        var cls = await _db.Classes.FindAsync(classId);
        if (cls == null) return NotFound("Không tìm thấy lớp học.");

        var offerings = await _db.ClassSkillOfferings
            .Where(o => o.ClassId == classId)
            .Include(o => o.Teacher)
            .OrderBy(o => o.Skill)
            .Select(o => new
            {
                o.Id,
                o.ClassId,
                Skill = o.Skill.ToString(),
                o.IsActive,
                Teacher = o.Teacher == null ? null : new
                {
                    o.Teacher.Id,
                    o.Teacher.FullName,
                    o.Teacher.Email
                },
                o.CreatedAt,
                o.UpdatedAt
            })
            .ToListAsync();

        return Ok(offerings);
    }

    /// <summary>Create or update a skill offering (set teacher for a skill in a class)</summary>
    [HttpPut("classes/{classId}/skill-offerings/{skill}")]
    public async Task<IActionResult> UpsertSkillOffering(int classId, string skill, [FromBody] UpsertSkillOfferingDto dto)
    {
        var cls = await _db.Classes.FindAsync(classId);
        if (cls == null) return NotFound("Không tìm thấy lớp học.");

        if (!Enum.TryParse<IeltsSkill>(skill, ignoreCase: true, out var skillEnum))
            return BadRequest("Kỹ năng không hợp lệ. Giá trị hợp lệ: READING, LISTENING, WRITING, SPEAKING.");

        // Validate teacher if provided
        if (!string.IsNullOrEmpty(dto.TeacherId))
        {
            var teacher = await _userManager.FindByIdAsync(dto.TeacherId);
            if (teacher == null) return NotFound("Không tìm thấy giáo viên.");
            var roles = await _userManager.GetRolesAsync(teacher);
            if (!roles.Contains("Teacher") && !roles.Contains("TA"))
                return BadRequest("Người dùng được chỉ định không phải giáo viên hoặc trợ giảng.");
        }

        var existing = await _db.ClassSkillOfferings
            .FirstOrDefaultAsync(o => o.ClassId == classId && o.Skill == skillEnum);

        if (existing == null)
        {
            var offering = new ClassSkillOffering
            {
                ClassId = classId,
                Skill = skillEnum,
                TeacherId = string.IsNullOrEmpty(dto.TeacherId) ? null : dto.TeacherId,
                IsActive = dto.IsActive ?? true
            };
            _db.ClassSkillOfferings.Add(offering);
        }
        else
        {
            existing.TeacherId = string.IsNullOrEmpty(dto.TeacherId) ? null : dto.TeacherId;
            existing.IsActive = dto.IsActive ?? existing.IsActive;
            existing.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Đã cập nhật phân công kỹ năng." });
    }

    // ============================================================
    // STUDENT SKILL PLACEMENT — manage EnrollmentSkillAssignment
    // ============================================================

    /// <summary>Get all active skill assignments for a student enrollment</summary>
    [HttpGet("enrollments/{enrollmentId}/skill-assignments")]
    public async Task<IActionResult> GetStudentSkillAssignments(int enrollmentId)
    {
        var enrollment = await _db.ClassEnrollments
            .Include(e => e.StudentProfile)
            .Include(e => e.Class)
            .FirstOrDefaultAsync(e => e.Id == enrollmentId);
        if (enrollment == null) return NotFound("Không tìm thấy enrollment.");

        var assignments = await _db.EnrollmentSkillAssignments
            .Where(a => a.ClassEnrollmentId == enrollmentId && a.IsActive)
            .Include(a => a.TargetClass)
            .Select(a => new
            {
                a.Id,
                a.Skill,
                SkillName = a.Skill.ToString(),
                SourceClassId = a.SourceClassId,
                TargetClassId = a.TargetClassId,
                TargetClassName = a.TargetClass.Name,
                AssignmentType = a.AssignmentType.ToString(),
                a.EffectiveFrom,
                a.EffectiveTo,
                a.Reason,
                a.IsActive,
                a.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            EnrollmentId = enrollmentId,
            StudentName = enrollment.StudentProfile.FullName,
            HomeClassName = enrollment.Class.Name,
            Assignments = assignments
        });
    }

    /// <summary>Create a permanent skill placement (student studies skill X at a different class)</summary>
    [HttpPost("enrollments/{enrollmentId}/skill-assignments")]
    public async Task<IActionResult> CreateSkillPlacement(int enrollmentId, [FromBody] CreateSkillPlacementDto dto)
    {
        var enrollment = await _db.ClassEnrollments
            .Include(e => e.Class)
            .FirstOrDefaultAsync(e => e.Id == enrollmentId && e.IsActive);
        if (enrollment == null) return NotFound("Không tìm thấy enrollment hoặc học sinh không còn hoạt động.");

        if (!Enum.TryParse<IeltsSkill>(dto.Skill, ignoreCase: true, out var skillEnum))
            return BadRequest("Kỹ năng không hợp lệ.");

        var targetClass = await _db.Classes.FindAsync(dto.TargetClassId);
        if (targetClass == null) return NotFound("Không tìm thấy lớp đích.");

        // Deactivate any existing active assignment for this skill
        var existing = await _db.EnrollmentSkillAssignments
            .Where(a => a.ClassEnrollmentId == enrollmentId && a.Skill == skillEnum && a.IsActive)
            .ToListAsync();
        foreach (var ea in existing)
            ea.IsActive = false;

        var assignment = new EnrollmentSkillAssignment
        {
            ClassEnrollmentId = enrollmentId,
            Skill = skillEnum,
            SourceClassId = enrollment.ClassId,
            TargetClassId = dto.TargetClassId,
            AssignmentType = RequestType.PERMANENT_TRANSFER,
            EffectiveFrom = dto.EffectiveFrom,
            EffectiveTo = dto.EffectiveTo,
            Reason = dto.Reason,
            IsActive = true,
            CreatedByUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
        };
        _db.EnrollmentSkillAssignments.Add(assignment);
        await _db.SaveChangesAsync();

        return Ok(new { message = $"Đã phân công {skillEnum} tại lớp {targetClass.Name}.", AssignmentId = assignment.Id });
    }

    /// <summary>Remove a skill placement (return student to home class for that skill)</summary>
    [HttpDelete("skill-assignments/{assignmentId}")]
    public async Task<IActionResult> RemoveSkillPlacement(int assignmentId)
    {
        var assignment = await _db.EnrollmentSkillAssignments.FindAsync(assignmentId);
        if (assignment == null) return NotFound();

        assignment.IsActive = false;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Đã hủy phân công kỹ năng." });
    }

    // ============================================================
    // FEEDBACK CYCLES — manage monthly/periodic cycles
    // ============================================================

    [HttpGet("feedback-cycles")]
    public async Task<IActionResult> GetFeedbackCycles()
    {
        var cycles = await _db.FeedbackCycles
            .OrderByDescending(c => c.StartDate)
            .Select(c => new { c.Id, c.Name, c.StartDate, c.EndDate, c.Type, c.Status, c.CreatedAt })
            .ToListAsync();
        return Ok(cycles);
    }

    [HttpPost("feedback-cycles")]
    public async Task<IActionResult> CreateFeedbackCycle([FromBody] CreateFeedbackCycleDto dto)
    {
        var cycle = new FeedbackCycle
        {
            Name = dto.Name,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Type = dto.Type,
            Status = FeedbackCycleStatus.ACTIVE
        };
        _db.FeedbackCycles.Add(cycle);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetFeedbackCycles), new { }, new { cycle.Id, cycle.Name });
    }

    [HttpPut("feedback-cycles/{id}/status")]
    public async Task<IActionResult> UpdateCycleStatus(int id, [FromBody] UpdateCycleStatusDto dto)
    {
        var cycle = await _db.FeedbackCycles.FindAsync(id);
        if (cycle == null) return NotFound();
        cycle.Status = dto.Status;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Đã cập nhật trạng thái chu kỳ." });
    }

    // ============================================================
    // FEEDBACK TEMPLATES
    // ============================================================

    [HttpGet("feedback-templates")]
    public async Task<IActionResult> GetFeedbackTemplates([FromQuery] string? skill = null)
    {
        var query = _db.FeedbackTemplates
            .Include(t => t.Criteria.OrderBy(c => c.SortOrder))
            .AsQueryable();

        if (!string.IsNullOrEmpty(skill) && Enum.TryParse<IeltsSkill>(skill, ignoreCase: true, out var skillEnum))
            query = query.Where(t => t.Skill == skillEnum);

        var templates = await query
            .OrderBy(t => t.Skill).ThenBy(t => t.Name)
            .Select(t => new
            {
                t.Id, t.Name, t.Skill, t.Description, t.IsActive,
                Criteria = t.Criteria.Select(c => new { c.Id, c.Name, c.Description, c.SortOrder })
            })
            .ToListAsync();

        return Ok(templates);
    }

    // ============================================================
    // LEARNING STAGES & MILESTONES
    // ============================================================

    [HttpGet("skill-offerings/{offeringId}/stages")]
    public async Task<IActionResult> GetStages(int offeringId)
    {
        var stages = await _db.ClassLearningStages
            .Where(s => s.ClassSkillOfferingId == offeringId && s.IsActive)
            .Include(s => s.Milestones)
            .OrderBy(s => s.SortOrder)
            .Select(s => new
            {
                s.Id, s.Name, s.Description, s.SortOrder, s.IsActive,
                Milestones = s.Milestones.OrderBy(m => m.SortOrder)
                    .Select(m => new { m.Id, m.Name, m.Description, m.SortOrder })
            })
            .ToListAsync();
        return Ok(stages);
    }

    [HttpPost("skill-offerings/{offeringId}/stages")]
    public async Task<IActionResult> CreateStage(int offeringId, [FromBody] CreateStageDto dto)
    {
        var offering = await _db.ClassSkillOfferings.FindAsync(offeringId);
        if (offering == null) return NotFound("Không tìm thấy skill offering.");

        var maxOrder = await _db.ClassLearningStages
            .Where(s => s.ClassSkillOfferingId == offeringId)
            .MaxAsync(s => (int?)s.SortOrder) ?? 0;

        var stage = new ClassLearningStage
        {
            ClassSkillOfferingId = offeringId,
            Name = dto.Name,
            Description = dto.Description,
            SortOrder = dto.SortOrder ?? maxOrder + 1,
            IsActive = true
        };
        _db.ClassLearningStages.Add(stage);
        await _db.SaveChangesAsync();
        return Ok(new { stage.Id, stage.Name, stage.SortOrder });
    }

    [HttpPost("stages/{stageId}/milestones")]
    public async Task<IActionResult> CreateMilestone(int stageId, [FromBody] CreateMilestoneDto dto)
    {
        var stage = await _db.ClassLearningStages.FindAsync(stageId);
        if (stage == null) return NotFound("Không tìm thấy giai đoạn học tập.");

        var maxOrder = await _db.LearningMilestones
            .Where(m => m.ClassLearningStageId == stageId)
            .MaxAsync(m => (int?)m.SortOrder) ?? 0;

        var milestone = new LearningMilestone
        {
            ClassLearningStageId = stageId,
            Name = dto.Name,
            Description = dto.Description,
            SortOrder = dto.SortOrder ?? maxOrder + 1
        };
        _db.LearningMilestones.Add(milestone);
        await _db.SaveChangesAsync();
        return Ok(new { milestone.Id, milestone.Name, milestone.SortOrder });
    }

    // ============================================================
    // OVERVIEW — classes with skill offering summary
    // ============================================================

    
    
    [HttpPost("classes")]
    public async Task<IActionResult> CreateClass([FromBody] CreateClassDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        
        var adminId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(adminId)) return Unauthorized();

        var code = !string.IsNullOrWhiteSpace(dto.Code)
            ? dto.Code.Trim().ToUpperInvariant()
            : "ITL-" + Guid.NewGuid().ToString("N").Substring(0, 6).ToUpperInvariant();

        var codeExists = await _db.Classes.AnyAsync(c => c.Code == code);
        if (codeExists)
        {
            code = "ITL-" + Guid.NewGuid().ToString("N").Substring(0, 6).ToUpperInvariant();
        }

        var cls = new Class
        {
            Name = dto.Name.Trim(),
            Code = code,
            Description = dto.Description?.Trim(),
            FixedLinkToken = Guid.NewGuid().ToString("N"),
            TeacherId = adminId, // Use admin ID as creator to satisfy FK
            CreatedAt = DateTime.UtcNow
        };

        _db.Classes.Add(cls);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Tạo lớp học thành công.", id = cls.Id });
    }

    [HttpPut("classes/{id}")]
    public async Task<IActionResult> UpdateClass(int id, [FromBody] CreateClassDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var cls = await _db.Classes.Where(c => c.Id == id && !c.IsArchived).FirstOrDefaultAsync();
        if (cls == null) return NotFound(new { message = "Không tìm thấy lớp học." });

        cls.Name = dto.Name.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Code))
        {
            cls.Code = dto.Code.Trim().ToUpperInvariant();
        }
        cls.Description = dto.Description?.Trim();
        cls.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Cập nhật thông tin lớp thành công." });
    }

    [HttpDelete("classes/{id}")]
    public async Task<IActionResult> DeleteClass(int id)
    {
        var cls = await _db.Classes.Where(c => c.Id == id && !c.IsArchived).FirstOrDefaultAsync();
        if (cls == null) return NotFound(new { message = "Không tìm thấy lớp học." });

        cls.IsArchived = true;
        cls.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Đã xóa lớp học thành công." });
    }


    [HttpGet("teachers")]
    public async Task<IActionResult> GetTeachers()
    {
        var teachers = await _userManager.GetUsersInRoleAsync("Teacher");
        return Ok(teachers.Where(t => t.IsActive).Select(t => new { t.Id, t.FullName, t.Email }));
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetAdminOverview()
    {
        var classes = await _db.Classes
            .Where(c => !c.IsArchived)
            .Include(c => c.SkillOfferings).ThenInclude(o => o.Teacher)
            .OrderBy(c => c.Name)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Code,
                EnrollmentCount = _db.ClassEnrollments.Count(e => e.ClassId == c.Id && e.IsActive),
                SkillOfferings = c.SkillOfferings.Where(o => o.IsActive).Select(o => new
                {
                    Skill = o.Skill.ToString(),
                    TeacherName = o.Teacher == null ? "(Chưa phân công)" : o.Teacher.FullName
                })
            })
            .ToListAsync();

        return Ok(classes);
    }
}

// ============================================================
// DTOs (inline)
// ============================================================

public class UpsertSkillOfferingDto
{
    public string? TeacherId { get; set; }
    public bool? IsActive { get; set; }
}

public class CreateSkillPlacementDto
{
    public string Skill { get; set; } = string.Empty;
    public int TargetClassId { get; set; }
    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    public string? Reason { get; set; }
}

public class CreateFeedbackCycleDto
{
    public string Name { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public FeedbackCycleType Type { get; set; } = FeedbackCycleType.MONTHLY;
}

public class UpdateCycleStatusDto
{
    public FeedbackCycleStatus Status { get; set; }
}

public class CreateStageDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? SortOrder { get; set; }
}

public class CreateMilestoneDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? SortOrder { get; set; }
}
