const fs = require('fs');
let content = fs.readFileSync('backend/VocabWeb.Api/Controllers/LearnTestSessionController.cs', 'utf8');

const targetStr = `    [HttpPost("{attemptId}/submit")]`;
const discardEndpoint = `    [HttpDelete("{attemptId}/discard")]
    [AllowAnonymous]
    public async Task<IActionResult> DiscardAttempt(int attemptId, [FromHeader(Name = "X-Access-Ticket")] string ticket)
    {
        var attempt = await ValidateAndGetAttempt(attemptId, ticket);
        if (attempt == null) return Unauthorized(new { message = "Không có quyền truy cập lượt làm bài này." });

        if (attempt.Status != "IN_PROGRESS")
            return BadRequest(new { message = "Không thể hủy lượt làm bài đã kết thúc hoặc đã nộp." });

        // Remove answers
        _db.TestAttemptAnswers.RemoveRange(attempt.Answers);

        // Remove attempt
        _db.TestAttempts.Remove(attempt);

        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã hủy bài kiểm tra hiện tại." });
    }

`;

if (!content.includes('DiscardAttempt(int attemptId')) {
    content = content.replace(targetStr, discardEndpoint + targetStr);
    fs.writeFileSync('backend/VocabWeb.Api/Controllers/LearnTestSessionController.cs', content);
    console.log('Added DiscardAttempt to LearnTestSessionController');
} else {
    console.log('DiscardAttempt already exists');
}
