using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocabWeb.Api.Data;
using VocabWeb.Api.DTOs.Learn;
using VocabWeb.Api.Models;
using VocabWeb.Api.Models.ActivityEngine;
using VocabWeb.Api.Services.ActivityEngine;

namespace VocabWeb.Api.Controllers;

[Route("api/learn/tests")]
[ApiController]
public class LearnTestAccessController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IDataProtector _protector;
    private readonly IQuestionGenerationService _questionGeneration;

    public LearnTestAccessController(AppDbContext context, IDataProtectionProvider dataProtectionProvider, IQuestionGenerationService questionGeneration)
    {
        _context = context;
        _protector = dataProtectionProvider.CreateProtector("VocabWeb.TestAccessTicket");
        _questionGeneration = questionGeneration;
    }

    [HttpGet("{publicCode}")]
    [AllowAnonymous]
    public async Task<ActionResult<PublicTestMetadataDto>> GetPublicMetadata(string publicCode)
    {
        var test = await _context.Tests
            .FirstOrDefaultAsync(t => t.PublicCode == publicCode && !t.IsArchived);

        if (test == null)
        {
            return NotFound(new { message = "Không tìm thấy bài kiểm tra hoặc bài đã bị đóng." });
        }

        return Ok(new PublicTestMetadataDto
        {
            PublicCode = test.PublicCode,
            Title = test.Title,
            Description = test.Description,
            RequiresAccessCode = test.RequiresAccessCode,
            StartDate = test.StartDate,
            Deadline = test.Deadline,
            MaxAttempts = test.MaxAttempts,
            TotalQuestions = test.TotalQuestions,
            TimeLimitMinutes = test.TimeLimitMinutes,
            PassScore = test.PassScore
        });
    }

    [HttpPost("{publicCode}/access")]
    [AllowAnonymous]
    public async Task<ActionResult<TestAccessResponseDto>> VerifyAccess(string publicCode, [FromBody] TestAccessRequestDto dto)
    {
        var test = await _context.Tests
            .Include(t => t.Attempts)
            .FirstOrDefaultAsync(t => t.PublicCode == publicCode && !t.IsArchived);

        if (test == null)
            return NotFound(new { message = "Không tìm thấy bài kiểm tra." });

        if (test.StartDate.HasValue && DateTime.UtcNow < test.StartDate.Value)
            return BadRequest(new { message = "Bài kiểm tra chưa bắt đầu." });

        if (test.Deadline.HasValue && DateTime.UtcNow > test.Deadline.Value)
            return BadRequest(new { message = "Bài kiểm tra đã kết thúc." });

        // Verify Identity
        bool isLoggedIn = User.Identity?.IsAuthenticated ?? false;
        string? studentId = null;
        int? classEnrollmentId = null;
        string? participantName;

        if (isLoggedIn)
        {
            studentId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var enrollmentClaim = User.FindFirst("ClassEnrollmentId")?.Value;
            if (int.TryParse(enrollmentClaim, out int ceId)) classEnrollmentId = ceId;
            participantName = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value ?? "Học sinh";
        }
        else
        {
            if (string.IsNullOrWhiteSpace(dto.GuestDisplayName) || string.IsNullOrWhiteSpace(dto.GuestSessionId))
            {
                return BadRequest(new { message = "Vui lòng nhập tên của bạn để làm bài." });
            }
            participantName = dto.GuestDisplayName.Trim();
        }

        // Verify Access Code
        if (test.RequiresAccessCode)
        {
            if (string.IsNullOrWhiteSpace(dto.AccessCode))
            {
                return BadRequest(new { message = "Mã vào bài chưa đúng." }); // Keep message vague
            }

            var hasher = new PasswordHasher<Test>();
            var result = hasher.VerifyHashedPassword(test, test.AccessCodeHash ?? "", dto.AccessCode.Trim());

            if (result != PasswordVerificationResult.Success)
            {
                return BadRequest(new { message = "Mã vào bài chưa đúng." });
            }
        }

        // Calculate attempts
        int attemptsCount = 0;
        if (classEnrollmentId.HasValue)
        {
            attemptsCount = test.Attempts.Count(a => a.ClassEnrollmentId == classEnrollmentId.Value);
        }
        else if (isLoggedIn)
        {
            attemptsCount = test.Attempts.Count(a => a.StudentId == studentId);
        }
        else
        {
            attemptsCount = test.Attempts.Count(a => a.GuestSessionId == dto.GuestSessionId);
        }

        if (test.MaxAttempts.HasValue && attemptsCount >= test.MaxAttempts.Value)
        {
            return BadRequest(new { message = "Bạn đã sử dụng hết số lượt làm bài." });
        }

        // Issue Access Ticket
        var ticketData = new AccessTicketData
        {
            TestId = test.Id,
            StudentId = studentId,
            ClassEnrollmentId = classEnrollmentId,
            GuestSessionId = isLoggedIn ? null : dto.GuestSessionId,
            GuestDisplayName = isLoggedIn ? null : participantName,
            Expiry = DateTime.UtcNow.AddHours(2)
        };

        var ticketJson = JsonSerializer.Serialize(ticketData);
        var ticketProtected = _protector.Protect(ticketJson);

        return Ok(new TestAccessResponseDto
        {
            AccessGranted = true,
            AccessTicket = ticketProtected,
            ParticipantDisplayName = participantName,
            RemainingAttempts = test.MaxAttempts.HasValue ? test.MaxAttempts.Value - attemptsCount : 999
        });
    }

    [HttpPost("{publicCode}/attempts/start")]
    [AllowAnonymous]
    public async Task<ActionResult<StartAttemptResponseDto>> StartAttempt(string publicCode, [FromHeader(Name = "X-Access-Ticket")] string ticket)
    {
        if (string.IsNullOrEmpty(ticket))
            return Unauthorized(new { message = "Thiếu thông tin xác thực phiên làm bài." });

        AccessTicketData? ticketData;
        try
        {
            var json = _protector.Unprotect(ticket);
            ticketData = JsonSerializer.Deserialize<AccessTicketData>(json);
        }
        catch
        {
            return Unauthorized(new { message = "Phiên làm bài không hợp lệ hoặc đã hết hạn." });
        }

        if (ticketData == null || ticketData.Expiry < DateTime.UtcNow)
        {
            return Unauthorized(new { message = "Phiên làm bài đã hết hạn. Vui lòng đăng nhập lại." });
        }

        var test = await _context.Tests
            .Include(t => t.Attempts)
            .Include(t => t.VocabularySet)
                .ThenInclude(vs => vs.Items)
            .FirstOrDefaultAsync(t => t.PublicCode == publicCode && t.Id == ticketData.TestId && !t.IsArchived);

        if (test == null)
            return NotFound(new { message = "Bài kiểm tra không hợp lệ." });

        if (test.Deadline.HasValue && DateTime.UtcNow > test.Deadline.Value)
            return BadRequest(new { message = "Bài kiểm tra đã kết thúc." });

        // Calculate attempts again to prevent race condition
        int attemptsCount = 0;
        if (ticketData.ClassEnrollmentId.HasValue)
        {
            attemptsCount = test.Attempts.Count(a => a.ClassEnrollmentId == ticketData.ClassEnrollmentId.Value);
        }
        else if (!string.IsNullOrEmpty(ticketData.StudentId))
        {
            attemptsCount = test.Attempts.Count(a => a.StudentId == ticketData.StudentId);
        }
        else
        {
            attemptsCount = test.Attempts.Count(a => a.GuestSessionId == ticketData.GuestSessionId);
        }

        if (test.MaxAttempts.HasValue && attemptsCount >= test.MaxAttempts.Value)
        {
            return BadRequest(new { message = "Bạn đã sử dụng hết số lượt làm bài." });
        }

        var enabledTypes = test.EnabledTypes.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(t => Enum.Parse<ActivityType>(t))
            .ToList();

        var generatedQuestions = _questionGeneration.GenerateQuestions(test.VocabularySet.Items.ToList(), enabledTypes);

        // Create new attempt
        var attempt = new TestAttempt
        {
            TestId = test.Id,
            StudentId = string.IsNullOrEmpty(ticketData.StudentId) ? null : ticketData.StudentId,
            ClassEnrollmentId = ticketData.ClassEnrollmentId,
            GuestSessionId = ticketData.GuestSessionId,
            GuestDisplayName = ticketData.GuestDisplayName,
            ParticipantDisplayNameSnapshot = !string.IsNullOrEmpty(ticketData.StudentId)
                ? (User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value ?? "Học sinh")
                : ticketData.GuestDisplayName,
            AttemptNumber = attemptsCount + 1,
            Status = "IN_PROGRESS",
            StartedAt = DateTime.UtcNow,
            TotalQuestions = generatedQuestions.Count,
            ActivitySequenceSnapshot = test.EnabledTypes,
            ActivityPlanJson = JsonSerializer.Serialize(generatedQuestions),
            TimeLimitSnapshotMinutes = test.TimeLimitMinutes,
            CurrentStageIndex = 0
        };

        _context.TestAttempts.Add(attempt);
        await _context.SaveChangesAsync();

        return Ok(new StartAttemptResponseDto
        {
            AttemptId = attempt.Id,
            AttemptNumber = attempt.AttemptNumber,
            StartedAt = attempt.StartedAt,
            TestMetadata = new PublicTestMetadataDto
            {
                PublicCode = test.PublicCode,
                Title = test.Title,
                Description = test.Description,
                RequiresAccessCode = test.RequiresAccessCode,
                StartDate = test.StartDate,
                Deadline = test.Deadline,
                MaxAttempts = test.MaxAttempts,
                TotalQuestions = test.TotalQuestions,
                TimeLimitMinutes = test.TimeLimitMinutes,
                PassScore = test.PassScore
            }
        });
    }

    private class AccessTicketData
    {
        public int TestId { get; set; }
        public string? StudentId { get; set; }
        public int? ClassEnrollmentId { get; set; }
        public string? GuestSessionId { get; set; }
        public string? GuestDisplayName { get; set; }
        public DateTime Expiry { get; set; }
    }
}

