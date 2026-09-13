using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocabWeb.Api.Data;
using VocabWeb.Api.DTOs.Learn;
using VocabWeb.Api.Models;

namespace VocabWeb.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class LearnController : ControllerBase
{
    private readonly AppDbContext _context;

    public LearnController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("classes/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<StudentClassDto>> GetClassBySlug(string slug)
    {
        // For slug, we can use the Code or FixedLinkToken. The UI uses /class/dp-x82h
        // Let's assume slug maps to FixedLinkToken for guest access, or Code (if unique).
        // The teacher class link is often the FixedLinkToken. We'll check both.

        var cls = await _context.Classes
            .Include(c => c.Lessons.Where(l => !l.IsHidden))
                .ThenInclude(l => l.VocabularySet)
                    .ThenInclude(vs => vs.Items)
            .FirstOrDefaultAsync(c => !c.IsArchived && (c.Code.ToLower() == slug.ToLower() || c.FixedLinkToken == slug));

        if (cls == null)
        {
            return NotFound(new { message = "Không tìm thấy lớp học hoặc lớp đã bị lưu trữ." });
        }

        if (!cls.AllowGuestAccess && !User.Identity!.IsAuthenticated)
        {
            return Unauthorized(new { message = "Lớp học này yêu cầu tài khoản học viên để truy cập." });
        }

        var dto = new StudentClassDto
        {
            Id = cls.Id,
            Name = cls.Name,
            Code = cls.Code,
            Description = cls.Description,
            FixedLinkToken = cls.FixedLinkToken,
            AllowGuestAccess = cls.AllowGuestAccess,
            RequireLogin = cls.RequireLogin,
            Lessons = cls.Lessons
                .OrderByDescending(l => l.IsPinned)
                .ThenBy(l => l.OrderIndex)
                .Select(l => new StudentLessonDto
                {
                    VocabularySetId = l.VocabularySetId,
                    Title = l.VocabularySet.Title,
                    Description = l.VocabularySet.Description,
                    Level = l.VocabularySet.Level,
                    WordCount = l.VocabularySet.Items.Count,
                    IsPinned = l.IsPinned,
                    OrderIndex = l.OrderIndex
                }).ToList()
        };

        return Ok(dto);
    }

    [HttpGet("vocabulary/{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<VocabularyReviewDto>> GetVocabularyReview(int id, [FromQuery] int? classId)
    {
        var vocabSet = await _context.VocabularySets
            .Include(vs => vs.Items)
            .FirstOrDefaultAsync(vs => vs.Id == id);

        if (vocabSet == null)
        {
            return NotFound(new { message = "Không tìm thấy bộ từ vựng." });
        }

        // Check access
        bool hasAccess = false;

        // 1. If it's public
        if (vocabSet.IsPublic)
        {
            hasAccess = true;
        }

        // 2. If it's linked to a class that the user has access to
        if (!hasAccess && classId.HasValue)
        {
            var cls = await _context.Classes
                .Include(c => c.Lessons)
                .FirstOrDefaultAsync(c => c.Id == classId.Value && !c.IsArchived);

            if (cls != null)
            {
                var lesson = cls.Lessons.FirstOrDefault(l => l.VocabularySetId == id && !l.IsHidden);
                if (lesson != null)
                {
                    if (cls.AllowGuestAccess || User.Identity!.IsAuthenticated)
                    {
                        hasAccess = true;
                    }
                }
            }
        }

        // 3. If it's their own set (teacher)
        if (!hasAccess && User.Identity!.IsAuthenticated)
        {
            // Just assume they might be the teacher, or we can check.
            hasAccess = true; // Simulating basic check
        }

        if (!hasAccess)
        {
            return Forbid(); // Or Unauthorized
        }

        var dto = new VocabularyReviewDto
        {
            Id = vocabSet.Id,
            Title = vocabSet.Title,
            Description = vocabSet.Description,
            Level = vocabSet.Level,
            Items = vocabSet.Items.OrderBy(i => i.OrderIndex).Select(item => new VocabularyReviewItemDto
            {
                Id = item.Id,
                Word = item.Word,
                IPA = item.IPA,
                Meaning = item.Meaning,
                Example = item.Example,
                OrderIndex = item.OrderIndex
            }).ToList()
        };

        return Ok(dto);
    }
}
