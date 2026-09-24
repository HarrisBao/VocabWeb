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
        public string? PassageHtml { get; set; }
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

            // A Teacher must be assigned to READING for this class to access it.
            // If the user is a TA, we can check ClassStaffAssignments.
            var isTa = User.IsInRole("TA");
            if (isTa)
            {
                return await _db.ClassStaffAssignments.AnyAsync(sa => sa.ClassId == classId && sa.UserId == teacherId);
            }

            return await _db.ClassSkillOfferings.AnyAsync(o => o.ClassId == classId && o.TeacherId == teacherId && o.Skill == IeltsSkill.READING && o.IsActive);
        }

        

        
        [HttpGet]
        public async Task<IActionResult> GetClassAssignments(int classId)
        {
            if (!await HasAccessToClass(classId)) return Forbid();
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var assignments = await _db.ReadingAssignments
                .Where(r => r.ClassAssignments.Any(ca => ca.ClassId == classId && ca.IsActive) && r.Status != "ARCHIVED")
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.ClassId,
                    r.Title,
                    r.DurationMinutes,
                    r.Status,
                    r.CreatedAt,
                    r.UpdatedAt,
                    QuestionCount = r.QuestionGroups.SelectMany(g => g.Questions).Count(),
                    AssignedClassesCount = r.ClassAssignments.Count(ca => ca.IsActive)
                })
                .ToListAsync();

            return Ok(assignments);
        }

        
        [HttpPost("/api/teacher/reading")]
        public async Task<IActionResult> CreateGlobalAssignment([FromBody] CreateOrUpdateReadingDto dto)
        {
            var assignment = new ReadingAssignment
            {
                Title = dto.Title,
                DurationMinutes = dto.DurationMinutes,
                Status = "DRAFT",
                CreatedById = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub")
            };

            _db.ReadingAssignments.Add(assignment);
            await _db.SaveChangesAsync();

            return Ok(new { assignment.Id });
        }

        [HttpDelete("/api/teacher/reading/{id}")]
        public async Task<IActionResult> DeleteGlobalAssignment(int id)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var assignment = await _db.ReadingAssignments
                .FirstOrDefaultAsync(r => r.Id == id && r.CreatedById == teacherId);

            if (assignment == null) return NotFound();

            // Archive it globally
            assignment.Status = "ARCHIVED"; // Or use another mechanism to hide it. Since there's no IsArchived, let's use Status = "ARCHIVED"

            // Deactivate all class assignments to hide from students
            var cas = await _db.ReadingClassAssignments.Where(ca => ca.ReadingAssignmentId == id).ToListAsync();
            foreach (var ca in cas)
            {
                ca.IsActive = false;
            }

            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("/api/teacher/class/{classId}/reading/{id}")]
        public async Task<IActionResult> RemoveClassAssignment(int classId, int id)
        {
            if (!await HasAccessToClass(classId)) return Forbid();
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var assignment = await _db.ReadingClassAssignments
                .FirstOrDefaultAsync(ca => ca.ReadingAssignmentId == id && ca.ClassId == classId);

            if (assignment != null)
            {
                assignment.IsActive = false;
                await _db.SaveChangesAsync();
            }

            return Ok();
        }

        [HttpGet("/api/teacher/reading")]
        public async Task<IActionResult> GetAllTeacherReadings()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            var query = _db.ReadingAssignments
                .Where(r => r.Status != "ARCHIVED")
                .Include(r => r.ClassAssignments)
                .ThenInclude(ca => ca.Class)
                .Include(r => r.QuestionGroups)
                .ThenInclude(g => g.Questions)
                .AsQueryable();

            if (userRole == "Teacher")
            {
                query = query.Where(r => r.CreatedById == userId || r.ClassAssignments.Any(ca => ca.Class.TeacherId == userId));
            }
            else if (userRole == "TA")
            {
                var taClassIds = await _db.ClassStaffAssignments
                    .Where(ta => ta.UserId == userId)
                    .Select(ta => ta.ClassId)
                    .ToListAsync();
                query = query.Where(r => r.ClassAssignments.Any(ca => taClassIds.Contains(ca.ClassId)));
            }

            var assignments = await query
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.ClassId,
                    r.Title,
                    r.DurationMinutes,
                    r.Status,
                    r.CreatedAt,
                    r.UpdatedAt,
                    QuestionCount = r.QuestionGroups.SelectMany(g => g.Questions).Count(),
                    AssignedClassesCount = r.ClassAssignments.Count(ca => ca.IsActive)
                })
                .ToListAsync();

            return Ok(assignments);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAssignment(int classId, [FromBody] CreateOrUpdateReadingDto dto)
        {
            if (!await HasAccessToClass(classId)) return Forbid();
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var assignment = new ReadingAssignment
            {
                ClassId = classId, // Legacy
                Title = dto.Title ?? "New Reading Assignment",
                DurationMinutes = dto.DurationMinutes > 0 ? dto.DurationMinutes : 60,
                Status = "DRAFT",
                CreatedById = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub")
            };
            
            _db.ReadingAssignments.Add(assignment);
            
            var classAssignment = new ReadingClassAssignment
            {
                ReadingAssignment = assignment,
                ClassId = classId,
                IsActive = true
            };
            _db.ReadingClassAssignments.Add(classAssignment);
            
            await _db.SaveChangesAsync();

            return Ok(new { assignment.Id });
        }

        [HttpPost("/api/teacher/reading/{id}/upload-docx")]
        public async Task<IActionResult> UploadDocx(int id, IFormFile file)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var assignment = await _db.ReadingAssignments
                .Include(r => r.Passage)
                .Include(r => r.QuestionGroups)
                .ThenInclude(g => g.Questions)
                .ThenInclude(q => q.AcceptedAnswers)
                .FirstOrDefaultAsync(r => r.Id == id && r.CreatedById == teacherId);

            if (assignment == null) return NotFound();

            if (file == null || file.Length == 0) return BadRequest(new { message = "Không tìm thấy file tải lên." });
            if (!file.FileName.EndsWith(".docx", System.StringComparison.OrdinalIgnoreCase)) return BadRequest(new { message = "File Word không hợp lệ. Vui lòng tải lên file .docx" });

            DocxReadingParser.ParseResult result;
            using (var stream = file.OpenReadStream())
            {
                result = _parser.Parse(stream);
            }



            if (assignment.Passage == null) assignment.Passage = new ReadingPassage();
            assignment.Passage.ContentHtml = result.PassageHtml;

            _db.ReadingQuestionGroups.RemoveRange(assignment.QuestionGroups);
            assignment.QuestionGroups.Clear();

            foreach (var g in result.QuestionGroups)
            {
                var group = new ReadingQuestionGroup
                {
                    Instruction = g.Instruction,
                    DisplayLabel = g.DisplayLabel,
                    AcademicQuestionType = g.AcademicQuestionType,
                    InteractionType = g.InteractionType,
                    AllowedAnswerDomain = g.AllowedAnswerDomain,
                    ReferenceItems = g.ReferenceItems,
                    StructuredContent = g.StructuredContent,
                    SortOrder = g.SortOrder
                };

                foreach (var q in g.Questions)
                {
                    group.Questions.Add(new ReadingQuestion
                    {
                        DisplayNumber = q.DisplayNumber,
                        Content = q.Content,
                        SortOrder = q.SortOrder,
                        Metadata = q.Metadata
                    });
                }
                assignment.QuestionGroups.Add(group);
            }

            AutoUpdateStatus(assignment);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Đã cập nhật bài đọc thành công.", status = assignment.Status });
        }

        [HttpGet("/api/teacher/reading/{id}")]
        public async Task<IActionResult> GetDetails(int id)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var assignment = await _db.ReadingAssignments
                .Include(r => r.Passage)
                .Include(r => r.QuestionGroups)
                .ThenInclude(g => g.Questions)
                .ThenInclude(q => q.AcceptedAnswers)
                .FirstOrDefaultAsync(r => r.Id == id && r.CreatedById == User.FindFirstValue(ClaimTypes.NameIdentifier));

            if (assignment == null) return NotFound();

            return Ok(new {
                assignment.Id,
                assignment.Title,
                assignment.DurationMinutes,
                assignment.Status,
                Passage = assignment.Passage?.ContentHtml,
                QuestionGroups = assignment.QuestionGroups.OrderBy(g => g.SortOrder).Select(g => new {
                    g.Id,
                    g.DisplayLabel,
                    g.Instruction,
                    g.AcademicQuestionType,
                    g.InteractionType,
                    g.AllowedAnswerDomain,
                    g.ReferenceItems,
                    g.StructuredContent,
                    g.SortOrder,
                    Questions = g.Questions.OrderBy(q => q.SortOrder).Select(q => new {
                        q.Id,
                        q.DisplayNumber,
                        q.Content,
                        q.SortOrder,
                        AcceptedAnswers = q.AcceptedAnswers.Select(a => new { a.Id, a.Answer, a.IsPrimary })
                    })
                })
            });
        }

        [HttpPut("/api/teacher/reading/{id}/info")]
        public async Task<IActionResult> UpdateInfo(int id, [FromBody] CreateOrUpdateReadingDto dto)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var assignment = await _db.ReadingAssignments
                .Include(r => r.Passage)
                .Include(r => r.QuestionGroups)
                .ThenInclude(g => g.Questions)
                .ThenInclude(q => q.AcceptedAnswers)
                .FirstOrDefaultAsync(r => r.Id == id && r.CreatedById == teacherId);
                
            if (assignment == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(dto.Title)) assignment.Title = dto.Title;
            if (dto.DurationMinutes > 0) assignment.DurationMinutes = dto.DurationMinutes;
            if (dto.PassageHtml != null && assignment.Passage != null)
            {
                assignment.Passage.ContentHtml = dto.PassageHtml;
            }

            AutoUpdateStatus(assignment);
            await _db.SaveChangesAsync();
            return Ok(new { status = assignment.Status });
        }

        [HttpPut("/api/teacher/reading/{id}/keys")]
        public async Task<IActionResult> SaveAnswerKeys(int id, [FromBody] System.Collections.Generic.Dictionary<int, string[]> keys)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var assignment = await _db.ReadingAssignments
                .Include(r => r.Passage)
                .Include(r => r.QuestionGroups)
                .ThenInclude(g => g.Questions)
                .ThenInclude(q => q.AcceptedAnswers)
                .FirstOrDefaultAsync(r => r.Id == id && r.CreatedById == teacherId);

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

            AutoUpdateStatus(assignment);
            await _db.SaveChangesAsync();
            return Ok(new { status = assignment.Status });
        }

        [HttpGet("/api/teacher/reading/{id}/attempts")]
        public async Task<IActionResult> GetAttempts(int id, [FromQuery] int? classId = null)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var query = _db.ReadingAttempts
                .Include(a => a.ClassEnrollment)
                .ThenInclude(ce => ce.StudentProfile)
                .Where(a => a.ReadingAssignmentId == id && a.SubmittedAt != null);

            if (classId.HasValue)
            {
                if (!await HasAccessToClass(classId.Value)) return Forbid();
                // Find all enrollments placed here for Reading
                var crossClassEnrollmentIds = _db.EnrollmentSkillAssignments
                    .Where(e => e.TargetClassId == classId.Value && e.Skill == IeltsSkill.READING && e.IsActive)
                    .Select(e => e.ClassEnrollmentId);

                // Find all enrollments placed away from here for Reading
                var awayEnrollmentIds = _db.EnrollmentSkillAssignments
                    .Where(e => e.SourceClassId == classId.Value && e.Skill == IeltsSkill.READING && e.IsActive)
                    .Select(e => e.ClassEnrollmentId);

                query = query.Where(a => 
                    (a.ClassEnrollment.ClassId == classId.Value && !awayEnrollmentIds.Contains(a.ClassEnrollmentId)) 
                    || crossClassEnrollmentIds.Contains(a.ClassEnrollmentId));
            }

            var attempts = await query
                .OrderByDescending(a => a.SubmittedAt)
                .Select(a => new {
                    a.Id,
                    a.AttemptNumber,
                    a.StartedAt,
                    a.SubmittedAt,
                    a.TimeSpentSeconds,
                    a.AllowedDurationSecondsSnapshot,
                    a.OvertimeSeconds,
                    a.CorrectCount,
                    a.TotalQuestions,
                    StudentId = a.ClassEnrollment.StudentProfile.UserId,
                    StudentName = a.ClassEnrollment.StudentProfile.FullName
                })
                .ToListAsync();

            return Ok(attempts);
        }

        [HttpGet("/api/teacher/reading/{id}/attempts/{attemptId}")]
        public async Task<IActionResult> GetAttemptDetails(int id, int attemptId)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var attempt = await _db.ReadingAttempts
                .Include(a => a.Answers)
                .Include(a => a.ClassEnrollment)
                .ThenInclude(ce => ce.StudentProfile)
                .FirstOrDefaultAsync(a => a.Id == attemptId && a.ReadingAssignmentId == id);

            if (attempt == null) return NotFound();

            return Ok(new {
                attempt.Id,
                attempt.AttemptNumber,
                attempt.StartedAt,
                attempt.SubmittedAt,
                attempt.TimeSpentSeconds,
                attempt.AllowedDurationSecondsSnapshot,
                attempt.OvertimeSeconds,
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

        [HttpPut("/api/teacher/reading/{id}/groups/{groupId}/interaction")]
        public async Task<IActionResult> UpdateGroupInteraction(int id, int groupId, [FromBody] InteractionTypeDto dto)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var group = await _db.ReadingQuestionGroups.FirstOrDefaultAsync(g => g.Id == groupId && g.ReadingAssignmentId == id);
            if (group == null) return NotFound();
            group.InteractionType = dto.Type;
            await _db.SaveChangesAsync();
            return Ok();
        }

        private void AutoUpdateStatus(ReadingAssignment assignment)
        {
            bool isValid = true;
            if (string.IsNullOrWhiteSpace(assignment.Title)) isValid = false;
            if (assignment.DurationMinutes <= 0) isValid = false;
            if (assignment.Passage == null || string.IsNullOrWhiteSpace(assignment.Passage.ContentHtml)) isValid = false;
            
            var allQuestions = assignment.QuestionGroups.SelectMany(g => g.Questions).ToList();
            if (!allQuestions.Any()) isValid = false;
            
            foreach (var q in allQuestions)
            {
                if (!q.AcceptedAnswers.Any(a => !string.IsNullOrWhiteSpace(a.Answer)))
                {
                    isValid = false;
                    break;
                }
            }

            assignment.Status = isValid ? "READY" : "DRAFT";
        }

        // --- NEW MULTI-CLASS ASSIGNMENT ENDPOINTS ---

        [HttpGet("/api/teacher/reading/{id}/classes")]
        public async Task<IActionResult> GetAssignedClasses(int id)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var assignment = await _db.ReadingAssignments
                .Include(r => r.ClassAssignments)
                .ThenInclude(ca => ca.Class)
                .FirstOrDefaultAsync(r => r.Id == id && r.CreatedById == teacherId);

            if (assignment == null) return NotFound();

            var allTeacherClasses = await _db.Classes
                .Where(c => c.TeacherId == teacherId)
                .Select(c => new { c.Id, c.Name, c.Code })
                .ToListAsync();

            var assignedClassIds = assignment.ClassAssignments.Where(ca => ca.IsActive).Select(ca => ca.ClassId).ToHashSet();

            return Ok(new {
                assignedClassIds = assignedClassIds,
                availableClasses = allTeacherClasses
            });
        }

        [HttpPost("/api/teacher/reading/{id}/assign")]
        public async Task<IActionResult> AssignToClasses(int id, [FromBody] System.Collections.Generic.List<int> classIds)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var assignment = await _db.ReadingAssignments
                .Include(r => r.ClassAssignments)
                .FirstOrDefaultAsync(r => r.Id == id && r.CreatedById == teacherId);

            if (assignment == null) return NotFound();

            var validClasses = await _db.Classes
                .Where(c => c.TeacherId == teacherId && classIds.Contains(c.Id))
                .Select(c => c.Id)
                .ToListAsync();

            // Deactivate those not in the list
            foreach (var ca in assignment.ClassAssignments)
            {
                if (!validClasses.Contains(ca.ClassId))
                {
                    ca.IsActive = false;
                }
                else
                {
                    ca.IsActive = true;
                }
            }

            // Add new ones
            var existingIds = assignment.ClassAssignments.Select(ca => ca.ClassId).ToHashSet();
            foreach (var cid in validClasses)
            {
                if (!existingIds.Contains(cid))
                {
                    assignment.ClassAssignments.Add(new ReadingClassAssignment
                    {
                        ClassId = cid,
                        IsActive = true,
                        AssignedAt = System.DateTime.UtcNow
                    });
                }
            }

            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("/api/teacher/reading/{id}/results-by-class")]
        public async Task<IActionResult> GetResultsByClass(int id)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var assignment = await _db.ReadingAssignments
                .Include(r => r.ClassAssignments)
                .ThenInclude(ca => ca.Class)
                .FirstOrDefaultAsync(r => r.Id == id && r.CreatedById == teacherId);

            if (assignment == null) return NotFound();

            var results = new System.Collections.Generic.List<object>();
            
            foreach (var ca in assignment.ClassAssignments.Where(c => c.IsActive || c.Class != null)) // show all historically assigned too
            {
                var enrollments = await _db.ClassEnrollments
                    .Where(ce => ce.ClassId == ca.ClassId && ce.IsActive)
                    .ToListAsync();
                    
                var attempts = await _db.ReadingAttempts
                    .Where(a => a.ReadingAssignmentId == id && a.ClassEnrollment.ClassId == ca.ClassId && a.SubmittedAt != null)
                    .Select(a => a.ClassEnrollmentId)
                    .Distinct()
                    .ToListAsync();

                results.Add(new {
                    ClassId = ca.ClassId,
                    ClassName = ca.Class.Name,
                    TotalStudents = enrollments.Count,
                    CompletedCount = attempts.Count,
                    NotCompletedCount = enrollments.Count - attempts.Count,
                    IsActive = ca.IsActive
                });
            }

            return Ok(results);
        }
    }
}
