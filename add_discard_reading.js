const fs = require('fs');
let content = fs.readFileSync('backend/VocabWeb.Api/Controllers/LearnReadingController.cs', 'utf8');

const targetStr = `        [HttpPost("{id}/start")]`;
const discardEndpoint = `        [HttpDelete("{id}/attempts/{attemptId}/discard")]
        public async Task<IActionResult> DiscardAttempt(int classId, int id, int attemptId)
        {
            var enrollment = await GetEnrollment(classId);
            if (enrollment == null) return Forbid();

            var attempt = await _db.ReadingAttempts
                .Include(a => a.Answers)
                .FirstOrDefaultAsync(a => a.Id == attemptId && a.ReadingAssignmentId == id && a.ClassEnrollmentId == enrollment.Id);

            if (attempt == null) return NotFound("Không tìm thấy lượt làm bài.");
            if (attempt.SubmittedAt != null) return BadRequest("Không thể hủy lượt làm bài đã nộp.");

            // Remove answers first
            _db.ReadingAttemptAnswers.RemoveRange(attempt.Answers);
            
            // Remove the attempt itself
            _db.ReadingAttempts.Remove(attempt);

            await _db.SaveChangesAsync();

            return Ok(new { message = "Đã hủy lượt làm bài hiện tại." });
        }

`;

if (!content.includes('DiscardAttempt(int classId')) {
    content = content.replace(targetStr, discardEndpoint + targetStr);
    fs.writeFileSync('backend/VocabWeb.Api/Controllers/LearnReadingController.cs', content);
    console.log('Added DiscardAttempt to LearnReadingController');
} else {
    console.log('DiscardAttempt already exists');
}
