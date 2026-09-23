const fs = require('fs');

let content = fs.readFileSync('backend/VocabWeb.Api/Controllers/LearnReadingController.cs', 'utf8');

// Normalize CRLF
content = content.replace(/\r\n/g, '\n');

const newDiscardMethod = `        [HttpDelete("{id}/attempts/{attemptId}/discard")]
        public async Task<IActionResult> DiscardAttempt(int classId, int id, int attemptId)
        {
            var enrollment = await GetEnrollment(classId);
            if (enrollment == null) return Forbid();

            // Fetch ALL unsubmitted attempts to wipe out any ghost attempts caused by previous bugs
            var ghostAttempts = await _db.ReadingAttempts
                .Include(a => a.Answers)
                .Where(a => a.ReadingAssignmentId == id && a.ClassEnrollmentId == enrollment.Id && a.SubmittedAt == null)
                .ToListAsync();

            if (!ghostAttempts.Any()) return NotFound("Khong tim thay luot lam bai.");

            // Remove answers first
            foreach (var ghost in ghostAttempts)
            {
                _db.ReadingAttemptAnswers.RemoveRange(ghost.Answers);
            }
            
            // Remove the attempts themselves
            _db.ReadingAttempts.RemoveRange(ghostAttempts);

            await _db.SaveChangesAsync();

            return Ok(new { message = "Da huy luot lam bai hien tai." });
        }`;

// Replace the old DiscardAttempt method
content = content.replace(
    /\[HttpDelete\("\{id\}\/attempts\/\{attemptId\}\/discard"\)\][\s\S]*?return Ok\(new \{ message = ".*?" \}\);\n\s*\}/,
    newDiscardMethod
);

// We also need to fix GetAssignment and StartAttempt to use OrderByDescending(a => a.StartedAt)
content = content.replace(
    /var activeAttempt = await _db\.ReadingAttempts\n\s*\.Include\(a => a\.Answers\)\n\s*\.FirstOrDefaultAsync\(a => a\.ReadingAssignmentId == id && a\.ClassEnrollmentId == enrollment\.Id && a\.SubmittedAt == null\);/g,
    `var activeAttempt = await _db.ReadingAttempts
                .Include(a => a.Answers)
                .OrderByDescending(a => a.StartedAt)
                .FirstOrDefaultAsync(a => a.ReadingAssignmentId == id && a.ClassEnrollmentId == enrollment.Id && a.SubmittedAt == null);`
);

content = content.replace(
    /var activeAttempt = await _db\.ReadingAttempts\n\s*\.FirstOrDefaultAsync\(a => a\.ReadingAssignmentId == id && a\.ClassEnrollmentId == enrollment\.Id && a\.SubmittedAt == null\);/g,
    `var activeAttempt = await _db.ReadingAttempts
                .OrderByDescending(a => a.StartedAt)
                .FirstOrDefaultAsync(a => a.ReadingAssignmentId == id && a.ClassEnrollmentId == enrollment.Id && a.SubmittedAt == null);`
);

fs.writeFileSync('backend/VocabWeb.Api/Controllers/LearnReadingController.cs', content);
console.log("DiscardAttempt updated:", content.includes("ghostAttempts"));
