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
public class VocabularyController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IExcelImportService _importService;
    private readonly IIpaService _ipaService;

    public VocabularyController(
        AppDbContext db,
        IExcelImportService importService,
        IIpaService ipaService)
    {
        _db = db;
        _importService = importService;
        _ipaService = ipaService;
    }

    private string? GetTeacherId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

    [HttpGet]
    public async Task<IActionResult> GetVocabularySets([FromQuery] string? search, [FromQuery] string? level)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var query = _db.VocabularySets
            .Where(s => s.TeacherId == teacherId && !s.IsArchived);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(set => set.Title.Contains(s) || (set.Description != null && set.Description.Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(level) && level != "all")
        {
            query = query.Where(set => set.Level == level);
        }

        var list = await query
            .Include(s => s.Items)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new VocabularySetDto
            {
                Id = s.Id,
                Title = s.Title,
                Description = s.Description,
                Level = s.Level,
                IsPublic = s.IsPublic,
                WordCount = s.Items.Count,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
            })
            .ToListAsync();

        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetVocabularySet(int id)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var set = await _db.VocabularySets
            .Where(s => s.Id == id && s.TeacherId == teacherId && !s.IsArchived)
            .Include(s => s.Items.OrderBy(i => i.OrderIndex))
            .FirstOrDefaultAsync();

        if (set == null) return NotFound(new { message = "Không tìm thấy bộ từ vựng." });

        return Ok(new VocabularySetDto
        {
            Id = set.Id,
            Title = set.Title,
            Description = set.Description,
            Level = set.Level,
            IsPublic = set.IsPublic,
            WordCount = set.Items.Count,
            CreatedAt = set.CreatedAt,
            UpdatedAt = set.UpdatedAt,
            Items = set.Items.Select(i => new VocabularyItemDto
            {
                Id = i.Id,
                Word = i.Word,
                Meaning = i.Meaning,
                IPA = i.IPA,
                Example = i.Example,
                OrderIndex = i.OrderIndex
            }).ToList()
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateVocabularySet([FromBody] CreateVocabularySetDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var set = new VocabularySet
        {
            Title = dto.Title.Trim(),
            Description = dto.Description?.Trim(),
            Level = dto.Level,
            IsPublic = dto.IsPublic,
            TeacherId = teacherId,
            CreatedAt = DateTime.UtcNow
        };

        int order = 0;
        foreach (var item in dto.Items)
        {
            if (string.IsNullOrWhiteSpace(item.Word) || string.IsNullOrWhiteSpace(item.Meaning)) continue;

            set.Items.Add(new VocabularyItem
            {
                Word = item.Word.Trim(),
                Meaning = item.Meaning.Trim(),
                IPA = !string.IsNullOrWhiteSpace(item.IPA) ? item.IPA.Trim() : null,
                Example = !string.IsNullOrWhiteSpace(item.Example) ? item.Example.Trim() : null,
                OrderIndex = order++
            });
        }

        _db.VocabularySets.Add(set);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVocabularySet), new { id = set.Id }, new VocabularySetDto
        {
            Id = set.Id,
            Title = set.Title,
            Description = set.Description,
            Level = set.Level,
            IsPublic = set.IsPublic,
            WordCount = set.Items.Count,
            CreatedAt = set.CreatedAt
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateVocabularySet(int id, [FromBody] CreateVocabularySetDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var set = await _db.VocabularySets
            .Where(s => s.Id == id && s.TeacherId == teacherId && !s.IsArchived)
            .Include(s => s.Items)
            .FirstOrDefaultAsync();

        if (set == null) return NotFound(new { message = "Không tìm thấy bộ từ vựng." });

        set.Title = dto.Title.Trim();
        set.Description = dto.Description?.Trim();
        set.Level = dto.Level;
        set.IsPublic = dto.IsPublic;
        set.UpdatedAt = DateTime.UtcNow;

        // Replace or update items
        _db.VocabularyItems.RemoveRange(set.Items);

        int order = 0;
        foreach (var item in dto.Items)
        {
            if (string.IsNullOrWhiteSpace(item.Word) || string.IsNullOrWhiteSpace(item.Meaning)) continue;

            set.Items.Add(new VocabularyItem
            {
                VocabularySetId = set.Id,
                Word = item.Word.Trim(),
                Meaning = item.Meaning.Trim(),
                IPA = !string.IsNullOrWhiteSpace(item.IPA) ? item.IPA.Trim() : null,
                Example = !string.IsNullOrWhiteSpace(item.Example) ? item.Example.Trim() : null,
                OrderIndex = order++
            });
        }

        await _db.SaveChangesAsync();

        return Ok(new { message = "Cập nhật bộ từ vựng thành công.", wordCount = set.Items.Count });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVocabularySet(int id)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var set = await _db.VocabularySets
            .Where(s => s.Id == id && s.TeacherId == teacherId && !s.IsArchived)
            .FirstOrDefaultAsync();

        if (set == null) return NotFound(new { message = "Không tìm thấy bộ từ vựng." });

        // Safe soft-delete / archive
        set.IsArchived = true;
        set.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa bộ từ vựng thành công." });
    }

    [HttpPost("{id}/duplicate")]
    public async Task<IActionResult> DuplicateVocabularySet(int id)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var source = await _db.VocabularySets
            .Where(s => s.Id == id && s.TeacherId == teacherId && !s.IsArchived)
            .Include(s => s.Items)
            .FirstOrDefaultAsync();

        if (source == null) return NotFound(new { message = "Không tìm thấy bộ từ vựng để nhân bản." });

        var clone = new VocabularySet
        {
            Title = $"{source.Title} (Bản sao)",
            Description = source.Description,
            Level = source.Level,
            IsPublic = false,
            TeacherId = teacherId,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var item in source.Items)
        {
            clone.Items.Add(new VocabularyItem
            {
                Word = item.Word,
                Meaning = item.Meaning,
                IPA = item.IPA,
                Example = item.Example,
                OrderIndex = item.OrderIndex
            });
        }

        _db.VocabularySets.Add(clone);
        await _db.SaveChangesAsync();

        return Ok(new VocabularySetDto
        {
            Id = clone.Id,
            Title = clone.Title,
            Description = clone.Description,
            Level = clone.Level,
            IsPublic = clone.IsPublic,
            WordCount = clone.Items.Count,
            CreatedAt = clone.CreatedAt
        });
    }

    [HttpPost("import")]
    public async Task<IActionResult> ImportVocabularyFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "Vui lòng chọn file để tải lên." });
        }

        using var stream = file.OpenReadStream();
        var result = await _importService.ImportVocabularyFileAsync(stream, file.FileName);

        return Ok(result);
    }

    [HttpPost("{id}/generate-ipa")]
    public async Task<IActionResult> GenerateMissingIpa(int id)
    {
        var teacherId = GetTeacherId();
        if (string.IsNullOrEmpty(teacherId)) return Unauthorized();

        var set = await _db.VocabularySets
            .Where(s => s.Id == id && s.TeacherId == teacherId && !s.IsArchived)
            .Include(s => s.Items)
            .FirstOrDefaultAsync();

        if (set == null) return NotFound(new { message = "Không tìm thấy bộ từ vựng." });

        // Rule: Only generate for missing IPA, never overwrite existing
        var result = _ipaService.GenerateMissingIpa(set.Items.ToList());

        if (result.GeneratedCount > 0)
        {
            set.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        return Ok(result);
    }
}
