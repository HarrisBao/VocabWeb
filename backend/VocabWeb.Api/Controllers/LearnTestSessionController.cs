using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocabWeb.Api.Data;
using VocabWeb.Api.DTOs.Learn;
using VocabWeb.Api.Models;
using VocabWeb.Api.Models.ActivityEngine;
using VocabWeb.Api.Services.ActivityEngine;

namespace VocabWeb.Api.Controllers;

[Route("api/learn/attempts")]
[ApiController]
public class LearnTestSessionController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IDataProtector _protector;
    private readonly IQuestionGenerationService _questionGeneration;
    private readonly IAnswerEvaluationService _answerEvaluation;

    public LearnTestSessionController(
        AppDbContext context,
        IDataProtectionProvider dataProtectionProvider,
        IQuestionGenerationService questionGeneration,
        IAnswerEvaluationService answerEvaluation)
    {
        _context = context;
        _protector = dataProtectionProvider.CreateProtector("VocabWeb.TestAccessTicket");
        _questionGeneration = questionGeneration;
        _answerEvaluation = answerEvaluation;
    }

    private AccessTicketData? GetTicketData(string ticket)
    {
        if (string.IsNullOrEmpty(ticket)) return null;
        try
        {
            var json = _protector.Unprotect(ticket);
            return JsonSerializer.Deserialize<AccessTicketData>(json);
        }
        catch
        {
            return null;
        }
    }

    private async Task<TestAttempt?> ValidateAndGetAttempt(int attemptId, string ticket)
    {
        var ticketData = GetTicketData(ticket);
        if (ticketData == null || ticketData.Expiry < DateTime.UtcNow) return null;

        var attempt = await _context.TestAttempts
            .Include(a => a.Test)
                .ThenInclude(t => t.VocabularySet)
                    .ThenInclude(vs => vs.Items)
            .Include(a => a.Answers)
            .FirstOrDefaultAsync(a => a.Id == attemptId && a.TestId == ticketData.TestId);

        if (attempt == null) return null;

        if (!string.IsNullOrEmpty(ticketData.StudentId))
        {
            if (attempt.StudentId != ticketData.StudentId) return null;
        }
        else
        {
            if (attempt.GuestSessionId != ticketData.GuestSessionId) return null;
        }

        return attempt;
    }

    [HttpGet("{attemptId}/current-stage")]
    [AllowAnonymous]
    public async Task<ActionResult<CurrentStageDto>> GetCurrentStage(int attemptId, [FromHeader(Name = "X-Access-Ticket")] string ticket)
    {
        var attempt = await ValidateAndGetAttempt(attemptId, ticket);
        if (attempt == null) return Unauthorized(new { message = "Không có quyền truy cập lượt làm bài này." });

        if (attempt.Status != "IN_PROGRESS")
            return BadRequest(new { message = "Lượt làm bài đã kết thúc." });

        var sequence = attempt.ActivitySequenceSnapshot.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

        if (attempt.CurrentStageIndex >= sequence.Count)
        {
            return BadRequest(new { message = "Đã hoàn thành tất cả hoạt động. Vui lòng nộp bài." });
        }

        var activityTypeStr = sequence[attempt.CurrentStageIndex];
        if (!Enum.TryParse<ActivityType>(activityTypeStr, out var activityType))
        {
            return BadRequest(new { message = "Hoạt động không hợp lệ." });
        }

        // Generate questions using Core Engine
        var generatedQuestions = _questionGeneration.GenerateQuestions(
            attempt.Test.VocabularySet.Items.ToList(),
            new List<ActivityType> { activityType },
            attempt.TotalQuestions
        );

        // Map to safe DTO without CorrectAnswer
        var questionProtector = _protector.CreateProtector("QuestionTarget");

        var safeQuestions = generatedQuestions.Select((q, index) =>
        {
            var targetItem = attempt.Test.VocabularySet.Items.FirstOrDefault(v => v.Id == q.TargetVocabularyItemId);
            return new StudentQuestionDto
            {
                Id = questionProtector.Protect(q.TargetVocabularyItemId.ToString()),
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

        return Ok(new CurrentStageDto
        {
            StageIndex = attempt.CurrentStageIndex,
            TotalStages = sequence.Count,
            ActivityType = activityTypeStr,
            ActivityTypeLabel = GetActivityTypeLabel(activityTypeStr),
            Questions = safeQuestions
        });
    }

    [HttpPost("{attemptId}/stages/{stageIndex}/complete")]
    [AllowAnonymous]
    public async Task<ActionResult<ActivityResultDto>> CompleteStage(int attemptId, int stageIndex, [FromHeader(Name = "X-Access-Ticket")] string ticket, [FromBody] SubmitStageRequestDto dto)
    {
        var attempt = await ValidateAndGetAttempt(attemptId, ticket);
        if (attempt == null) return Unauthorized(new { message = "Không có quyền truy cập lượt làm bài này." });

        if (attempt.Status != "IN_PROGRESS")
            return BadRequest(new { message = "Lượt làm bài đã kết thúc." });

        if (stageIndex != attempt.CurrentStageIndex)
            return BadRequest(new { message = "Thứ tự hoạt động không đồng bộ." });

        var sequence = attempt.ActivitySequenceSnapshot.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

        if (stageIndex >= sequence.Count)
            return BadRequest(new { message = "Hoạt động không tồn tại." });

        var activityTypeStr = sequence[stageIndex];
        if (!Enum.TryParse<ActivityType>(activityTypeStr, out var activityType))
            return BadRequest(new { message = "Hoạt động không hợp lệ." });

        // Map DTO to Engine Submission format
        var questionProtector = _protector.CreateProtector("QuestionTarget");
        var engineSubmissions = dto.Answers.Select(a =>
        {
            int targetId = 0;
            try
            {
                targetId = int.Parse(questionProtector.Unprotect(a.QuestionId));
            }
            catch
            {
                // Invalid question ID, skip or treat as technical failure
            }
            return new UserAnswerSubmission
            {
                QuestionId = a.QuestionId,
                TargetVocabularyItemId = targetId,
                AnswerValue = a.AnswerValue,
                TechnicalFailure = a.TechnicalFailure || targetId == 0,
                Type = activityType
            };
        }).ToList();

        // Evaluate using Core Engine
        var evaluation = _answerEvaluation.EvaluateAnswers(engineSubmissions, attempt.Test.VocabularySet.Items.ToList());

        int correctCount = 0;
        int incorrectCount = 0;
        int invalidCount = 0;

        foreach (var sub in engineSubmissions)
        {
            var result = evaluation.Results.FirstOrDefault(r => r.QuestionId == sub.QuestionId);

            bool isCorrect = result?.IsCorrect ?? false;
            string correctAnswer = result?.CorrectAnswer ?? string.Empty;

            if (sub.TechnicalFailure)
                invalidCount++;
            else if (isCorrect)
                correctCount++;
            else
                incorrectCount++;

            // Save AttemptAnswer
            _context.AttemptAnswers.Add(new AttemptAnswer
            {
                TestAttemptId = attempt.Id,
                VocabularyItemId = sub.TargetVocabularyItemId,
                QuestionType = activityTypeStr,
                QuestionPrompt = sub.QuestionId, // Storing ID as prompt identifier for now
                UserAnswer = sub.TechnicalFailure ? "[TECHNICAL_FAILURE]" : sub.AnswerValue,
                CorrectAnswer = sub.TechnicalFailure ? "" : correctAnswer,
                IsCorrect = isCorrect
            });
        }

        // Increment Stage
        attempt.CurrentStageIndex++;
        await _context.SaveChangesAsync();

        int validQuestions = correctCount + incorrectCount;
        decimal accuracy = validQuestions > 0 ? Math.Round((decimal)correctCount / validQuestions * 100, 1) : 0;

        return Ok(new ActivityResultDto
        {
            ActivityType = activityTypeStr,
            ActivityTypeLabel = GetActivityTypeLabel(activityTypeStr),
            CorrectCount = correctCount,
            IncorrectCount = incorrectCount,
            InvalidCount = invalidCount,
            TotalValidQuestions = validQuestions,
            Accuracy = accuracy,
            IsLastActivity = attempt.CurrentStageIndex >= sequence.Count
        });
    }

    [HttpPost("{attemptId}/submit")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitTest(int attemptId, [FromHeader(Name = "X-Access-Ticket")] string ticket)
    {
        var attempt = await ValidateAndGetAttempt(attemptId, ticket);
        if (attempt == null) return Unauthorized(new { message = "Không có quyền truy cập lượt làm bài này." });

        if (attempt.Status != "IN_PROGRESS")
            return BadRequest(new { message = "Lượt làm bài đã kết thúc." });

        var sequence = attempt.ActivitySequenceSnapshot.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

        if (attempt.CurrentStageIndex < sequence.Count)
            return BadRequest(new { message = "Bạn chưa hoàn thành tất cả các hoạt động." });

        var answers = attempt.Answers;
        int totalValid = answers.Count(a => a.UserAnswer != "[TECHNICAL_FAILURE]");

        int totalCorrect = answers.Count(a => a.IsCorrect && a.UserAnswer != "[TECHNICAL_FAILURE]");
        int totalAttempted = totalValid;

        decimal finalScore = totalAttempted > 0
            ? Math.Round((decimal)totalCorrect / totalAttempted * 10, 1)
            : 0;

        attempt.Score = finalScore;
        attempt.CorrectCount = totalCorrect;
        // TotalQuestions is already set at attempt start
        attempt.Status = "SUBMITTED";
        attempt.SubmittedAt = DateTime.UtcNow;
        attempt.DurationSeconds = (int)(attempt.SubmittedAt.Value - attempt.StartedAt).TotalSeconds;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            score = attempt.Score,
            correctCount = attempt.CorrectCount,
            totalQuestions = attempt.TotalQuestions, // total defined by teacher
            totalAttempted = totalAttempted,
            durationSeconds = attempt.DurationSeconds
        });
    }

    private class AccessTicketData
    {
        public int TestId { get; set; }
        public string? StudentId { get; set; }
        public string? GuestSessionId { get; set; }
        public string? GuestDisplayName { get; set; }
        public DateTime Expiry { get; set; }
    }

    private string GetActivityTypeLabel(string type)
    {
        return type switch
        {
            "WORD_TO_MEANING" => "Từ → Chọn nghĩa",
            "MEANING_TO_WORD" => "Nghĩa → Chọn từ",
            "LISTEN_TO_WORD" => "Nghe → Chọn từ",
            "LISTEN_TO_MEANING" => "Nghe → Chọn nghĩa",
            "MEANING_TO_TYPE_WORD" => "Nghĩa → Điền từ",
            "LISTEN_TO_TYPE_WORD" => "Nghe → Điền từ",
            "WORD_TO_TYPE_MEANING" => "Từ → Điền nghĩa",
            "MISSING_LETTERS" => "Điền chữ còn thiếu",
            "UNSCRAMBLE_WORD" => "Sắp xếp chữ thành từ",
            "MATCH_WORD_MEANING" => "Ghép Từ ↔ Nghĩa",
            "PRONUNCIATION" => "Phát âm",
            _ => type
        };
    }
}
