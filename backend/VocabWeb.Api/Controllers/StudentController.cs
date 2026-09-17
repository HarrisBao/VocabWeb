using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VocabWeb.Api.Data;
using VocabWeb.Api.DTOs.Learn;

namespace VocabWeb.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentController : ControllerBase
{
    private readonly AppDbContext _db;

    public StudentController(AppDbContext db)
    {
        _db = db;
    }

    private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpGet("classes")]
    [Authorize]
    public async Task<IActionResult> GetMyClasses()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var profile = await _db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == userId);
        if (profile == null) return Ok(new List<object>());

        var enrollments = await _db.ClassEnrollments
            .Include(ce => ce.Class)
            .Where(ce => ce.StudentProfileId == profile.Id && ce.IsActive && !ce.Class.IsArchived)
            .OrderByDescending(ce => ce.JoinedAt)
            .Select(ce => new
            {
                Id = ce.Class.Id,
                Name = ce.Class.Name,
                Code = ce.Class.Code,
                Description = ce.Class.Description,
                JoinedAt = ce.JoinedAt
            })
            .ToListAsync();

        return Ok(enrollments);
    }

    [HttpGet("classes/{id}")]
    [Authorize]
    public async Task<IActionResult> GetClassDetail(int id)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var profile = await _db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == userId);
        if (profile == null) return Forbid();

        var enrollment = await _db.ClassEnrollments
            .Include(ce => ce.Class)
                .ThenInclude(c => c.Lessons.Where(l => !l.IsHidden))
                    .ThenInclude(l => l.VocabularySet)
            .FirstOrDefaultAsync(ce => ce.StudentProfileId == profile.Id && ce.ClassId == id && ce.IsActive && !ce.Class.IsArchived);

        if (enrollment == null) return Forbid();

        var cls = enrollment.Class;

        var dto = new 
        {
            Id = cls.Id,
            Name = cls.Name,
            Code = cls.Code,
            Description = cls.Description,
            VocabularyCount = cls.Lessons.Count,
            ReadingCount = await _db.ReadingAssignments.CountAsync(r => r.Status == "PUBLISHED" && r.ClassAssignments.Any(ca => ca.ClassId == id && ca.IsActive)),
            WritingCount = 0 // Mock for now
        };

        return Ok(dto);
    }

    [HttpGet("classes/{id}/vocabulary")]
    [Authorize]
    public async Task<IActionResult> GetClassVocabulary(int id)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var profile = await _db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == userId);
        if (profile == null) return Forbid();

        var enrollment = await _db.ClassEnrollments
            .Include(ce => ce.Class)
                .ThenInclude(c => c.Lessons.Where(l => !l.IsHidden))
                    .ThenInclude(l => l.VocabularySet)
                        .ThenInclude(vs => vs.Items)
            .FirstOrDefaultAsync(ce => ce.StudentProfileId == profile.Id && ce.ClassId == id && ce.IsActive && !ce.Class.IsArchived);

        if (enrollment == null) return Forbid();

        var lessons = enrollment.Class.Lessons
            .OrderByDescending(l => l.IsPinned)
            .ThenBy(l => l.OrderIndex)
            .Select(l => new 
            {
                Id = l.VocabularySetId,
                Title = l.VocabularySet.Title,
                Description = l.VocabularySet.Description,
                Level = l.VocabularySet.Level,
                WordCount = l.VocabularySet.Items.Count,
                IsPinned = l.IsPinned,
                OrderIndex = l.OrderIndex
            }).ToList();

        return Ok(lessons);
    }

    [HttpGet("classes/{id}/reading")]
    [Authorize]
    public async Task<IActionResult> GetClassReading(int id)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var profile = await _db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == userId);
        if (profile == null) return Forbid();

        var enrollment = await _db.ClassEnrollments
            .FirstOrDefaultAsync(ce => ce.StudentProfileId == profile.Id && ce.ClassId == id && ce.IsActive);

        if (enrollment == null) return Forbid();

        var readings = await _db.ReadingAssignments
            .Where(r => r.Status == "PUBLISHED" && r.ClassAssignments.Any(ca => ca.ClassId == id && ca.IsActive))
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new 
            {
                Id = r.Id,
                Title = r.Title,
                DurationMinutes = r.DurationMinutes,
                QuestionCount = r.QuestionGroups.SelectMany(g => g.Questions).Count(),
                // Count attempts from this specific student
                AttemptCount = r.Attempts.Count(a => a.ClassEnrollmentId == enrollment.Id && a.SubmittedAt != null)
            })
            .ToListAsync();

        return Ok(readings);
    }
}
