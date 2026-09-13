using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocabWeb.Api.Data;
using VocabWeb.Api.DTOs;
using VocabWeb.Api.Models;
using VocabWeb.Api.Services;

namespace VocabWeb.Api.Controllers;

[ApiController]
[Route("api/teacher/[controller]")]
[Authorize(Roles = "Teacher")]
public class TestController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IQuestionEngineService _questionEngine;

    public TestController(AppDbContext db, IQuestionEngineService questionEngine)
    {
        _db = db;
        _questionEngine = questionEngine;
    }

    private string? GetTeacherId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

    [HttpGet]
    public async Task<IActionResult> GetTests()
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var tests = await _db.Tests
            .Where(t => t.TeacherId == teacherId && !t.IsArchived)
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
            TotalQuestions = dto.TotalQuestions,
            PassScore = dto.PassScore,
            TimeLimitMinutes = dto.TimeLimitMinutes,
            CreatedAt = DateTime.UtcNow
        };

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
            TotalQuestions = test.TotalQuestions,
            PassScore = test.PassScore,
            TimeLimitMinutes = test.TimeLimitMinutes,
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
        test.TotalQuestions = dto.TotalQuestions;
        test.PassScore = dto.PassScore;
        test.TimeLimitMinutes = dto.TimeLimitMinutes;

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

        var preview = _questionEngine.GenerateTestQuestions(test, test.VocabularySet.Items.ToList());

        return Ok(preview);
    }
}
