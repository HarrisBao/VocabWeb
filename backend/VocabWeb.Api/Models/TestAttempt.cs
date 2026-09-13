namespace VocabWeb.Api.Models;

public class TestAttempt
{
    public int Id { get; set; }
    public int TestId { get; set; }
    public Test Test { get; set; } = null!;

    public string StudentId { get; set; } = string.Empty;
    public ApplicationUser Student { get; set; } = null!;

    public decimal Score { get; set; } // 0.0 to 10.0 scale, 1 decimal place
    public int CorrectCount { get; set; }
    public int TotalQuestions { get; set; }
    public int DurationSeconds { get; set; }

    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SubmittedAt { get; set; }

    public ICollection<AttemptAnswer> Answers { get; set; } = new List<AttemptAnswer>();
}
