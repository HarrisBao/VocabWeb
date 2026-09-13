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
                StudentName = a.Student != null ? a.Student.FullName : (a.GuestDisplayName ?? "Khách"),
                StudentEmail = a.Student != null ? a.Student.Email : null,
                IsGuest = a.Student == null,
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
            .Where(a => a.TestId == testId && a.Status == "SUBMITTED")
            .Include(a => a.Student)
            .ToListAsync();

        // Group by participant (StudentId or GuestSessionId)
        var grouped = attempts
            .GroupBy(a => a.StudentId ?? a.GuestSessionId ?? a.Id.ToString())
            .Select(g =>
            {
                var first = g.First();
                // Apply highest score policy (or whatever default, we use highest score here as example)
                var bestAttempt = g.OrderByDescending(a => a.Score).First();

                return new
                {
                    ParticipantKey = g.Key,
                    DisplayName = first.Student != null ? first.Student.FullName : (first.GuestDisplayName ?? "Khách"),
                    IsGuest = first.Student == null,
                    AppliedScore = bestAttempt.Score,
                    SubmittedAt = bestAttempt.SubmittedAt ?? bestAttempt.StartedAt,
                    AttemptCount = g.Count()
                };
            })
            .OrderByDescending(x => x.SubmittedAt)
            .ToList();

        return Ok(grouped);
    }

    [HttpGet("/api/teacher/tests/{testId}/participants/{participantKey}/history")]
    public async Task<IActionResult> GetParticipantHistory(int testId, string participantKey)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var test = await _db.Tests
            .FirstOrDefaultAsync(t => t.Id == testId && t.TeacherId == teacherId && !t.IsArchived);

        if (test == null) return NotFound(new { message = "Không tìm thấy bài kiểm tra." });

        var attempts = await _db.TestAttempts
            .Where(a => a.TestId == testId && (a.StudentId == participantKey || a.GuestSessionId == participantKey) && a.Status == "SUBMITTED")
            .OrderBy(a => a.AttemptNumber)
            .Select(a => new
            {
                AttemptId = a.Id,
                AttemptNumber = a.AttemptNumber,
                Score = a.Score,
                SubmittedAt = a.SubmittedAt ?? a.StartedAt
            })
            .ToListAsync();

        var bestScore = attempts.Count > 0 ? attempts.Max(a => a.Score) : 0;

        var result = attempts.Select(a => new
        {
            a.AttemptId,
            a.AttemptNumber,
            a.Score,
            a.SubmittedAt,
            IsAppliedScore = a.Score == bestScore
        });

        return Ok(result);
    }

    [HttpGet("/api/teacher/results/attempts/{attemptId}/detail")]
    public async Task<IActionResult> GetAttemptDetail(int attemptId)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var attempt = await _db.TestAttempts
            .Include(a => a.Test)
            .Include(a => a.Answers)
            .FirstOrDefaultAsync(a => a.Id == attemptId && a.Test.TeacherId == teacherId);

        if (attempt == null) return NotFound(new { message = "Không tìm thấy lượt làm bài." });

        var activities = attempt.Answers
            .GroupBy(ans => ans.QuestionType)
            .Select(g => new
            {
                ActivityType = g.Key,
                CorrectCount = g.Count(ans => ans.IsCorrect),
                IncorrectCount = g.Count(ans => !ans.IsCorrect),
                InvalidCount = 0 // Not tracked yet in this schema
            })
            .ToList();

        return Ok(new
        {
            AttemptId = attempt.Id,
            AttemptNumber = attempt.AttemptNumber,
            Score = attempt.Score,
            DurationSeconds = attempt.DurationSeconds,
            SubmittedAt = attempt.SubmittedAt ?? attempt.StartedAt,
            ActivitySummaries = activities
        });
    }

    [HttpGet("/api/teacher/results/attempts/{attemptId}/activities/{activityType}/errors")]
    public async Task<IActionResult> GetActivityErrors(int attemptId, string activityType)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var attempt = await _db.TestAttempts
            .Include(a => a.Test)
            .FirstOrDefaultAsync(a => a.Id == attemptId && a.Test.TeacherId == teacherId);

        if (attempt == null) return NotFound(new { message = "Không tìm thấy lượt làm bài." });

        var errors = await _db.AttemptAnswers
            .Where(ans => ans.TestAttemptId == attemptId && ans.QuestionType == activityType && !ans.IsCorrect)
            .Select(ans => new
            {
                AnswerId = ans.Id,
                ActivityType = ans.QuestionType,
                QuestionPrompt = ans.QuestionPrompt,
                StudentAnswer = ans.UserAnswer,
                CorrectAnswer = ans.CorrectAnswer
            })
            .ToListAsync();

        return Ok(errors);
    }
}
