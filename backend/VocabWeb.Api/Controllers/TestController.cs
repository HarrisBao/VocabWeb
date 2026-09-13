using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocabWeb.Api.Data;
using VocabWeb.Api.DTOs;
using VocabWeb.Api.Models;
using VocabWeb.Api.Models.ActivityEngine;
using VocabWeb.Api.Services;
using VocabWeb.Api.Services.ActivityEngine;

namespace VocabWeb.Api.Controllers;

[ApiController]
[Route("api/teacher/[controller]")]
[Authorize(Roles = "Teacher")]
public class TestController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IQuestionGenerationService _questionGeneration;
    private readonly IAnswerEvaluationService _answerEvaluation;

    public TestController(AppDbContext db, IQuestionGenerationService questionGeneration, IAnswerEvaluationService answerEvaluation)
    {
        _db = db;
        _questionGeneration = questionGeneration;
        _answerEvaluation = answerEvaluation;
    }

    private string? GetTeacherId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

    [HttpGet("activities")]
    public IActionResult GetActivities()
    {
        return Ok(_questionGeneration.GetActivityDefinitions());
    }

    [HttpGet]
    public async Task<IActionResult> GetTests([FromQuery] int? classId)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var query = _db.Tests
            .Where(t => t.TeacherId == teacherId && !t.IsArchived);

        if (classId.HasValue)
        {
            query = query.Where(t => t.ClassId == classId.Value);
        }

        var tests = await query
            .Include(t => t.VocabularySet)
            .Include(t => t.Class)
            .Include(t => t.Attempts)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TestDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                VocabularySetId = t.VocabularySetId,
                VocabularySetTitle = t.VocabularySet.Title,
                ClassId = t.ClassId,
                ClassName = t.Class != null ? t.Class.Name : null,
                EnabledTypes = t.EnabledTypes.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList(),
                TotalQuestions = t.TotalQuestions,
                PassScore = t.PassScore,
                TimeLimitMinutes = t.TimeLimitMinutes,
                PublicCode = t.PublicCode,
                RequiresAccessCode = t.RequiresAccessCode,
                MaxAttempts = t.MaxAttempts,
                StartDate = t.StartDate,
                Deadline = t.Deadline,
                AttemptCount = t.Attempts.Count,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();

        return Ok(tests);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTest(int id)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var test = await _db.Tests
            .Where(t => t.Id == id && t.TeacherId == teacherId && !t.IsArchived)
            .Include(t => t.VocabularySet)
                .ThenInclude(vs => vs.Items)
            .Include(t => t.Class)
            .Include(t => t.Attempts)
            .FirstOrDefaultAsync();

        if (test == null) return NotFound(new { message = "Không tìm thấy bài kiểm tra." });

        return Ok(new TestDto
        {
            Id = test.Id,
            Title = test.Title,
            Description = test.Description,
            VocabularySetId = test.VocabularySetId,
            VocabularySetTitle = test.VocabularySet.Title,
            ClassId = test.ClassId,
            ClassName = test.Class?.Name,
            EnabledTypes = test.EnabledTypes.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList(),
            TotalQuestions = test.TotalQuestions,
            PassScore = test.PassScore,
            TimeLimitMinutes = test.TimeLimitMinutes,
            PublicCode = test.PublicCode,
            RequiresAccessCode = test.RequiresAccessCode,
            MaxAttempts = test.MaxAttempts,
            StartDate = test.StartDate,
            Deadline = test.Deadline,
            AttemptCount = test.Attempts.Count,
            CreatedAt = test.CreatedAt
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateTest([FromBody] CreateTestDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var set = await _db.VocabularySets
            .Where(s => s.Id == dto.VocabularySetId && s.TeacherId == teacherId && !s.IsArchived)
            .Include(s => s.Items)
            .FirstOrDefaultAsync();

        if (set == null) return BadRequest(new { message = "Bộ từ vựng không hợp lệ hoặc không thuộc quyền sở hữu của bạn." });

        if (set.Items.Count < 4)
        {
            return BadRequest(new { message = "Bộ từ vựng cần có ít nhất 4 từ để có thể tạo bài kiểm tra với các phương án lựa chọn." });
        }

        var enabledTypesString = string.Join(",", dto.EnabledTypes.Distinct());

        var test = new Test
        {
            Title = dto.Title.Trim(),
            Description = dto.Description?.Trim(),
            TeacherId = teacherId,
            VocabularySetId = dto.VocabularySetId,
            ClassId = dto.ClassId,
            EnabledTypes = enabledTypesString,
            PassScore = dto.PassScore,
            TimeLimitMinutes = dto.TimeLimitMinutes,
            RequiresAccessCode = dto.RequiresAccessCode,
            MaxAttempts = dto.MaxAttempts,
            StartDate = dto.StartDate,
            Deadline = dto.Deadline,
            CreatedAt = DateTime.UtcNow
        };

        if (dto.RequiresAccessCode && !string.IsNullOrWhiteSpace(dto.NewAccessCode))
        {
            var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<Test>();
            test.AccessCodeHash = hasher.HashPassword(test, dto.NewAccessCode.Trim());
        }

        _db.Tests.Add(test);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTest), new { id = test.Id }, new TestDto
        {
            Id = test.Id,
            Title = test.Title,
            Description = test.Description,
            VocabularySetId = test.VocabularySetId,
            VocabularySetTitle = set.Title,
            ClassId = test.ClassId,
            EnabledTypes = dto.EnabledTypes,
            TotalQuestions = test.TotalQuestions, // Can still return 0 since we removed it
            PassScore = test.PassScore,
            TimeLimitMinutes = test.TimeLimitMinutes,
            PublicCode = test.PublicCode,
            RequiresAccessCode = test.RequiresAccessCode,
            MaxAttempts = test.MaxAttempts,
            StartDate = test.StartDate,
            Deadline = test.Deadline,
            AttemptCount = 0,
            CreatedAt = test.CreatedAt
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTest(int id, [FromBody] CreateTestDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var test = await _db.Tests
            .Where(t => t.Id == id && t.TeacherId == teacherId && !t.IsArchived)
            .FirstOrDefaultAsync();

        if (test == null) return NotFound(new { message = "Không tìm thấy bài kiểm tra." });

        test.Title = dto.Title.Trim();
        test.Description = dto.Description?.Trim();
        test.VocabularySetId = dto.VocabularySetId;
        test.ClassId = dto.ClassId;
        test.EnabledTypes = string.Join(",", dto.EnabledTypes.Distinct());
        test.PassScore = dto.PassScore;
        test.TimeLimitMinutes = dto.TimeLimitMinutes;
        test.RequiresAccessCode = dto.RequiresAccessCode;
        test.MaxAttempts = dto.MaxAttempts;
        test.StartDate = dto.StartDate;
        test.Deadline = dto.Deadline;

        if (dto.RequiresAccessCode)
        {
            if (!string.IsNullOrWhiteSpace(dto.NewAccessCode))
            {
                var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<Test>();
                test.AccessCodeHash = hasher.HashPassword(test, dto.NewAccessCode.Trim());
            }
        }
        else
        {
            test.AccessCodeHash = null;
        }

        await _db.SaveChangesAsync();

        return Ok(new { message = "Cập nhật cấu hình bài kiểm tra thành công." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTest(int id)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var test = await _db.Tests
            .Where(t => t.Id == id && t.TeacherId == teacherId && !t.IsArchived)
            .FirstOrDefaultAsync();

        if (test == null) return NotFound(new { message = "Không tìm thấy bài kiểm tra." });

        test.IsArchived = true;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa bài kiểm tra." });
    }

    [HttpGet("{id}/preview")]
    public async Task<IActionResult> PreviewTestQuestions(int id)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var test = await _db.Tests
            .Where(t => t.Id == id && t.TeacherId == teacherId && !t.IsArchived)
            .Include(t => t.VocabularySet)
                .ThenInclude(vs => vs.Items)
            .FirstOrDefaultAsync();

        if (test == null) return NotFound(new { message = "Không tìm thấy bài kiểm tra." });

        var enabledTypes = test.EnabledTypes.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(t => Enum.Parse<ActivityType>(t))
            .ToList();

        var questions = _questionGeneration.GenerateQuestions(test.VocabularySet.Items.ToList(), enabledTypes);

        return Ok(questions);
    }

    public class EvaluateRequestDto
    {
        public int TestId { get; set; }
        public List<UserAnswerSubmission> Submissions { get; set; } = new();
    }

    [HttpPost("preview-evaluate")]
    public async Task<IActionResult> PreviewEvaluate([FromBody] EvaluateRequestDto dto)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var test = await _db.Tests
            .Where(t => t.Id == dto.TestId && t.TeacherId == teacherId && !t.IsArchived)
            .Include(t => t.VocabularySet)
                .ThenInclude(vs => vs.Items)
            .FirstOrDefaultAsync();

        if (test == null) return NotFound(new { message = "Không tìm thấy bài kiểm tra." });

        var evaluation = _answerEvaluation.EvaluateAnswers(dto.Submissions, test.VocabularySet.Items.ToList());

        return Ok(new
        {
            FinalScore = evaluation.FinalScore,
            Results = evaluation.Results
        });
    }
}
