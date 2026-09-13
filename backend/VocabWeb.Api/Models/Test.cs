namespace VocabWeb.Api.Models;

public class Test
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }

    public string TeacherId { get; set; } = string.Empty;
    public ApplicationUser Teacher { get; set; } = null!;

    public int VocabularySetId { get; set; }
    public VocabularySet VocabularySet { get; set; } = null!;

    public int? ClassId { get; set; }
    public Class? Class { get; set; }

    /// <summary>
    /// Comma-separated list of enabled canonical test types:
    /// WORD_TO_MEANING, MEANING_TO_WORD, LISTEN_TO_WORD, LISTEN_TO_MEANING,
    /// MEANING_TO_TYPE_WORD, LISTEN_TO_TYPE_WORD, WORD_TO_TYPE_MEANING,
    /// MISSING_LETTERS, UNSCRAMBLE_WORD, MATCH_WORD_MEANING, PRONUNCIATION
    /// </summary>
    public string EnabledTypes { get; set; } = "WORD_TO_MEANING,MEANING_TO_WORD";

    public int TotalQuestions { get; set; } = 20;
    public int? TimeLimitMinutes { get; set; }
    public decimal PassScore { get; set; } = 5.0m;

    // Access Controls
    public string PublicCode { get; set; } = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();
    public bool RequiresAccessCode { get; set; } = false;
    public string? AccessCodeHash { get; set; }
    public int? MaxAttempts { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? Deadline { get; set; }

    public bool IsArchived { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<TestAttempt> Attempts { get; set; } = new List<TestAttempt>();
}
