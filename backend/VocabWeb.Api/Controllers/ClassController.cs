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
[Authorize(Roles = "Teacher")]
public class ClassController : ControllerBase
{
    private readonly AppDbContext _db;

    public ClassController(AppDbContext db)
    {
        _db = db;
    }

    private string? GetTeacherId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

    [HttpGet]
    public async Task<IActionResult> GetClasses()
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var list = await _db.Classes
            .Where(c => c.TeacherId == teacherId && !c.IsArchived)
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
                MemberCount = c.Members.Count,
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
            .Where(c => c.Id == id && c.TeacherId == teacherId && !c.IsArchived)
            .Include(c => c.Lessons)
                .ThenInclude(l => l.VocabularySet)
                    .ThenInclude(vs => vs.Items)
            .Include(c => c.Members)
                .ThenInclude(m => m.Student)
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
            MemberCount = cls.Members.Count,
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
            Members = cls.Members.Select(m => new ClassMemberDto
            {
                Id = m.Id,
                StudentId = m.StudentId,
                StudentName = m.Student.FullName,
                StudentEmail = m.Student.Email ?? string.Empty,
                AvatarUrl = m.Student.AvatarUrl,
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

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteClass(int id)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var cls = await _db.Classes
            .Where(c => c.Id == id && c.TeacherId == teacherId && !c.IsArchived)
            .FirstOrDefaultAsync();

        if (cls == null) return NotFound(new { message = "Không tìm thấy lớp học." });

        cls.IsArchived = true;
        cls.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa lớp học thành công." });
    }

    [HttpPost("{id}/lessons")]
    public async Task<IActionResult> AssignLesson(int id, [FromBody] AssignLessonDto dto)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var cls = await _db.Classes
            .Where(c => c.Id == id && c.TeacherId == teacherId && !c.IsArchived)
            .FirstOrDefaultAsync();

        if (cls == null) return NotFound(new { message = "Không tìm thấy lớp học." });

        var set = await _db.VocabularySets
            .Where(s => s.Id == dto.VocabularySetId && s.TeacherId == teacherId && !s.IsArchived)
            .FirstOrDefaultAsync();

        if (set == null) return BadRequest(new { message = "Bộ từ vựng không hợp lệ hoặc không thuộc quyền sở hữu của bạn." });

        var alreadyAssigned = await _db.ClassLessons
            .AnyAsync(l => l.ClassId == id && l.VocabularySetId == dto.VocabularySetId);

        if (alreadyAssigned)
        {
            return BadRequest(new { message = "Bộ từ vựng này đã được thêm vào lớp học." });
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

        return Ok(new { message = "Thêm bộ từ vựng vào lớp thành công." });
    }

    [HttpDelete("{id}/lessons/{lessonId}")]
    public async Task<IActionResult> RemoveLesson(int id, int lessonId)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var lesson = await _db.ClassLessons
            .Include(l => l.Class)
            .FirstOrDefaultAsync(l => l.Id == lessonId && l.ClassId == id && l.Class.TeacherId == teacherId);

        if (lesson == null) return NotFound(new { message = "Không tìm thấy bài học trong lớp." });

        _db.ClassLessons.Remove(lesson);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã gỡ bài học khỏi lớp." });
    }

    [HttpPut("{id}/lessons/{lessonId}/pin")]
    public async Task<IActionResult> TogglePinLesson(int id, int lessonId)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var lesson = await _db.ClassLessons
            .Include(l => l.Class)
            .FirstOrDefaultAsync(l => l.Id == lessonId && l.ClassId == id && l.Class.TeacherId == teacherId);

        if (lesson == null) return NotFound(new { message = "Không tìm thấy bài học trong lớp." });

        lesson.IsPinned = !lesson.IsPinned;
        await _db.SaveChangesAsync();

        return Ok(new { isPinned = lesson.IsPinned, message = lesson.IsPinned ? "Đã ghim bài học." : "Đã bỏ ghim bài học." });
    }

    [HttpPut("{id}/lessons/{lessonId}/visibility")]
    public async Task<IActionResult> ToggleLessonVisibility(int id, int lessonId)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var lesson = await _db.ClassLessons
            .Include(l => l.Class)
            .FirstOrDefaultAsync(l => l.Id == lessonId && l.ClassId == id && l.Class.TeacherId == teacherId);

        if (lesson == null) return NotFound(new { message = "Không tìm thấy bài học trong lớp." });

        lesson.IsHidden = !lesson.IsHidden;
        await _db.SaveChangesAsync();

        return Ok(new { isHidden = lesson.IsHidden, message = lesson.IsHidden ? "Đã ẩn bài học khỏi học sinh." : "Đã hiển thị bài học." });
    }
}
