using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocabWeb.Api.Data;
using VocabWeb.Api.DTOs;
using VocabWeb.Api.Models;

namespace VocabWeb.Api.Controllers;

[ApiController]
[Route("api/teacher/[controller]")]
[Authorize(Roles = "Teacher,TA")]
public class ClassController : ControllerBase
{
    private readonly AppDbContext _db;

    public ClassController(AppDbContext db)
    {
        _db = db;
    }

        private async Task<bool> HasAccessToClass(int classId, bool requireOwnership = false)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return false;
        
        if (requireOwnership) 
        {
            return await _db.Classes.AnyAsync(c => c.Id == classId && c.TeacherId == teacherId);
        }

        return await _db.Classes.AnyAsync(c => c.Id == classId && (c.TeacherId == teacherId || _db.ClassStaffAssignments.Any(sa => sa.ClassId == classId && sa.UserId == teacherId)));
    }

    private string? GetTeacherId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

    [HttpGet]
    public async Task<IActionResult> GetClasses()
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var list = await _db.Classes
            .Where(c => (c.TeacherId == teacherId || _db.ClassStaffAssignments.Any(sa => sa.ClassId == c.Id && sa.UserId == teacherId)) && !c.IsArchived)
            .Include(c => c.Lessons)
            .Include(c => c.Members)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new ClassDto
            {
                Id = c.Id,
                Name = c.Name,
                Code = c.Code,
                Description = c.Description,
                FixedLinkToken = c.FixedLinkToken,
                FixedLinkUrl = $"/class/{c.FixedLinkToken}",
                LessonCount = c.Lessons.Count,
                MemberCount = _db.ClassEnrollments.Count(ce => ce.ClassId == c.Id),
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetClass(int id)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var cls = await _db.Classes
            .Where(c => c.Id == id && (c.TeacherId == teacherId || _db.ClassStaffAssignments.Any(sa => sa.ClassId == c.Id && sa.UserId == teacherId)) && !c.IsArchived)
            .Include(c => c.Lessons)
                .ThenInclude(l => l.VocabularySet)
                    .ThenInclude(vs => vs.Items)
            .FirstOrDefaultAsync();

        if (cls == null) return NotFound(new { message = "Không tìm thấy lớp học." });

        return Ok(new ClassDto
        {
            Id = cls.Id,
            Name = cls.Name,
            Code = cls.Code,
            Description = cls.Description,
            FixedLinkToken = cls.FixedLinkToken,
            FixedLinkUrl = $"/class/{cls.FixedLinkToken}",
            LessonCount = cls.Lessons.Count,
            MemberCount = _db.ClassEnrollments.Count(ce => ce.ClassId == cls.Id),
            CreatedAt = cls.CreatedAt,
            Lessons = cls.Lessons
                .OrderByDescending(l => l.IsPinned)
                .ThenBy(l => l.OrderIndex)
                .Select(l => new ClassLessonDto
                {
                    Id = l.Id,
                    ClassId = l.ClassId,
                    VocabularySetId = l.VocabularySetId,
                    VocabularySetTitle = l.VocabularySet.Title,
                    VocabularySetLevel = l.VocabularySet.Level,
                    WordCount = l.VocabularySet.Items.Count,
                    IsPinned = l.IsPinned,
                    IsHidden = l.IsHidden,
                    OrderIndex = l.OrderIndex,
                    AddedAt = l.AddedAt
                }).ToList(),
            Members = _db.ClassEnrollments
                .Include(ce => ce.StudentProfile)
                .Where(ce => ce.ClassId == cls.Id)
                .OrderBy(ce => ce.JoinedAt)
                .Select(m => new ClassMemberDto
                {
                    Id = m.Id,
                    StudentProfileId = m.StudentProfileId,
                    FullName = m.StudentProfile.FullName,
                    Phone = m.StudentProfile.NormalizedPhone,
                    UserId = m.StudentProfile.UserId,
                    JoinedAt = m.JoinedAt
                }).ToList()
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateClass([FromBody] CreateClassDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        // Generate class code if not provided
        var code = !string.IsNullOrWhiteSpace(dto.Code)
            ? dto.Code.Trim().ToUpperInvariant()
            : "ITL-" + Guid.NewGuid().ToString("N")[..6].ToUpperInvariant();

        // Check code uniqueness
        var codeExists = await _db.Classes.AnyAsync(c => c.Code == code);
        if (codeExists)
        {
            code = "ITL-" + Guid.NewGuid().ToString("N")[..6].ToUpperInvariant();
        }

        var cls = new Class
        {
            Name = dto.Name.Trim(),
            Code = code,
            Description = dto.Description?.Trim(),
            FixedLinkToken = Guid.NewGuid().ToString("N"),
            TeacherId = teacherId,
            CreatedAt = DateTime.UtcNow
        };

        _db.Classes.Add(cls);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetClass), new { id = cls.Id }, new ClassDto
        {
            Id = cls.Id,
            Name = cls.Name,
            Code = cls.Code,
            Description = cls.Description,
            FixedLinkToken = cls.FixedLinkToken,
            FixedLinkUrl = $"/class/{cls.FixedLinkToken}",
            LessonCount = 0,
            MemberCount = 0,
            CreatedAt = cls.CreatedAt
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateClass(int id, [FromBody] CreateClassDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var cls = await _db.Classes
            .Where(c => c.Id == id && c.TeacherId == teacherId && !c.IsArchived)
            .FirstOrDefaultAsync();

        if (cls == null) return NotFound(new { message = "KhÃ´ng tÃ¬m tháº¥y lá»›p há»c." });

        cls.Name = dto.Name.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Code))
        {
            cls.Code = dto.Code.Trim().ToUpperInvariant();
        }
        cls.Description = dto.Description?.Trim();
        cls.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok(new { message = "Cáº­p nháº­t thÃ´ng tin lá»›p thÃ nh cÃ´ng." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteClass(int id)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var cls = await _db.Classes
            .Where(c => c.Id == id && c.TeacherId == teacherId && !c.IsArchived)
            .FirstOrDefaultAsync();

        if (cls == null) return NotFound(new { message = "KhÃ´ng tÃ¬m tháº¥y lá»›p há»c." });

        cls.IsArchived = true;
        cls.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "ÄÃ£ xÃ³a lá»›p há»c thÃ nh cÃ´ng." });
    }

    [HttpPost("{id}/lessons")]
    public async Task<IActionResult> AssignLesson(int id, [FromBody] AssignLessonDto dto)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var cls = await _db.Classes
            .Where(c => c.Id == id && c.TeacherId == teacherId && !c.IsArchived)
            .FirstOrDefaultAsync();

        if (cls == null) return NotFound(new { message = "KhÃ´ng tÃ¬m tháº¥y lá»›p há»c." });

        var set = await _db.VocabularySets
            .Where(s => s.Id == dto.VocabularySetId && s.TeacherId == teacherId && !s.IsArchived)
            .FirstOrDefaultAsync();

        if (set == null) return BadRequest(new { message = "Bá»™ tá»« vá»±ng khÃ´ng há»£p lá»‡ hoáº·c khÃ´ng thuá»™c quyá»n sá»Ÿ há»¯u cá»§a báº¡n." });

        var alreadyAssigned = await _db.ClassLessons
            .AnyAsync(l => l.ClassId == id && l.VocabularySetId == dto.VocabularySetId);

        if (alreadyAssigned)
        {
            return BadRequest(new { message = "Bá»™ tá»« vá»±ng nÃ y Ä‘Ã£ Ä‘Æ°á»£c thÃªm vÃ o lá»›p há»c." });
        }

        var maxOrder = await _db.ClassLessons
            .Where(l => l.ClassId == id)
            .Select(l => (int?)l.OrderIndex)
            .MaxAsync() ?? 0;

        var lesson = new ClassLesson
        {
            ClassId = id,
            VocabularySetId = dto.VocabularySetId,
            IsPinned = dto.IsPinned,
            IsHidden = false,
            OrderIndex = maxOrder + 1,
            AddedAt = DateTime.UtcNow
        };

        _db.ClassLessons.Add(lesson);
        await _db.SaveChangesAsync();

        return Ok(new { message = "ThÃªm bá»™ tá»« vá»±ng vÃ o lá»›p thÃ nh cÃ´ng." });
    }

    [HttpDelete("{id}/lessons/{lessonId}")]
    public async Task<IActionResult> RemoveLesson(int id, int lessonId)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var lesson = await _db.ClassLessons
            .Include(l => l.Class)
            .FirstOrDefaultAsync(l => l.Id == lessonId && l.ClassId == id && l.Class.TeacherId == teacherId);

        if (lesson == null) return NotFound(new { message = "KhÃ´ng tÃ¬m tháº¥y bÃ i há»c trong lá»›p." });

        _db.ClassLessons.Remove(lesson);
        await _db.SaveChangesAsync();

        return Ok(new { message = "ÄÃ£ gá»¡ bÃ i há»c khá»i lá»›p." });
    }

    [HttpPut("{id}/lessons/{lessonId}/pin")]
    public async Task<IActionResult> TogglePinLesson(int id, int lessonId)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var lesson = await _db.ClassLessons
            .Include(l => l.Class)
            .FirstOrDefaultAsync(l => l.Id == lessonId && l.ClassId == id && l.Class.TeacherId == teacherId);

        if (lesson == null) return NotFound(new { message = "KhÃ´ng tÃ¬m tháº¥y bÃ i há»c trong lá»›p." });

        lesson.IsPinned = !lesson.IsPinned;
        await _db.SaveChangesAsync();

        return Ok(new { isPinned = lesson.IsPinned, message = lesson.IsPinned ? "ÄÃ£ ghim bÃ i há»c." : "ÄÃ£ bá» ghim bÃ i há»c." });
    }

    [HttpPut("{id}/lessons/{lessonId}/visibility")]
    public async Task<IActionResult> ToggleLessonVisibility(int id, int lessonId)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var lesson = await _db.ClassLessons
            .Include(l => l.Class)
            .FirstOrDefaultAsync(l => l.Id == lessonId && l.ClassId == id && l.Class.TeacherId == teacherId);

        if (lesson == null) return NotFound(new { message = "KhÃ´ng tÃ¬m tháº¥y bÃ i há»c trong lá»›p." });

        lesson.IsHidden = !lesson.IsHidden;
        await _db.SaveChangesAsync();

        return Ok(new { isHidden = lesson.IsHidden, message = lesson.IsHidden ? "ÄÃ£ áº©n bÃ i há»c khá»i há»c sinh." : "ÄÃ£ hiá»ƒn thá»‹ bÃ i há»c." });
    }
    [HttpGet("{id}/enrollments")]
    public async Task<IActionResult> GetEnrollments(int id)
    {
        if (!await HasAccessToClass(id)) return Forbid();
        var enrollments = await _db.ClassEnrollments
            .Include(ce => ce.StudentProfile)
            .Where(ce => ce.ClassId == id)
            .Select(ce => new ClassEnrollmentDto
            {
                Id = ce.Id,
                StudentProfileId = ce.StudentProfileId,
                FullName = ce.StudentProfile.FullName,
                Phone = ce.StudentProfile.NormalizedPhone,
                UserId = ce.StudentProfile.UserId,
                JoinedAt = ce.JoinedAt
            })
            .ToListAsync();
        return Ok(enrollments);
    }

    [HttpPost("{id}/students/no-account")]
    public async Task<IActionResult> AddNoAccountStudent(int id, [FromBody] NoAccountStudentDto dto)
    {
        if (!await HasAccessToClass(id)) return Forbid();
        var cls = await _db.Classes.FindAsync(id);
        if (cls == null) return NotFound("Class not found");

        var normalizedPhone = dto.Phone.Trim().Replace(" ", "").Replace("-", "");
        if (!normalizedPhone.StartsWith("+"))
        {
            if (normalizedPhone.StartsWith("0"))
                normalizedPhone = "+84" + normalizedPhone.Substring(1);
            else
                normalizedPhone = "+" + normalizedPhone;
        }

        var profile = await _db.StudentProfiles.FirstOrDefaultAsync(sp => sp.NormalizedPhone == normalizedPhone);
        if (profile == null)
        {
            profile = new StudentProfile
            {
                FullName = dto.FullName,
                NormalizedPhone = normalizedPhone,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _db.StudentProfiles.Add(profile);
            await _db.SaveChangesAsync();
        }
        else
        {
            // Optional: update name if provided? Let's just keep existing profile.
        }

        var enrollment = await _db.ClassEnrollments.FirstOrDefaultAsync(ce => ce.ClassId == id && ce.StudentProfileId == profile.Id);
        if (enrollment == null)
        {
            enrollment = new ClassEnrollment
            {
                ClassId = id,
                StudentProfileId = profile.Id,
                JoinedAt = DateTime.UtcNow
            };
            _db.ClassEnrollments.Add(enrollment);
            await _db.SaveChangesAsync();
        }

        return Ok(new ClassEnrollmentDto
        {
            Id = enrollment.Id,
            StudentProfileId = profile.Id,
            FullName = profile.FullName,
            Phone = profile.NormalizedPhone,
            UserId = profile.UserId,
            JoinedAt = enrollment.JoinedAt
        });
    }

    [HttpGet("{id}/sessions")]
    public async Task<IActionResult> GetSessions(int id)
    {
        if (!await HasAccessToClass(id)) return Forbid();
        var sessions = await _db.ClassSessions
            .Include(cs => cs.AttendanceRecords)
            .Include(cs => cs.Tests).ThenInclude(cst => cst.Test)
            .Where(cs => cs.ClassId == id)
            .OrderByDescending(cs => cs.SessionDate)
            .ToListAsync();
            
        var dtos = new List<ClassSessionDto>();
        foreach (var cs in sessions)
        {
            var eligibleEnrollmentIds = await _db.ClassEnrollments
                .Where(ce => ce.ClassId == id && ce.JoinedAt.Date <= cs.SessionDate.Date)
                .Select(ce => ce.Id)
                .ToListAsync();

            var activities = new List<SessionActivityStatsDto>();
            foreach (var cst in cs.Tests)
            {
                var completedEnrollmentIds = await _db.TestAttempts
                    .Where(ta => ta.TestId == cst.TestId && ta.Status == "SUBMITTED" && ta.ClassEnrollmentId != null && eligibleEnrollmentIds.Contains(ta.ClassEnrollmentId.Value))
                    .Select(ta => (int)ta.ClassEnrollmentId!)
                    .Distinct()
                    .ToListAsync();
                    
                activities.Add(new SessionActivityStatsDto
                {
                    TestId = cst.TestId,
                    Title = cst.Test.Title,
                    TotalStudents = eligibleEnrollmentIds.Count,
                    CompletedCount = completedEnrollmentIds.Count,
                    NotCompletedCount = eligibleEnrollmentIds.Count - completedEnrollmentIds.Count,
                    CompletedEnrollmentIds = completedEnrollmentIds
                });
            }

            dtos.Add(new ClassSessionDto
            {
                Id = cs.Id,
                ClassId = cs.ClassId,
                SessionDate = cs.SessionDate,
                Title = cs.Title,
                AttendanceRecords = cs.AttendanceRecords.Select(ar => new AttendanceRecordDto
                {
                    Id = ar.Id,
                    ClassEnrollmentId = ar.ClassEnrollmentId,
                    Status = ar.Status
                }).ToList(),
                Activities = activities
            });
        }
            
        return Ok(dtos);
    }

    [HttpPost("{id}/sessions")]
    public async Task<IActionResult> CreateSession(int id, [FromBody] ClassSessionCreateDto dto)
    {
        if (!await HasAccessToClass(id)) return Forbid();
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var session = new ClassSession
        {
            ClassId = id,
            SessionDate = dto.SessionDate,
            Title = dto.Title,
            CreatedById = userId,
            CreatedAt = DateTime.UtcNow
        };
        _db.ClassSessions.Add(session);
        await _db.SaveChangesAsync();

        if (dto.TestId.HasValue)
        {
            var cst = new ClassSessionTest
            {
                ClassSessionId = session.Id,
                TestId = dto.TestId.Value,
                AssignedAt = DateTime.UtcNow
            };
            _db.ClassSessionTests.Add(cst);
            await _db.SaveChangesAsync();
        }

        return Ok(new ClassSessionDto
        {
            Id = session.Id,
            ClassId = session.ClassId,
            SessionDate = session.SessionDate,
            Title = session.Title
        });
    }

    [HttpPut("{id}/sessions/{sessionId}/attendance")]
    public async Task<IActionResult> UpdateAttendance(int id, int sessionId, [FromBody] AttendanceUpdateDto dto)
    {
        if (!await HasAccessToClass(id)) return Forbid();
        var session = await _db.ClassSessions.FirstOrDefaultAsync(cs => cs.Id == sessionId && cs.ClassId == id);
        if (session == null) return NotFound();

        var record = await _db.AttendanceRecords.FirstOrDefaultAsync(ar => ar.ClassSessionId == sessionId && ar.ClassEnrollmentId == dto.ClassEnrollmentId);
        
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (record == null)
        {
            record = new AttendanceRecord
            {
                ClassSessionId = sessionId,
                ClassEnrollmentId = dto.ClassEnrollmentId,
                Status = dto.Status,
                UpdatedById = userId,
                UpdatedAt = DateTime.UtcNow
            };
            _db.AttendanceRecords.Add(record);
        }
        else
        {
            record.Status = dto.Status;
            record.UpdatedById = userId;
            record.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return Ok();
    }
    [HttpGet("{id}/tas")]
    public async Task<IActionResult> GetTas(int id)
    {
        if (!await HasAccessToClass(id, true)) return Forbid(); // Require ownership
        
        var tas = await _db.ClassStaffAssignments
            .Include(csa => csa.User)
            .Where(csa => csa.ClassId == id && csa.StaffRole == "TA")
            .Select(csa => new TaUserDto
            {
                UserId = csa.UserId,
                FullName = csa.User.FullName,
                Email = csa.User.Email ?? "",
                AvatarUrl = csa.User.AvatarUrl
            })
            .ToListAsync();
            
        return Ok(tas);
    }

    [HttpPost("{id}/tas")]
    public async Task<IActionResult> AssignTa(int id, [FromBody] AssignTaDto dto)
    {
        if (!await HasAccessToClass(id, true)) return Forbid(); // Require ownership
        
        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
        
        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng với email này." });
        
        // Ensure user is TA
        var userManager = HttpContext.RequestServices.GetRequiredService<Microsoft.AspNetCore.Identity.UserManager<ApplicationUser>>();
        var isTa = await userManager.IsInRoleAsync(user, "TA");
        if (!isTa) return BadRequest(new { message = "Người dùng này không có quyền Trợ giảng (TA)." });

        var alreadyAssigned = await _db.ClassStaffAssignments
            .AnyAsync(csa => csa.ClassId == id && csa.UserId == user.Id && csa.StaffRole == "TA");
            
        if (alreadyAssigned) return BadRequest(new { message = "Trợ giảng này đã được gán vào lớp." });

        _db.ClassStaffAssignments.Add(new ClassStaffAssignment
        {
            ClassId = id,
            UserId = user.Id,
            StaffRole = "TA"
        });
        
        await _db.SaveChangesAsync();
        return Ok(new { message = "Đã gán trợ giảng thành công." });
    }

    [HttpDelete("{id}/tas/{userId}")]
    public async Task<IActionResult> RemoveTa(int id, string userId)
    {
        if (!await HasAccessToClass(id, true)) return Forbid(); // Require ownership
        
        var assignment = await _db.ClassStaffAssignments
            .FirstOrDefaultAsync(csa => csa.ClassId == id && csa.UserId == userId && csa.StaffRole == "TA");
            
        if (assignment == null) return NotFound(new { message = "Không tìm thấy trợ giảng này trong lớp." });
        
        _db.ClassStaffAssignments.Remove(assignment);
        await _db.SaveChangesAsync();
        
        return Ok(new { message = "Đã gỡ trợ giảng khỏi lớp." });
    }
}
