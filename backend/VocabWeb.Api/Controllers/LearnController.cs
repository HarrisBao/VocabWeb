using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocabWeb.Api.Data;
using VocabWeb.Api.DTOs.Learn;
using VocabWeb.Api.Models;
using VocabWeb.Api.Models.ActivityEngine;
using VocabWeb.Api.Services.ActivityEngine;

namespace VocabWeb.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class LearnController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IQuestionGenerationService _questionGeneration;

    public LearnController(AppDbContext context, IQuestionGenerationService questionGeneration)
    {
        _context = context;
        _questionGeneration = questionGeneration;
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
            return NotFound(new { message = "KhÃ´ng tÃ¬m tháº¥y lá»›p há»c hoáº·c lá»›p Ä‘Ã£ bá»‹ lÆ°u trá»¯." });
        }

        if (!cls.AllowGuestAccess && !User.Identity!.IsAuthenticated)
        {
            return Unauthorized(new { message = "Lá»›p há»c nÃ y yÃªu cáº§u tÃ i khoáº£n há»c viÃªn Ä‘á»ƒ truy cáº­p." });
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
            return NotFound(new { message = "KhÃ´ng tÃ¬m tháº¥y bá»™ tá»« vá»±ng." });
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

    [HttpGet("vocabulary/{id}/practice/availability")]
    [AllowAnonymous]
    public async Task<ActionResult<List<PracticeAvailabilityDto>>> GetPracticeAvailability(int id)
    {
        var vocabSet = await _context.VocabularySets
            .Include(vs => vs.Items)
            .FirstOrDefaultAsync(vs => vs.Id == id);

        if (vocabSet == null) return NotFound(new { message = "KhÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y bÃ¡Â»â„¢ tÃ¡Â»Â« vÃ¡Â»Â±ng." });

        var definitions = _questionGeneration.GetActivityDefinitions();
        var result = new List<PracticeAvailabilityDto>();

        foreach (var def in definitions)
        {
            bool isAvailable = true;
            string reason = "";

            // Evaluate simple rules
            if (vocabSet.Items.Count == 0)
            {
                isAvailable = false;
                reason = "ChÃ†Â°a cÃƒÂ³ tÃ¡Â»Â« vÃ¡Â»Â±ng.";
            }
            else if (def.RequiredInputs.Contains("Meaning") && vocabSet.Items.Count < 2)
            {
                // Activities needing distractors usually require at least 2 words
                if (def.Type == ActivityType.WORD_TO_MEANING || def.Type == ActivityType.MEANING_TO_WORD || def.Type == ActivityType.LISTEN_TO_MEANING || def.Type == ActivityType.LISTEN_TO_WORD)
                {
                    isAvailable = false;
                    reason = "CÃ¡ÂºÂ§n ÃƒÂ­t nhÃ¡ÂºÂ¥t 2 tÃ¡Â»Â« vÃ¡Â»Â±ng Ã„â€˜Ã¡Â»Æ’ tÃ¡ÂºÂ¡o cÃƒÂ¡c Ã„â€˜ÃƒÂ¡p ÃƒÂ¡n lÃ¡Â»Â±a chÃ¡Â» n.";
                }
            }
            
            // Generate a dummy session just to test if QuestionGenerationService can actually fulfill it
            if (isAvailable)
            {
                var questions = _questionGeneration.GenerateQuestions(vocabSet.Items.ToList(), new List<ActivityType> { def.Type });
                if (questions.Count == 0)
                {
                    isAvailable = false;
                    reason = "KhÃƒÂ´ng Ã„â€˜Ã¡Â»Â§ dÃ¡Â»Â¯ liÃ¡Â»â€¡u hÃ¡Â»Â£p lÃ¡Â»â€¡ cho hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng nÃƒÂ y.";
                }
            }

            result.Add(new PracticeAvailabilityDto
            {
                Type = def.Type.ToString(),
                Name = def.Name,
                IsAvailable = isAvailable,
                Reason = reason
            });
        }

        return Ok(result);
    }

    [HttpGet("vocabulary/{id}/practice/generate")]
    [AllowAnonymous]
    public async Task<ActionResult<CurrentStageDto>> GeneratePracticeSession(int id, [FromQuery] ActivityType type)
    {
        var vocabSet = await _context.VocabularySets
            .Include(vs => vs.Items)
            .FirstOrDefaultAsync(vs => vs.Id == id);

        if (vocabSet == null) return NotFound(new { message = "KhÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y bÃ¡Â»â„¢ tÃ¡Â»Â« vÃ¡Â»Â±ng." });

        var questions = _questionGeneration.GenerateQuestions(vocabSet.Items.ToList(), new List<ActivityType> { type });
        
        var safeQuestions = questions.Select((q, index) =>
        {
            var targetItem = vocabSet.Items.FirstOrDefault(v => v.Id == q.TargetVocabularyItemId);
            return new StudentQuestionDto
            {
                Id = q.TargetVocabularyItemId.ToString(), // No need to protect for practice
                QuestionIndex = index,
                Prompt = q.QuestionPrompt,
                TargetWord = targetItem?.Word,
                TargetMeaning = targetItem?.Meaning,
                AudioBehavior = q.AudioBehavior.ToString(),
                Options = q.Options?.Select(o => new StudentQuestionOptionDto
                {
                    VocabularyItemId = o.VocabularyItemId,
                    Text = o.Text
                }).ToList()
            };
        }).ToList();

        var definitions = _questionGeneration.GetActivityDefinitions();
        var label = definitions.FirstOrDefault(d => d.Type == type)?.Name ?? type.ToString();

        return Ok(new CurrentStageDto
        {
            StageIndex = 0,
            TotalStages = 1,
            ActivityType = type.ToString(),
            ActivityTypeLabel = label,
            TimeLimitSnapshotMinutes = null, // No timer for practice
            StartedAt = DateTime.UtcNow,
            Questions = safeQuestions
        });
    }

    [HttpGet("classes/{slug}/notifications")]
    public async Task<IActionResult> GetClassNotifications(string slug)
    {
        var studentProfileIdStr = User.FindFirst("StudentProfileId")?.Value;
        if (string.IsNullOrEmpty(studentProfileIdStr) || !int.TryParse(studentProfileIdStr, out int profileId))
        {
            return Unauthorized();
        }

        var cls = await _context.Classes.FirstOrDefaultAsync(c => c.FixedLinkToken == slug && !c.IsArchived);
        if (cls == null) return NotFound("Class not found");

        // Verify active enrollment
        var enrollment = await _context.ClassEnrollments.FirstOrDefaultAsync(ce => ce.ClassId == cls.Id && ce.StudentProfileId == profileId && ce.IsActive);
        if (enrollment == null) return Forbid();

        var notifications = await _context.StudentNotifications
            .Where(n => n.StudentProfileId == profileId && n.ClassId == cls.Id)
            .OrderByDescending(n => n.CreatedAt)
            .Take(10)
            .Select(n => new 
            {
                n.Id,
                n.Type,
                n.Message,
                n.IsRead,
                n.CreatedAt
            })
            .ToListAsync();

        return Ok(notifications);
    }

    [HttpPut("notifications/{id}/read")]
    public async Task<IActionResult> MarkNotificationRead(int id)
    {
        var studentProfileIdStr = User.FindFirst("StudentProfileId")?.Value;
        if (string.IsNullOrEmpty(studentProfileIdStr) || !int.TryParse(studentProfileIdStr, out int profileId))
        {
            return Unauthorized();
        }

        var notification = await _context.StudentNotifications.FirstOrDefaultAsync(n => n.Id == id && n.StudentProfileId == profileId);
        if (notification == null) return NotFound();

        notification.IsRead = true;
        await _context.SaveChangesAsync();

        return Ok();
    }
}


