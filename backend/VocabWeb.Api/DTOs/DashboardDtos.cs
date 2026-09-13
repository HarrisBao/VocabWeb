namespace VocabWeb.Api.DTOs;

public class DashboardStatsDto
{
    public int TotalVocabularySets { get; set; }
    public int TotalClasses { get; set; }
    public int TotalTests { get; set; }
    public int TotalWords { get; set; }

    public List<VocabularySetDto> RecentVocabularySets { get; set; } = new();
    public List<ClassDto> RecentClasses { get; set; } = new();
    public List<TestDto> RecentTests { get; set; } = new();
}

public class TestAttemptSummaryDto
{
    public int Id { get; set; }
    public int TestId { get; set; }
    public string TestTitle { get; set; } = string.Empty;
    public string StudentId { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string StudentEmail { get; set; } = string.Empty;
    public decimal Score { get; set; }
    public int CorrectCount { get; set; }
    public int TotalQuestions { get; set; }
    public int DurationSeconds { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public bool IsPassed { get; set; }
}

public class TeacherResultsOverviewDto
{
    public int TotalAttempts { get; set; }
    public decimal? AverageScore { get; set; }
    public decimal? PassRate { get; set; }
    public List<TestAttemptSummaryDto> RecentAttempts { get; set; } = new();
}
