const fs = require('fs');

let content = fs.readFileSync('backend/VocabWeb.Api/Controllers/LearnTestSessionController.cs', 'utf8');

content = content.replace(/\r\n/g, '\n');

const newDiscardMethod = `        [HttpDelete("{id}/attempts/{attemptId}/discard")]
        public async Task<IActionResult> DiscardAttempt(int id, int attemptId)
        {
            var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (userId == null) return Unauthorized();

            var session = await _db.ClassSessionTests
                .Include(s => s.ClassSession)
                .FirstOrDefaultAsync(s => s.Id == id);
            
            if (session == null) return NotFound();

            var studentProfile = await _db.StudentProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (studentProfile == null) return Forbid();

            var enrollment = await _db.ClassEnrollments
                .FirstOrDefaultAsync(ce => ce.ClassId == session.ClassSession.ClassId && ce.StudentProfileId == studentProfile.Id);
            
            if (enrollment == null) return Forbid();

            // Wipe out ALL ghost attempts for this session and this student
            var ghostAttempts = await _db.TestAttempts
                .Include(a => a.Answers)
                .Where(a => a.ClassSessionTestId == id && a.ClassEnrollmentId == enrollment.Id && a.SubmittedAt == null)
                .ToListAsync();

            if (!ghostAttempts.Any()) return NotFound("Khong tim thay luot lam bai.");

            foreach (var ghost in ghostAttempts)
            {
                _db.AttemptAnswers.RemoveRange(ghost.Answers);
            }
            
            _db.TestAttempts.RemoveRange(ghostAttempts);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Da huy luot kiem tra hien tai." });
        }`;

content = content.replace(
    /\[HttpDelete\("\{id\}\/attempts\/\{attemptId\}\/discard"\)\][\s\S]*?return Ok\(new \{ message = ".*?" \}\);\n\s*\}/,
    newDiscardMethod
);

fs.writeFileSync('backend/VocabWeb.Api/Controllers/LearnTestSessionController.cs', content);
console.log("Test discard updated:", content.includes("ghostAttempts"));
