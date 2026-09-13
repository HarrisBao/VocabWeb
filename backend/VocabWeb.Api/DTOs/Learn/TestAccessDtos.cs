namespace VocabWeb.Api.DTOs.Learn;

public class PublicTestMetadataDto
{
    public string PublicCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool RequiresAccessCode { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? Deadline { get; set; }
    public int? MaxAttempts { get; set; }
    public int TotalQuestions { get; set; }
    public int? TimeLimitMinutes { get; set; }
    public decimal PassScore { get; set; }
}

public class TestAccessRequestDto
{
    public string? GuestDisplayName { get; set; }
    public string? GuestSessionId { get; set; }
    public string? AccessCode { get; set; }
}

public class TestAccessResponseDto
{
    public bool AccessGranted { get; set; }
    public string? AccessTicket { get; set; }
    public string? ParticipantDisplayName { get; set; }
    public int RemainingAttempts { get; set; }
}

public class StartAttemptResponseDto
{
    public int AttemptId { get; set; }
    public int AttemptNumber { get; set; }
    public DateTime StartedAt { get; set; }
    public PublicTestMetadataDto TestMetadata { get; set; } = null!;
}
