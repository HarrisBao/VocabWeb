using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VocabWeb.Api.Data;
using VocabWeb.Api.DTOs.Schedule;
using VocabWeb.Api.Models;

namespace VocabWeb.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScheduleController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;

    public ScheduleController(AppDbContext db, UserManager<ApplicationUser> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

    private async Task<bool> IsAdminOrTA(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;
        return await _userManager.IsInRoleAsync(user, "Admin") || await _userManager.IsInRoleAsync(user, "TA") || await _userManager.IsInRoleAsync(user, "Teacher");
    }

    [HttpGet("requests")]
    [Authorize]
    public async Task<IActionResult> GetRequests([FromQuery] string status = "PENDING")
    {
        var userId = GetUserId();
        if (userId == null || !await IsAdminOrTA(userId)) return Forbid();

        var isAdmin = await _userManager.IsInRoleAsync(await _userManager.FindByIdAsync(userId), "Admin");

        var q = _db.StudentScheduleRequests
            .Include(r => r.StudentProfile)
            .Include(r => r.ClassEnrollment).ThenInclude(ce => ce.Class)
            .AsQueryable();

        if (status != "ALL")
        {
            if (Enum.TryParse<RequestStatus>(status, out var reqStatus))
            {
                q = q.Where(r => r.Status == reqStatus);
            }
        }

        if (!isAdmin)
        {
            // Filter by classes this user is assigned to
            var allowedClassIds = await _db.ClassStaffAssignments
                .Where(csa => csa.UserId == userId)
                .Select(csa => csa.ClassId)
                .ToListAsync();

            q = q.Where(r => allowedClassIds.Contains(r.ClassEnrollment.ClassId));
        }

        var results = await q.OrderByDescending(r => r.CreatedAt).Select(r => new
        {
            r.Id,
            StudentName = r.StudentProfile.FullName,
            StudentPhone = r.StudentProfile.NormalizedPhone,
            ClassName = r.ClassEnrollment.Class.Name,
            Skill = r.Skill.ToString(),
            RequestType = r.RequestType.ToString(),
            r.Reason,
            r.Availability,
            Status = r.Status.ToString(),
            r.CreatedAt,
            Source = r.Source.ToString()
        }).ToListAsync();

        return Ok(results);
    }

    [HttpPost("requests")]
    [Authorize]
    public async Task<IActionResult> CreateRequestByStaff([FromBody] AdminCreateScheduleRequestDto dto)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
        var isTA = await _userManager.IsInRoleAsync(user, "TA");
        
        if (!isAdmin && !isTA) return Forbid();

        if (!isAdmin)
        {
            var isAssigned = await _db.ClassStaffAssignments.AnyAsync(csa => csa.UserId == userId && csa.ClassId == dto.ClassId);
            if (!isAssigned) return Forbid();
        }

        var enrollment = await _db.ClassEnrollments
            .FirstOrDefaultAsync(ce => ce.StudentProfileId == dto.StudentProfileId && ce.ClassId == dto.ClassId && ce.IsActive);
            
        if (enrollment == null) return BadRequest(new { message = "Học sinh không ở trong lớp này." });

        var req = new StudentScheduleRequest
        {
            StudentProfileId = dto.StudentProfileId,
            ClassEnrollmentId = enrollment.Id,
            Skill = dto.Skill,
            RequestType = dto.RequestType,
            AffectedSessionId = dto.AffectedSessionId,
            EffectiveFrom = dto.EffectiveFrom,
            EffectiveTo = dto.EffectiveTo,
            Reason = dto.Reason,
            Availability = dto.Availability,
            Source = isAdmin ? RequestSource.ADMIN_DIRECT : RequestSource.TA_DIRECT,
            CreatedByUserId = userId
        };

        _db.StudentScheduleRequests.Add(req);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã tạo yêu cầu.", id = req.Id });
    }

    [HttpGet("search-candidates")]
    [Authorize]
    public async Task<IActionResult> SearchCandidates([FromQuery] string skill)
    {
        if (!Enum.TryParse<IeltsSkill>(skill, out var s)) return BadRequest();
        
        // Find classes that teach this skill
        var candidates = await _db.ClassSkillSchedules
            .Include(css => css.Class)
            .Where(css => css.Skill == s && !css.Class.IsArchived)
            .Select(css => new
            {
                ClassId = css.ClassId,
                ClassName = css.Class.Name,
                DayOfWeek = css.DayOfWeek.ToString(),
                StartTime = css.StartTime.ToString(@"hh\:mm"),
                EndTime = css.EndTime.ToString(@"hh\:mm")
            })
            .ToListAsync();

        return Ok(candidates);
    }

    [HttpPost("requests/{id}/resolve")]
    [Authorize]
    public async Task<IActionResult> ResolveRequest(int id, [FromBody] ResolveScheduleRequestDto dto)
    {
        var userId = GetUserId();
        var user = await _userManager.FindByIdAsync(userId);
        var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");

        var req = await _db.StudentScheduleRequests
            .Include(r => r.ClassEnrollment)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (req == null) return NotFound();

        if (req.RequestType == RequestType.PERMANENT_TRANSFER && !isAdmin)
        {
            return Forbid();
        }

        if (dto.Status == RequestStatus.RESOLVED)
        {
            if (req.RequestType == RequestType.MAKEUP && dto.TargetSessionId.HasValue)
            {
                var overrideSession = new StudentSessionOverride
                {
                    ClassEnrollmentId = req.ClassEnrollmentId,
                    OriginalSessionId = req.AffectedSessionId ?? 0,
                    TargetSessionId = dto.TargetSessionId.Value,
                    Type = RequestType.MAKEUP,
                    CreatedByUserId = userId
                };
                _db.StudentSessionOverrides.Add(overrideSession);
            }
            else if (dto.TargetClassId.HasValue)
            {
                var assignment = new EnrollmentSkillAssignment
                {
                    ClassEnrollmentId = req.ClassEnrollmentId,
                    Skill = req.Skill,
                    SourceClassId = req.ClassEnrollment.ClassId,
                    TargetClassId = dto.TargetClassId.Value,
                    AssignmentType = req.RequestType,
                    EffectiveFrom = req.EffectiveFrom,
                    EffectiveTo = req.EffectiveTo,
                    CreatedByUserId = userId
                };
                _db.EnrollmentSkillAssignments.Add(assignment);
            }
            
            // Notify student
            var notification = new StudentNotification
            {
                StudentProfileId = req.StudentProfileId,
                Type = "SCHEDULE_CHANGED",
                Message = $"Lịch {req.Skill} của bạn đã được điều chỉnh. Vui lòng xem chi tiết lịch thay thế trong danh sách lớp học.",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            _db.StudentNotifications.Add(notification);
        }

        req.Status = dto.Status;
        req.ResolvedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Đã xử lý yêu cầu." });
    }
}
