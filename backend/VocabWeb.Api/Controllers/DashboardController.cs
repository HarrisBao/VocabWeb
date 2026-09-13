using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocabWeb.Api.Data;
using VocabWeb.Api.DTOs;

namespace VocabWeb.Api.Controllers;

[ApiController]
[Route("api/teacher/[controller]")]
[Authorize(Roles = "Teacher")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public DashboardController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboardStats()
    {
        var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var sets = await _db.VocabularySets
            .Where(s => s.TeacherId == teacherId && !s.IsArchived)
            .Include(s => s.Items)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        var classes = await _db.Classes
            .Where(c => c.TeacherId == teacherId && !c.IsArchived)
            .Include(c => c.Lessons)
            .Include(c => c.Members)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        var tests = await _db.Tests
            .Where(t => t.TeacherId == teacherId && !t.IsArchived)
            .Include(t => t.VocabularySet)
            .Include(t => t.Class)
            .Include(t => t.Attempts)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        var stats = new DashboardStatsDto
        {
            TotalVocabularySets = sets.Count,
            TotalClasses = classes.Count,
            TotalTests = tests.Count,
            TotalWords = sets.Sum(s => s.Items.Count),

            RecentVocabularySets = sets.Take(4).Select(s => new VocabularySetDto
            {
                Id = s.Id,
                Title = s.Title,
                Description = s.Description,
                Level = s.Level,
                IsPublic = s.IsPublic,
                WordCount = s.Items.Count,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
            }).ToList(),

            RecentClasses = classes.Take(4).Select(c => new ClassDto
            {
                Id = c.Id,
                Name = c.Name,
                Code = c.Code,
                Description = c.Description,
                FixedLinkToken = c.FixedLinkToken,
                LessonCount = c.Lessons.Count,
                MemberCount = c.Members.Count,
                CreatedAt = c.CreatedAt
            }).ToList(),

            RecentTests = tests.Take(4).Select(t => new TestDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                VocabularySetId = t.VocabularySetId,
                VocabularySetTitle = t.VocabularySet?.Title ?? string.Empty,
                ClassId = t.ClassId,
                ClassName = t.Class?.Name,
                EnabledTypes = t.EnabledTypes.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList(),
                TotalQuestions = t.TotalQuestions,
                PassScore = t.PassScore,
                TimeLimitMinutes = t.TimeLimitMinutes,
                AttemptCount = t.Attempts.Count,
                CreatedAt = t.CreatedAt
            }).ToList()
        };

        return Ok(stats);
    }
}
