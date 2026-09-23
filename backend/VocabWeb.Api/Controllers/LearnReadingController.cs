using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocabWeb.Api.Data;
using VocabWeb.Api.Models;

namespace VocabWeb.Api.Controllers
{
    [ApiController]
    [Route("api/learn/class/{classId}/reading")]
    [Authorize]
    public class LearnReadingController : ControllerBase
    {
        private readonly AppDbContext _db;

        public LearnReadingController(AppDbContext db)
        {
            _db = db;
        }

        private async Task<ClassEnrollment?> GetEnrollment(int classId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            return await _db.ClassEnrollments
                .Include(ce => ce.StudentProfile)
                .FirstOrDefaultAsync(ce => ce.ClassId == classId && ce.StudentProfile.UserId == userId && ce.IsActive);
        }

        [HttpGet]
        public async Task<IActionResult> GetAvailableAssignments(int classId)
        {
            var enrollment = await GetEnrollment(classId);
            if (enrollment == null) return Forbid();

            var list = await _db.ReadingAssignments
                .Where(r => r.ClassAssignments.Any(ca => ca.ClassId == classId && ca.IsActive) && r.Status == "READY")
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new {
                    r.Id,
                    r.Title,
                    r.DurationMinutes,
                    QuestionCount = r.QuestionGroups.SelectMany(g => g.Questions).Count(),
                    AttemptCount = r.Attempts.Count(a => a.ClassEnrollmentId == enrollment.Id && a.SubmittedAt != null),
                    LatestSubmittedAttemptId = r.Attempts.Where(a => a.ClassEnrollmentId == enrollment.Id && a.SubmittedAt != null).OrderByDescending(a => a.SubmittedAt).Select(a => (int?)a.Id).FirstOrDefault()
                })
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAssignment(int classId, int id)
        {
            var enrollment = await GetEnrollment(classId);
            if (enrollment == null) return Forbid();

            var assignment = await _db.ReadingAssignments
                .Include(r => r.Passage)
                .Include(r => r.QuestionGroups)
                .ThenInclude(g => g.Questions)
                .FirstOrDefaultAsync(r => r.Id == id && r.ClassAssignments.Any(ca => ca.ClassId == classId && ca.IsActive));

            if (assignment == null) return NotFound();

            var activeAttempt = await _db.ReadingAttempts
                .Include(a => a.Answers)
                .OrderByDescending(a => a.StartedAt)
                .FirstOrDefaultAsync(a => a.ReadingAssignmentId == id && a.ClassEnrollmentId == enrollment.Id && a.SubmittedAt == null);

            // If no active attempt, it must be READY
            if (activeAttempt == null && assignment.Status != "READY")
            {
                return NotFound();
            }

            var questionGroups = assignment.QuestionGroups;
            var durationMinutes = assignment.DurationMinutes;
            var passageHtml = assignment.Passage?.ContentHtml;
            var draftAnswers = new System.Collections.Generic.Dictionary<int, string>();

            if (activeAttempt != null)
            {
                if (activeAttempt.AllowedDurationSecondsSnapshot > 0)
                {
                    durationMinutes = activeAttempt.AllowedDurationSecondsSnapshot / 60;
                }
                
                if (activeAttempt.PassageSnapshotHtml != null)
                {
                    passageHtml = activeAttempt.PassageSnapshotHtml;
                }
                
                if (!string.IsNullOrEmpty(activeAttempt.QuestionSnapshotJson))
                {
                    var snapshotGroups = System.Text.Json.JsonSerializer.Deserialize<System.Collections.Generic.ICollection<ReadingQuestionGroup>>(activeAttempt.QuestionSnapshotJson);
                    if (snapshotGroups != null)
                    {
                        questionGroups = snapshotGroups;
                    }
                }

                foreach (var ans in activeAttempt.Answers)
                {
                    draftAnswers[ans.ReadingQuestionId] = ans.StudentAnswer;
                }
            }

            // Do not include AcceptedAnswers!
            return Ok(new {
                assignment.Id,
                assignment.Title,
                DurationMinutes = durationMinutes,
                Passage = passageHtml,
                DraftAnswers = draftAnswers,
                QuestionGroups = questionGroups.OrderBy(g => g.SortOrder).Select(g => new {
                    g.Id,
                    g.Instruction,
                    g.InteractionType,
                    g.SortOrder,
                    Questions = g.Questions.OrderBy(q => q.SortOrder).Select(q => new {
                        q.Id,
                        q.DisplayNumber,
                        q.Content,
                        q.SortOrder,
                        // No accepted answers sent to client
                    })
                })
            });
        }

                [HttpDelete("{id}/attempts/{attemptId}/discard")]
        public async Task<IActionResult> DiscardAttempt(int classId, int id, int attemptId)
        {
            var enrollment = await GetEnrollment(classId);
            if (enrollment == null) return Forbid();

            using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                var activeAttempts = await _db.ReadingAttempts
                    .Where(a => a.ReadingAssignmentId == id && a.ClassEnrollmentId == enrollment.Id && a.SubmittedAt == null)
                    .ToListAsync();

                if (!activeAttempts.Any()) return NotFound("Khong tim thay luot lam bai.");

                var attemptIds = activeAttempts.Select(a => a.Id).ToList();
                var answers = await _db.ReadingAttemptAnswers
                    .Where(a => attemptIds.Contains(a.ReadingAttemptId))
                    .ToListAsync();

                _db.ReadingAttemptAnswers.RemoveRange(answers);
                _db.ReadingAttempts.RemoveRange(activeAttempts);

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Da huy luot lam bai hien tai." });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Lỗi hệ thống khi hủy bài." });
            }
        }

        [HttpPost("{id}/start")]
        public async Task<IActionResult> StartAttempt(int classId, int id)
        {
            var enrollment = await GetEnrollment(classId);
            if (enrollment == null) return Forbid();

            var assignment = await _db.ReadingAssignments
                .Include(r => r.Passage)
                .Include(r => r.QuestionGroups)
                .ThenInclude(g => g.Questions)
                .ThenInclude(q => q.AcceptedAnswers)
                .FirstOrDefaultAsync(r => r.Id == id && r.ClassAssignments.Any(ca => ca.ClassId == classId && ca.IsActive) && r.Status == "READY");

            if (assignment == null) return NotFound();

            // Check if there is an active unsubmitted attempt
            var activeAttempt = await _db.ReadingAttempts
                .OrderByDescending(a => a.StartedAt)
                .FirstOrDefaultAsync(a => a.ReadingAssignmentId == id && a.ClassEnrollmentId == enrollment.Id && a.SubmittedAt == null);

            if (activeAttempt != null)
            {
                return Ok(new { attemptId = activeAttempt.Id, startedAt = activeAttempt.StartedAt, allowedDurationSecondsSnapshot = activeAttempt.AllowedDurationSecondsSnapshot });
            }

            int attemptNumber = await _db.ReadingAttempts.CountAsync(a => a.ReadingAssignmentId == id && a.ClassEnrollmentId == enrollment.Id) + 1;

            var snapshotJson = System.Text.Json.JsonSerializer.Serialize(assignment.QuestionGroups, new System.Text.Json.JsonSerializerOptions { ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles });

            var attempt = new ReadingAttempt
            {
                ReadingAssignmentId = id,
                ClassEnrollmentId = enrollment.Id,
                AttemptNumber = attemptNumber,
                StartedAt = DateTime.UtcNow,
                AllowedDurationSecondsSnapshot = assignment.DurationMinutes * 60,
                TotalQuestions = assignment.QuestionGroups.SelectMany(g => g.Questions).Count(),
                QuestionSnapshotJson = snapshotJson,
                PassageSnapshotHtml = assignment.Passage?.ContentHtml
            };

            _db.ReadingAttempts.Add(attempt);
            await _db.SaveChangesAsync();

            return Ok(new { attemptId = attempt.Id, startedAt = attempt.StartedAt, allowedDurationSecondsSnapshot = attempt.AllowedDurationSecondsSnapshot });
        }

        [HttpGet("{id}/attempts")]
        public async Task<IActionResult> GetAttempts(int classId, int id)
        {
            var enrollment = await GetEnrollment(classId);
            if (enrollment == null) return Forbid();

            var attemptsList = await _db.ReadingAttempts
                .Where(a => a.ReadingAssignmentId == id && a.ClassEnrollmentId == enrollment.Id && a.SubmittedAt != null)
                .OrderBy(a => a.SubmittedAt).ThenBy(a => a.Id)
                .Select(a => new {
                    a.Id,
                    a.StartedAt,
                    a.SubmittedAt,
                    a.TimeSpentSeconds,
                    a.AllowedDurationSecondsSnapshot,
                    a.OvertimeSeconds,
                    a.CorrectCount,
                    a.TotalQuestions,
                    UnansweredCount = a.Answers.Count(ans => ans.StudentAnswer == "" || ans.StudentAnswer == null),
                    IncorrectCount = a.Answers.Count(ans => !ans.IsCorrect && ans.StudentAnswer != "" && ans.StudentAnswer != null)
                })
                .ToListAsync();

            var withNumber = attemptsList.Select((a, idx) => new {
                a.Id,
                AttemptNumber = idx + 1,
                a.StartedAt,
                a.SubmittedAt,
                a.TimeSpentSeconds,
                a.AllowedDurationSecondsSnapshot,
                a.OvertimeSeconds,
                a.CorrectCount,
                a.TotalQuestions,
                a.UnansweredCount,
                a.IncorrectCount
            }).OrderByDescending(a => a.SubmittedAt).ToList();

            return Ok(withNumber);
        }

        [HttpGet("{id}/attempts/{attemptId}")]
        public async Task<IActionResult> GetAttemptDetails(int classId, int id, int attemptId)
        {
            var enrollment = await GetEnrollment(classId);
            if (enrollment == null) return Forbid();

            var attempt = await _db.ReadingAttempts
                .Include(a => a.Answers)
                .FirstOrDefaultAsync(a => a.Id == attemptId && a.ReadingAssignmentId == id && a.ClassEnrollmentId == enrollment.Id);

            if (attempt == null) return NotFound();

            // Calculate canonical attempt number
            int calculatedNumber = 1;
            if (attempt.SubmittedAt != null) {
                calculatedNumber = await _db.ReadingAttempts
                    .Where(a => a.ReadingAssignmentId == id && a.ClassEnrollmentId == enrollment.Id && a.SubmittedAt != null && (a.SubmittedAt < attempt.SubmittedAt || (a.SubmittedAt == attempt.SubmittedAt && a.Id <= attempt.Id)))
                    .CountAsync();
            } else {
                // If it's an active attempt, it will become the next number
                calculatedNumber = await _db.ReadingAttempts
                    .Where(a => a.ReadingAssignmentId == id && a.ClassEnrollmentId == enrollment.Id && a.SubmittedAt != null)
                    .CountAsync() + 1;
            }

            object questionGroups = null;
            if (!string.IsNullOrEmpty(attempt.QuestionSnapshotJson))
            {
                questionGroups = System.Text.Json.JsonSerializer.Deserialize<System.Collections.Generic.ICollection<ReadingQuestionGroup>>(attempt.QuestionSnapshotJson);
            }

            return Ok(new {
                attempt.Id,
                AttemptNumber = calculatedNumber,
                attempt.StartedAt,
                attempt.SubmittedAt,
                attempt.TimeSpentSeconds,
                attempt.AllowedDurationSecondsSnapshot,
                attempt.OvertimeSeconds,
                attempt.CorrectCount,
                attempt.TotalQuestions,
                Passage = attempt.PassageSnapshotHtml,
                QuestionGroups = questionGroups,
                Answers = attempt.Answers.Select(a => new {
                    questionId = a.ReadingQuestionId,
                    studentAnswer = a.StudentAnswer,
                    isCorrect = a.IsCorrect,
                    correctAnswer = a.CorrectAnswerSnapshot
                })
            });
        }

        [HttpPost("{id}/submit")]
        public async Task<IActionResult> SubmitAnswers(int classId, int id, [FromBody] System.Collections.Generic.Dictionary<int, string> studentAnswers)
        {
            var enrollment = await GetEnrollment(classId);
            if (enrollment == null) return Forbid();

            var assignment = await _db.ReadingAssignments
                .Include(r => r.QuestionGroups)
                .ThenInclude(g => g.Questions)
                .ThenInclude(q => q.AcceptedAnswers)
                .FirstOrDefaultAsync(r => r.Id == id); // Removed Status == "READY" so active attempts can submit

            if (assignment == null) return NotFound();

            var attempt = await _db.ReadingAttempts
                .Include(a => a.Answers)
                .FirstOrDefaultAsync(a => a.ReadingAssignmentId == id && a.ClassEnrollmentId == enrollment.Id && a.SubmittedAt == null);

            var questionGroups = assignment.QuestionGroups;

            if (attempt == null)
            {
                // Fallback if no start was explicitly called (robustness)
                int attemptNumber = await _db.ReadingAttempts.CountAsync(a => a.ReadingAssignmentId == id && a.ClassEnrollmentId == enrollment.Id) + 1;
                attempt = new ReadingAttempt
                {
                    ReadingAssignmentId = id,
                    ClassEnrollmentId = enrollment.Id,
                    AttemptNumber = attemptNumber,
                    StartedAt = DateTime.UtcNow.AddMinutes(-assignment.DurationMinutes), // Fallback approximation
                    AllowedDurationSecondsSnapshot = assignment.DurationMinutes * 60,
                    TotalQuestions = assignment.QuestionGroups.SelectMany(g => g.Questions).Count()
                };
                _db.ReadingAttempts.Add(attempt);
            }
            else if (!string.IsNullOrEmpty(attempt.QuestionSnapshotJson))
            {
                // Use snapshot if available
                var snapshotGroups = System.Text.Json.JsonSerializer.Deserialize<System.Collections.Generic.ICollection<ReadingQuestionGroup>>(attempt.QuestionSnapshotJson);
                if (snapshotGroups != null)
                {
                    questionGroups = snapshotGroups;
                }
            }

            attempt.SubmittedAt = DateTime.UtcNow;
            
            // Calculate time spent
            attempt.TimeSpentSeconds = (int)(attempt.SubmittedAt.Value - attempt.StartedAt).TotalSeconds;
            if (attempt.TimeSpentSeconds < 0) attempt.TimeSpentSeconds = 0;

            // Calculate overtime
            attempt.OvertimeSeconds = System.Math.Max(0, attempt.TimeSpentSeconds - attempt.AllowedDurationSecondsSnapshot);

            int correctCount = 0;

            foreach (var group in questionGroups)
            {
                foreach (var q in group.Questions)
                {
                    string ans = "";
                    if (studentAnswers.TryGetValue(q.Id, out var val) && val != null)
                    {
                        ans = val.Trim();
                    }

                    // Grading logic
                    bool isCorrect = false;
                    string primaryAns = "";
                    foreach (var acc in q.AcceptedAnswers)
                    {
                        if (acc.IsPrimary) primaryAns = acc.Answer;
                        
                        if (string.Equals(ans, acc.Answer.Trim(), StringComparison.OrdinalIgnoreCase))
                        {
                            isCorrect = true;
                            break;
                        }
                    }

                    if (isCorrect) correctCount++;

                    var existingAnswer = attempt.Answers.FirstOrDefault(a => a.ReadingQuestionId == q.Id);
                    if (existingAnswer != null)
                    {
                        existingAnswer.StudentAnswer = ans;
                        existingAnswer.IsCorrect = isCorrect;
                        existingAnswer.CorrectAnswerSnapshot = primaryAns;
                    }
                    else
                    {
                        attempt.Answers.Add(new ReadingAttemptAnswer
                        {
                            ReadingQuestionId = q.Id,
                            StudentAnswer = ans,
                            IsCorrect = isCorrect,
                            CorrectAnswerSnapshot = primaryAns
                        });
                    }
                }
            }

            attempt.CorrectCount = correctCount;
            await _db.SaveChangesAsync();

            return Ok(new {
                attemptId = attempt.Id,
                correctCount = attempt.CorrectCount,
                totalQuestions = attempt.TotalQuestions,
                timeSpentSeconds = attempt.TimeSpentSeconds,
                overtimeSeconds = attempt.OvertimeSeconds,
                answers = attempt.Answers.Select(a => new {
                    questionId = a.ReadingQuestionId,
                    studentAnswer = a.StudentAnswer,
                    isCorrect = a.IsCorrect,
                    correctAnswer = a.CorrectAnswerSnapshot
                })
            });
        }

        [HttpPut("{id}/autosave")]
        public async Task<IActionResult> AutosaveAnswers(int classId, int id, [FromBody] System.Collections.Generic.Dictionary<int, string> studentAnswers)
        {
            var enrollment = await GetEnrollment(classId);
            if (enrollment == null) return Forbid();

            var attempt = await _db.ReadingAttempts
                .Include(a => a.Answers)
                .FirstOrDefaultAsync(a => a.ReadingAssignmentId == id && a.ClassEnrollmentId == enrollment.Id && a.SubmittedAt == null);

            if (attempt == null) return NotFound("No active attempt found.");

            foreach (var kvp in studentAnswers)
            {
                var questionId = kvp.Key;
                var ans = kvp.Value?.Trim() ?? "";

                var existingAnswer = attempt.Answers.FirstOrDefault(a => a.ReadingQuestionId == questionId);
                if (existingAnswer != null)
                {
                    existingAnswer.StudentAnswer = ans;
                }
                else
                {
                    attempt.Answers.Add(new ReadingAttemptAnswer
                    {
                        ReadingQuestionId = questionId,
                        StudentAnswer = ans
                    });
                }
            }

            await _db.SaveChangesAsync();
            return Ok();
        }
    }
}
