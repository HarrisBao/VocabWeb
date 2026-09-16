using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocabWeb.Api.Data;
using VocabWeb.Api.Models;
using VocabWeb.Api.Services;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace VocabWeb.Api.Controllers
{
    public class CreateOrUpdateReadingDto
    {
        public string Title { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
    }

    [ApiController]
    [Route("api/teacher/class/{classId}/[controller]")]
    [Authorize(Roles = "Teacher,TA")]
    public class ReadingController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly DocxReadingParser _parser;

        public ReadingController(AppDbContext db)
        {
            _db = db;
            _parser = new DocxReadingParser();
        }

        private async Task<bool> HasAccessToClass(int classId, bool requireOwnership = false)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (string.IsNullOrEmpty(teacherId)) return false;
            
            if (requireOwnership) 
            {
                return await _db.Classes.AnyAsync(c => c.Id == classId && c.TeacherId == teacherId);
            }

            return await _db.Classes.AnyAsync(c => c.Id == classId && (c.TeacherId == teacherId || _db.ClassStaffAssignments.Any(sa => sa.ClassId == classId && sa.UserId == teacherId)));
        }

        [HttpGet("/api/teacher/reading")]
        public async Task<IActionResult> GetAllTeacherReadings()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            var query = _db.ReadingAssignments
                .Include(r => r.Class)
                .Include(r => r.QuestionGroups)
                .ThenInclude(g => g.Questions)
                .AsQueryable();

            if (userRole == "Teacher")
            {
                query = query.Where(r => r.Class.TeacherId == userId);
            }
            else if (userRole == "TA")
            {
                var taClassIds = await _db.ClassStaffAssignments
                    .Where(ta => ta.UserId == userId)
                    .Select(ta => ta.ClassId)
                    .ToListAsync();
                query = query.Where(r => taClassIds.Contains(r.ClassId));
            }

            var assignments = await query
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.ClassId,
                    ClassName = r.Class.Name,
                    r.Title,
                    r.DurationMinutes,
                    r.Status,
                    r.CreatedAt,
                    QuestionCount = r.QuestionGroups.SelectMany(g => g.Questions).Count()
                })
                .ToListAsync();

            return Ok(assignments);
        }

        [HttpGet]
        public async Task<IActionResult> GetAssignments(int classId)
        {
            if (!await HasAccessToClass(classId)) return Forbid();

            var list = await _db.ReadingAssignments
                .Where(r => r.ClassId == classId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new { r.Id, r.Title, r.DurationMinutes, r.Status, r.CreatedAt })
                .ToListAsync();

            return Ok(list);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAssignment(int classId, [FromBody] CreateOrUpdateReadingDto dto)
        {
            if (!await HasAccessToClass(classId)) return Forbid();

            var assignment = new ReadingAssignment
            {
                ClassId = classId,
                Title = dto.Title ?? "New Reading Assignment",
                DurationMinutes = dto.DurationMinutes > 0 ? dto.DurationMinutes : 60,
                Status = "DRAFT",
                CreatedById = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub")
            };

            _db.ReadingAssignments.Add(assignment);
            await _db.SaveChangesAsync();

            return Ok(new { assignment.Id });
        }

        [HttpPost("{id}/upload-docx")]
        public async Task<IActionResult> UploadDocx(int classId, int id, IFormFile file)
        {
            if (!await HasAccessToClass(classId)) return Forbid();

            var assignment = await _db.ReadingAssignments
                .Include(r => r.Passage)
                .Include(r => r.QuestionGroups)
                .ThenInclude(g => g.Questions)
                .FirstOrDefaultAsync(r => r.Id == id && r.ClassId == classId);

            if (assignment == null) return NotFound();

            if (file == null || file.Length == 0) return BadRequest(new { message = "Không tìm thấy file tải lên." });
            if (!file.FileName.EndsWith(".docx", StringComparison.OrdinalIgnoreCase)) return BadRequest(new { message = "File Word không hợp lệ. Vui lòng tải lên file .docx" });

            // Parse DOCX
            DocxReadingParser.ParseResult result;
            using (var stream = file.OpenReadStream())
            {
                result = _parser.Parse(stream);
            }

            // Remove old
            if (assignment.Passage != null) _db.ReadingPassages.Remove(assignment.Passage);
            if (assignment.QuestionGroups.Any()) _db.ReadingQuestionGroups.RemoveRange(assignment.QuestionGroups);
            await _db.SaveChangesAsync(); // save deletion first to avoid UNIQUE constraint on Passage

            // Insert new
            assignment.Passage = new ReadingPassage { ContentHtml = result.PassageHtml };
            foreach (var g in result.QuestionGroups)
            {
                assignment.QuestionGroups.Add(g);
            }

            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAssignment(int classId, int id)
        {
            if (!await HasAccessToClass(classId)) return Forbid();

            var assignment = await _db.ReadingAssignments
                .Include(r => r.Passage)
                .Include(r => r.QuestionGroups)
                .ThenInclude(g => g.Questions)
                .ThenInclude(q => q.AcceptedAnswers)
                .FirstOrDefaultAsync(r => r.Id == id && r.ClassId == classId);

            if (assignment == null) return NotFound();

            return Ok(new {
                assignment.Id,
                assignment.Title,
                assignment.DurationMinutes,
                assignment.Status,
                Passage = assignment.Passage?.ContentHtml,
                QuestionGroups = assignment.QuestionGroups.Select(g => new {
                    g.Id,
                    g.Instruction,
                    g.InteractionType,
                    g.SortOrder,
                    Questions = g.Questions.Select(q => new {
                        q.Id,
                        q.DisplayNumber,
                        q.Content,
                        q.SortOrder,
                        AcceptedAnswers = q.AcceptedAnswers.Select(a => new { a.Id, a.Answer, a.IsPrimary })
                    })
                })
            });
        }

        [HttpPut("{id}/info")]
        public async Task<IActionResult> UpdateInfo(int classId, int id, [FromBody] CreateOrUpdateReadingDto dto)
        {
            if (!await HasAccessToClass(classId)) return Forbid();
            var assignment = await _db.ReadingAssignments.FirstOrDefaultAsync(r => r.Id == id && r.ClassId == classId);
            if (assignment == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(dto.Title)) assignment.Title = dto.Title;
            if (dto.DurationMinutes > 0) assignment.DurationMinutes = dto.DurationMinutes;

            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("{id}/keys")]
        public async Task<IActionResult> SaveAnswerKeys(int classId, int id, [FromBody] System.Collections.Generic.Dictionary<int, string[]> keys)
        {
            if (!await HasAccessToClass(classId)) return Forbid();

            var assignment = await _db.ReadingAssignments
                .Include(r => r.QuestionGroups)
                .ThenInclude(g => g.Questions)
                .ThenInclude(q => q.AcceptedAnswers)
                .FirstOrDefaultAsync(r => r.Id == id && r.ClassId == classId);

            if (assignment == null) return NotFound();

            foreach (var group in assignment.QuestionGroups)
            {
                foreach (var q in group.Questions)
                {
                    if (keys.TryGetValue(q.Id, out var answers))
                    {
                        _db.ReadingAcceptedAnswers.RemoveRange(q.AcceptedAnswers);
                        q.AcceptedAnswers.Clear();
                        
                        bool isFirst = true;
                        foreach(var ans in answers)
                        {
                            if (string.IsNullOrWhiteSpace(ans)) continue;
                            q.AcceptedAnswers.Add(new ReadingAcceptedAnswer { Answer = ans.Trim(), IsPrimary = isFirst });
                            isFirst = false;
                        }
                    }
                }
            }

            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("{id}/attempts")]
        public async Task<IActionResult> GetAttempts(int classId, int id)
        {
            if (!await HasAccessToClass(classId)) return Forbid();

            var attempts = await _db.ReadingAttempts
                .Include(a => a.ClassEnrollment)
                .ThenInclude(ce => ce.StudentProfile)
                .Where(a => a.ReadingAssignmentId == id && a.ClassEnrollment.ClassId == classId)
                .OrderByDescending(a => a.SubmittedAt)
                .Select(a => new {
                    a.Id,
                    a.AttemptNumber,
                    a.StartedAt,
                    a.SubmittedAt,
                    a.TimeSpentSeconds,
                    a.CorrectCount,
                    a.TotalQuestions,
                    StudentId = a.ClassEnrollment.StudentProfile.UserId,
                    StudentName = a.ClassEnrollment.StudentProfile.FullName
                })
                .ToListAsync();

            return Ok(attempts);
        }

        [HttpGet("{id}/attempts/{attemptId}")]
        public async Task<IActionResult> GetAttemptDetails(int classId, int id, int attemptId)
        {
            if (!await HasAccessToClass(classId)) return Forbid();

            var attempt = await _db.ReadingAttempts
                .Include(a => a.Answers)
                .Include(a => a.ClassEnrollment)
                .ThenInclude(ce => ce.StudentProfile)
                .FirstOrDefaultAsync(a => a.Id == attemptId && a.ReadingAssignmentId == id && a.ClassEnrollment.ClassId == classId);

            if (attempt == null) return NotFound();

            return Ok(new {
                attempt.Id,
                attempt.AttemptNumber,
                attempt.SubmittedAt,
                attempt.CorrectCount,
                attempt.TotalQuestions,
                StudentName = attempt.ClassEnrollment.StudentProfile.FullName,
                Answers = attempt.Answers.Select(a => new {
                    questionId = a.ReadingQuestionId,
                    studentAnswer = a.StudentAnswer,
                    isCorrect = a.IsCorrect,
                    correctAnswer = a.CorrectAnswerSnapshot
                })
            });
        }

        
        public class InteractionTypeDto { public string Type { get; set; } = string.Empty; }

        [HttpPut("{id}/groups/{groupId}/interaction")]
        public async Task<IActionResult> UpdateGroupInteraction(int classId, int id, int groupId, [FromBody] InteractionTypeDto dto)
        {
            if (!await HasAccessToClass(classId)) return Forbid();
            var group = await _db.ReadingQuestionGroups.FirstOrDefaultAsync(g => g.Id == groupId && g.ReadingAssignmentId == id);
            if (group == null) return NotFound();
            group.InteractionType = dto.Type;
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("{id}/publish")]
        public async Task<IActionResult> Publish(int classId, int id)
        {
            if (!await HasAccessToClass(classId)) return Forbid();

            var assignment = await _db.ReadingAssignments
                .Include(r => r.Passage)
                .Include(r => r.QuestionGroups)
                .ThenInclude(g => g.Questions)
                .ThenInclude(q => q.AcceptedAnswers)
                .FirstOrDefaultAsync(r => r.Id == id && r.ClassId == classId);

            if (assignment == null) return NotFound();

            if (string.IsNullOrWhiteSpace(assignment.Title))
                return BadRequest("Tên bài Reading không được để trống.");

            if (assignment.DurationMinutes <= 0)
                return BadRequest("Thời gian làm bài không hợp lệ.");

            if (assignment.Passage == null || string.IsNullOrWhiteSpace(assignment.Passage.ContentHtml))
                return BadRequest("Chưa có nội dung đoạn văn (Passage). Vui lòng tải lên file DOCX hợp lệ.");

            var allQuestions = assignment.QuestionGroups.SelectMany(g => g.Questions).ToList();
            if (!allQuestions.Any())
                return BadRequest("Không tìm thấy câu hỏi nào. Vui lòng kiểm tra lại file Word.");

            foreach (var q in allQuestions)
            {
                if (!q.AcceptedAnswers.Any(a => !string.IsNullOrWhiteSpace(a.Answer)))
                {
                    return BadRequest($"Question {q.DisplayNumber} chưa có đáp án.");
                }
            }

            assignment.Status = "PUBLISHED";
            await _db.SaveChangesAsync();
            return Ok();
        }
    }
}

