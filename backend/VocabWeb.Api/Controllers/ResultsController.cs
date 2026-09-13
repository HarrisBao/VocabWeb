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
public class ResultsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ResultsController(AppDbContext db)
    {
        _db = db;
    }

    private string? GetTeacherId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

    [HttpGet]
    public async Task<IActionResult> GetTeacherResultsOverview()
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var teacherTestIds = await _db.Tests
            .Where(t => t.TeacherId == teacherId && !t.IsArchived)
            .Select(t => t.Id)
            .ToListAsync();

        var attempts = await _db.TestAttempts
            .Where(a => teacherTestIds.Contains(a.TestId))
            .Include(a => a.Test)
            .Include(a => a.Student)
            .OrderByDescending(a => a.SubmittedAt ?? a.StartedAt)
            .ToListAsync();

        var overview = new TeacherResultsOverviewDto
        {
            TotalAttempts = attempts.Count,
            AverageScore = attempts.Count > 0 ? Math.Round(attempts.Average(a => a.Score), 1) : null,
            PassRate = attempts.Count > 0
                ? Math.Round((decimal)attempts.Count(a => a.Score >= a.Test.PassScore) / attempts.Count * 100, 1)
                : null,
            RecentAttempts = attempts.Take(20).Select(a => new TestAttemptSummaryDto
            {
                Id = a.Id,
                TestId = a.TestId,
                TestTitle = a.Test.Title,
                StudentId = a.StudentId,
                StudentName = a.Student.FullName,
                StudentEmail = a.Student.Email ?? string.Empty,
                Score = a.Score,
                CorrectCount = a.CorrectCount,
                TotalQuestions = a.TotalQuestions,
                DurationSeconds = a.DurationSeconds,
                StartedAt = a.StartedAt,
                SubmittedAt = a.SubmittedAt,
                IsPassed = a.Score >= a.Test.PassScore
            }).ToList()
        };

        return Ok(overview);
    }

    [HttpGet("/api/teacher/tests/{testId}/results")]
    public async Task<IActionResult> GetTestResults(int testId)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var test = await _db.Tests
            .FirstOrDefaultAsync(t => t.Id == testId && t.TeacherId == teacherId && !t.IsArchived);

        if (test == null) return NotFound(new { message = "Không tìm thấy bài kiểm tra." });

        var attempts = await _db.TestAttempts
            .Where(a => a.TestId == testId)
            .Include(a => a.Student)
            .OrderByDescending(a => a.SubmittedAt ?? a.StartedAt)
            .Select(a => new TestAttemptSummaryDto
            {
                Id = a.Id,
                TestId = a.TestId,
                TestTitle = test.Title,
                StudentId = a.StudentId,
                StudentName = a.Student.FullName,
                StudentEmail = a.Student.Email ?? string.Empty,
                Score = a.Score,
                CorrectCount = a.CorrectCount,
                TotalQuestions = a.TotalQuestions,
                DurationSeconds = a.DurationSeconds,
                StartedAt = a.StartedAt,
                SubmittedAt = a.SubmittedAt,
                IsPassed = a.Score >= test.PassScore
            })
            .ToListAsync();

        return Ok(attempts);
    }
}
