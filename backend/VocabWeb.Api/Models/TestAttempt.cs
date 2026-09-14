namespace VocabWeb.Api.Models;

public class TestAttempt
{
    public int Id { get; set; }
    public int TestId { get; set; }
    public Test Test { get; set; } = null!;

    public string? StudentId { get; set; }
    public ApplicationUser? Student { get; set; }

    public int? ClassEnrollmentId { get; set; }
    public ClassEnrollment? ClassEnrollment { get; set; }

    public string? GuestDisplayName { get; set; }
    public string? GuestSessionId { get; set; }
    public string? ParticipantDisplayNameSnapshot { get; set; }

    // Snapshot of sequence and plan
    public string ActivitySequenceSnapshot { get; set; } = string.Empty;
    public string? ActivityPlanJson { get; set; }
    public int? TimeLimitSnapshotMinutes { get; set; }
    
    public int CurrentStageIndex { get; set; } = 0;

    public int AttemptNumber { get; set; } = 1;
    public string Status { get; set; } = "IN_PROGRESS"; // IN_PROGRESS, SUBMITTED, ABANDONED

    public decimal Score { get; set; } // 0.0 to 10.0 scale, 1 decimal place
    public int CorrectCount { get; set; }
    public int TotalQuestions { get; set; }
    public int DurationSeconds { get; set; }

    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SubmittedAt { get; set; }

    public ICollection<AttemptAnswer> Answers { get; set; } = new List<AttemptAnswer>();
}
