using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VocabWeb.Api.Data;
using VocabWeb.Api.Models;

namespace VocabWeb.Api.Controllers;

[ApiController]
[Route("api/progress")]
[Authorize]
public class ProgressController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProgressController(AppDbContext db)
    {
        _db = db;
    }

    private string? GetUserId() =>
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    // ================================================================
    // STUDENT — read progress for their skill offerings
    // ================================================================

    /// <summary>Student: get progress for a specific skill in a class context</summary>
    [HttpGet("student/classes/{classId}/skills/{skill}")]
    public async Task<IActionResult> GetStudentProgress(int classId, string skill)
    {
        var userId = GetUserId();
        var profile = await _db.StudentProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null) return Unauthorized();

        if (!Enum.TryParse<IeltsSkill>(skill, ignoreCase: true, out var skillEnum))
            return BadRequest("Kỹ năng không hợp lệ.");

        var enrollment = await _db.ClassEnrollments
            .FirstOrDefaultAsync(e => e.ClassId == classId && e.StudentProfileId == profile.Id && e.IsActive);
        if (enrollment == null) return NotFound("Học sinh chưa ghi danh vào lớp này.");

        // Resolve effective class for this skill (may be a host class)
        var hostAssignment = await _db.EnrollmentSkillAssignments
            .Where(a => a.ClassEnrollmentId == enrollment.Id && a.Skill == skillEnum && a.IsActive)
            .FirstOrDefaultAsync();

        int effectiveClassId = hostAssignment?.TargetClassId ?? classId;

        // Find skill offering
        var offering = await _db.ClassSkillOfferings
            .Include(o => o.Class)
            .FirstOrDefaultAsync(o => o.ClassId == effectiveClassId && o.Skill == skillEnum && o.IsActive);

        if (offering == null)
            return Ok(new { HasStages = false, Message = "Chưa có lộ trình học tập cho kỹ năng này." });

        // Get stages and milestones
        var stages = await _db.ClassLearningStages
            .Where(s => s.ClassSkillOfferingId == offering.Id && s.IsActive)
            .Include(s => s.Milestones)
            .OrderBy(s => s.SortOrder)
            .ToListAsync();

        if (!stages.Any())
            return Ok(new { HasStages = false, OfferingId = offering.Id, ClassName = offering.Class.Name });

        // Get completed milestones for this student
        var allMilestoneIds = stages.SelectMany(s => s.Milestones).Select(m => m.Id).ToList();
        var completedProgress = await _db.StudentMilestoneProgresses
            .Where(p => p.StudentProfileId == profile.Id &&
                        p.ClassSkillOfferingId == offering.Id &&
                        allMilestoneIds.Contains(p.LearningMilestoneId) &&
                        p.CompletedAt != null)
            .ToListAsync();

        var completedIds = completedProgress.Select(p => p.LearningMilestoneId).ToHashSet();
        int totalMilestones = allMilestoneIds.Count;
        int completedCount = completedIds.Count;

        // Find current stage (first stage with incomplete milestones)
        ClassLearningStage? currentStage = stages.FirstOrDefault(s =>
            s.Milestones.Any(m => !completedIds.Contains(m.Id)));
        currentStage ??= stages.Last();

        var stageProgress = stages.Select(s => new
        {
            s.Id,
            s.Name,
            s.Description,
            s.SortOrder,
            TotalMilestones = s.Milestones.Count,
            CompletedMilestones = s.Milestones.Count(m => completedIds.Contains(m.Id)),
            IsCurrentStage = s.Id == currentStage.Id,
            Milestones = s.Milestones.OrderBy(m => m.SortOrder).Select(m => new
            {
                m.Id,
                m.Name,
                m.Description,
                m.SortOrder,
                IsCompleted = completedIds.Contains(m.Id),
                CompletedAt = completedProgress.FirstOrDefault(p => p.LearningMilestoneId == m.Id)?.CompletedAt
            })
        }).ToList();

        return Ok(new
        {
            HasStages = true,
            OfferingId = offering.Id,
            Skill = skillEnum.ToString(),
            ClassName = offering.Class.Name,
            IsHostClass = hostAssignment != null,
            TotalMilestones = totalMilestones,
            CompletedMilestones = completedCount,
            ProgressPercent = totalMilestones == 0 ? 0 : (int)Math.Round((double)completedCount / totalMilestones * 100),
            CurrentStage = new { currentStage.Id, currentStage.Name, currentStage.SortOrder },
            Stages = stageProgress
        });
    }

    // ================================================================
    // TEACHER — mark student milestone completion
    // ================================================================

    /// <summary>Teacher: mark a milestone as completed for a student</summary>
    [HttpPost("teacher/students/{studentProfileId}/milestones/{milestoneId}/complete")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> CompleteMilestone(int studentProfileId, int milestoneId)
    {
        var userId = GetUserId();

        var milestone = await _db.LearningMilestones
            .Include(m => m.ClassLearningStage).ThenInclude(s => s.ClassSkillOffering)
            .FirstOrDefaultAsync(m => m.Id == milestoneId);
        if (milestone == null) return NotFound("Không tìm thấy mốc học tập.");

        var offering = milestone.ClassLearningStage.ClassSkillOffering;

        // Teacher must be assigned to this offering or own the class
        var hasAccess = offering.TeacherId == userId ||
            await _db.Classes.AnyAsync(c => c.Id == offering.ClassId && c.TeacherId == userId);
        if (!hasAccess && !User.IsInRole("Admin")) return Forbid();

        var existing = await _db.StudentMilestoneProgresses
            .FirstOrDefaultAsync(p =>
                p.StudentProfileId == studentProfileId &&
                p.LearningMilestoneId == milestoneId &&
                p.ClassSkillOfferingId == offering.Id);

        if (existing != null)
        {
            // Toggle: if already completed, undo it
            if (existing.CompletedAt != null)
            {
                existing.CompletedAt = null;
                await _db.SaveChangesAsync();
                return Ok(new { Completed = false, Message = "Đã hủy hoàn thành mốc học tập." });
            }
            existing.CompletedAt = DateTime.UtcNow;
            existing.MarkedByUserId = userId;
        }
        else
        {
            _db.StudentMilestoneProgresses.Add(new StudentMilestoneProgress
            {
                StudentProfileId = studentProfileId,
                LearningMilestoneId = milestoneId,
                ClassSkillOfferingId = offering.Id,
                CompletedAt = DateTime.UtcNow,
                MarkedByUserId = userId
            });
        }

        await _db.SaveChangesAsync();
        return Ok(new { Completed = true, Message = "Đã đánh dấu hoàn thành mốc học tập." });
    }

    /// <summary>Teacher: view all students' progress for a skill offering</summary>
    [HttpGet("teacher/offerings/{offeringId}/students")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> GetOfferingStudentProgress(int offeringId)
    {
        var userId = GetUserId();
        var offering = await _db.ClassSkillOfferings
            .Include(o => o.Class)
            .FirstOrDefaultAsync(o => o.Id == offeringId);
        if (offering == null) return NotFound();

        var hasAccess = offering.TeacherId == userId || offering.Class.TeacherId == userId;
        if (!hasAccess && !User.IsInRole("Admin")) return Forbid();

        var stages = await _db.ClassLearningStages
            .Where(s => s.ClassSkillOfferingId == offeringId && s.IsActive)
            .Include(s => s.Milestones)
            .OrderBy(s => s.SortOrder)
            .ToListAsync();

        var allMilestoneIds = stages.SelectMany(s => s.Milestones).Select(m => m.Id).ToList();
        var totalMilestones = allMilestoneIds.Count;

        // Get all students (home + cross-class)
        var homeEnrollments = await _db.ClassEnrollments
            .Where(e => e.ClassId == offering.ClassId && e.IsActive)
            .Include(e => e.StudentProfile)
            .ToListAsync();

        var crossClassIds = await _db.EnrollmentSkillAssignments
            .Where(a => a.TargetClassId == offering.ClassId && a.Skill == offering.Skill && a.IsActive)
            .Select(a => a.ClassEnrollmentId).ToListAsync();

        var crossEnrollments = await _db.ClassEnrollments
            .Where(e => crossClassIds.Contains(e.Id))
            .Include(e => e.StudentProfile)
            .Include(e => e.Class)
            .ToListAsync();

        var allProfileIds = homeEnrollments.Select(e => e.StudentProfileId)
            .Concat(crossEnrollments.Select(e => e.StudentProfileId))
            .Distinct().ToList();

        var allProgress = await _db.StudentMilestoneProgresses
            .Where(p => allProfileIds.Contains(p.StudentProfileId) &&
                        p.ClassSkillOfferingId == offeringId)
            .ToListAsync();

        var buildRow = (ClassEnrollment e, bool isCross, string? homeClass) =>
        {
            var completed = allProgress.Where(p =>
                p.StudentProfileId == e.StudentProfileId &&
                allMilestoneIds.Contains(p.LearningMilestoneId) &&
                p.CompletedAt != null).ToList();
            return new
            {
                StudentProfileId = e.StudentProfileId,
                StudentName = e.StudentProfile.FullName,
                IsCrossClass = isCross,
                HomeClassName = homeClass,
                CompletedMilestones = completed.Count,
                TotalMilestones = totalMilestones,
                ProgressPercent = totalMilestones == 0 ? 0 :
                    (int)Math.Round((double)completed.Count / totalMilestones * 100)
            };
        };

        var rows = homeEnrollments.Select(e => buildRow(e, false, null))
            .Concat(crossEnrollments.Select(e => buildRow(e, true, e.Class.Name)))
            .OrderBy(r => r.StudentName)
            .ToList();

        return Ok(new
        {
            OfferingId = offeringId,
            Skill = offering.Skill.ToString(),
            ClassName = offering.Class.Name,
            TotalMilestones = totalMilestones,
            Stages = stages.Select(s => new { s.Id, s.Name, s.SortOrder, MilestoneCount = s.Milestones.Count }),
            Students = rows
        });
    }

    /// <summary>Teacher/Admin: get all stages with milestones for an offering</summary>
    [HttpGet("teacher/offerings/{offeringId}/stages")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> GetOfferingStages(int offeringId)
    {
        var userId = GetUserId();
        var offering = await _db.ClassSkillOfferings
            .Include(o => o.Class)
            .FirstOrDefaultAsync(o => o.Id == offeringId);
        if (offering == null) return NotFound("Không tìm thấy skill offering.");

        var hasAccess = offering.TeacherId == userId || offering.Class.TeacherId == userId || User.IsInRole("Admin");
        if (!hasAccess) return Forbid();

        var stages = await _db.ClassLearningStages
            .Where(s => s.ClassSkillOfferingId == offeringId)
            .Include(s => s.Milestones)
            .OrderBy(s => s.SortOrder)
            .Select(s => new
            {
                s.Id,
                s.ClassSkillOfferingId,
                s.Name,
                s.Description,
                s.SortOrder,
                s.IsActive,
                s.CreatedAt,
                Milestones = s.Milestones.OrderBy(m => m.SortOrder).Select(m => new
                {
                    m.Id,
                    m.ClassLearningStageId,
                    m.Name,
                    m.Description,
                    m.SortOrder,
                    m.CreatedAt
                })
            })
            .ToListAsync();

        return Ok(stages);
    }

    /// <summary>Teacher/Admin: create a learning stage for a skill offering</summary>
    [HttpPost("teacher/offerings/{offeringId}/stages")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> CreateStage(int offeringId, [FromBody] CreateStageDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Tên giai đoạn không được để trống.");

        var userId = GetUserId();
        var offering = await _db.ClassSkillOfferings
            .Include(o => o.Class)
            .FirstOrDefaultAsync(o => o.Id == offeringId);
        if (offering == null) return NotFound("Không tìm thấy skill offering.");

        var hasAccess = offering.TeacherId == userId || offering.Class.TeacherId == userId || User.IsInRole("Admin");
        if (!hasAccess) return Forbid();

        var maxOrder = await _db.ClassLearningStages
            .Where(s => s.ClassSkillOfferingId == offeringId)
            .MaxAsync(s => (int?)s.SortOrder) ?? 0;

        var hasActive = await _db.ClassLearningStages
            .AnyAsync(s => s.ClassSkillOfferingId == offeringId && s.IsActive);

        var stage = new ClassLearningStage
        {
            ClassSkillOfferingId = offeringId,
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            SortOrder = dto.SortOrder ?? (maxOrder + 1),
            IsActive = !hasActive
        };

        _db.ClassLearningStages.Add(stage);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            stage.Id,
            stage.ClassSkillOfferingId,
            stage.Name,
            stage.Description,
            stage.SortOrder,
            stage.IsActive
        });
    }

    /// <summary>Teacher/Admin: update a learning stage</summary>
    [HttpPut("teacher/stages/{stageId}")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> UpdateStage(int stageId, [FromBody] UpdateStageDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Tên giai đoạn không được để trống.");

        var stage = await _db.ClassLearningStages
            .Include(s => s.ClassSkillOffering)
                .ThenInclude(o => o.Class)
            .FirstOrDefaultAsync(s => s.Id == stageId);
        if (stage == null) return NotFound("Không tìm thấy giai đoạn học tập.");

        var offering = stage.ClassSkillOffering;
        var userId = GetUserId();
        var hasAccess = offering.TeacherId == userId || offering.Class.TeacherId == userId || User.IsInRole("Admin");
        if (!hasAccess) return Forbid();

        stage.Name = dto.Name.Trim();
        stage.Description = dto.Description?.Trim();
        stage.SortOrder = dto.SortOrder;
        stage.IsActive = dto.IsActive;

        if (dto.IsActive)
        {
            var otherStages = await _db.ClassLearningStages
                .Where(s => s.ClassSkillOfferingId == stage.ClassSkillOfferingId && s.Id != stage.Id && s.IsActive)
                .ToListAsync();

            foreach (var other in otherStages)
            {
                other.IsActive = false;
            }
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            stage.Id,
            stage.ClassSkillOfferingId,
            stage.Name,
            stage.Description,
            stage.SortOrder,
            stage.IsActive
        });
    }

    /// <summary>Teacher/Admin: delete a learning stage (only if no milestones exist)</summary>
    [HttpDelete("teacher/stages/{stageId}")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> DeleteStage(int stageId)
    {
        var stage = await _db.ClassLearningStages
            .Include(s => s.ClassSkillOffering)
                .ThenInclude(o => o.Class)
            .Include(s => s.Milestones)
            .FirstOrDefaultAsync(s => s.Id == stageId);
        if (stage == null) return NotFound("Không tìm thấy giai đoạn học tập.");

        var offering = stage.ClassSkillOffering;
        var userId = GetUserId();
        var hasAccess = offering.TeacherId == userId || offering.Class.TeacherId == userId || User.IsInRole("Admin");
        if (!hasAccess) return Forbid();

        if (stage.Milestones.Any())
        {
            return BadRequest("Không thể xóa giai đoạn đang chứa các mốc học tập. Vui lòng xóa các mốc học tập trước.");
        }

        _db.ClassLearningStages.Remove(stage);
        await _db.SaveChangesAsync();

        return Ok(new { Message = "Đã xóa giai đoạn học tập thành công." });
    }

    /// <summary>Teacher/Admin: create a milestone within a stage</summary>
    [HttpPost("teacher/stages/{stageId}/milestones")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> CreateMilestone(int stageId, [FromBody] CreateMilestoneDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Tên mốc học tập không được để trống.");

        var stage = await _db.ClassLearningStages
            .Include(s => s.ClassSkillOffering)
                .ThenInclude(o => o.Class)
            .FirstOrDefaultAsync(s => s.Id == stageId);
        if (stage == null) return NotFound("Không tìm thấy giai đoạn học tập.");

        var offering = stage.ClassSkillOffering;
        var userId = GetUserId();
        var hasAccess = offering.TeacherId == userId || offering.Class.TeacherId == userId || User.IsInRole("Admin");
        if (!hasAccess) return Forbid();

        var maxOrder = await _db.LearningMilestones
            .Where(m => m.ClassLearningStageId == stageId)
            .MaxAsync(m => (int?)m.SortOrder) ?? 0;

        var milestone = new LearningMilestone
        {
            ClassLearningStageId = stageId,
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            SortOrder = dto.SortOrder ?? (maxOrder + 1)
        };

        _db.LearningMilestones.Add(milestone);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            milestone.Id,
            milestone.ClassLearningStageId,
            milestone.Name,
            milestone.Description,
            milestone.SortOrder
        });
    }

    /// <summary>Teacher/Admin: update a milestone</summary>
    [HttpPut("teacher/milestones/{milestoneId}")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> UpdateMilestone(int milestoneId, [FromBody] UpdateMilestoneDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Tên mốc học tập không được để trống.");

        var milestone = await _db.LearningMilestones
            .Include(m => m.ClassLearningStage)
                .ThenInclude(s => s.ClassSkillOffering)
                    .ThenInclude(o => o.Class)
            .FirstOrDefaultAsync(m => m.Id == milestoneId);
        if (milestone == null) return NotFound("Không tìm thấy mốc học tập.");

        var offering = milestone.ClassLearningStage.ClassSkillOffering;
        var userId = GetUserId();
        var hasAccess = offering.TeacherId == userId || offering.Class.TeacherId == userId || User.IsInRole("Admin");
        if (!hasAccess) return Forbid();

        milestone.Name = dto.Name.Trim();
        milestone.Description = dto.Description?.Trim();
        milestone.SortOrder = dto.SortOrder;

        await _db.SaveChangesAsync();

        return Ok(new
        {
            milestone.Id,
            milestone.ClassLearningStageId,
            milestone.Name,
            milestone.Description,
            milestone.SortOrder
        });
    }

    /// <summary>Teacher/Admin: delete a milestone (only if no student progress records exist)</summary>
    [HttpDelete("teacher/milestones/{milestoneId}")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> DeleteMilestone(int milestoneId)
    {
        var milestone = await _db.LearningMilestones
            .Include(m => m.ClassLearningStage)
                .ThenInclude(s => s.ClassSkillOffering)
                    .ThenInclude(o => o.Class)
            .FirstOrDefaultAsync(m => m.Id == milestoneId);
        if (milestone == null) return NotFound("Không tìm thấy mốc học tập.");

        var offering = milestone.ClassLearningStage.ClassSkillOffering;
        var userId = GetUserId();
        var hasAccess = offering.TeacherId == userId || offering.Class.TeacherId == userId || User.IsInRole("Admin");
        if (!hasAccess) return Forbid();

        var hasProgress = await _db.StudentMilestoneProgresses
            .AnyAsync(p => p.LearningMilestoneId == milestoneId);
        if (hasProgress)
        {
            return BadRequest("Không thể xóa mốc học tập đã có dữ liệu tiến độ của học sinh.");
        }

        _db.LearningMilestones.Remove(milestone);
        await _db.SaveChangesAsync();

        return Ok(new { Message = "Đã xóa mốc học tập thành công." });
    }
}

public class UpdateStageDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}

public class UpdateMilestoneDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
}
