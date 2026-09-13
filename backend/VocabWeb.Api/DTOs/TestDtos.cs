using System.ComponentModel.DataAnnotations;

namespace VocabWeb.Api.DTOs;

public class TestDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int VocabularySetId { get; set; }
    public string VocabularySetTitle { get; set; } = string.Empty;
    public int? ClassId { get; set; }
    public string? ClassName { get; set; }
    public List<string> EnabledTypes { get; set; } = new();
    public int TotalQuestions { get; set; }
    public int? TimeLimitMinutes { get; set; }
    public decimal PassScore { get; set; }

    public string PublicCode { get; set; } = string.Empty;
    public bool RequiresAccessCode { get; set; }
    public int? MaxAttempts { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? Deadline { get; set; }

    public int AttemptCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTestDto
{
    [Required(ErrorMessage = "Tiêu đề bài kiểm tra không được để trống")]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required(ErrorMessage = "Vui lòng chọn bộ từ vựng nguồn")]
    public int VocabularySetId { get; set; }

    public int? ClassId { get; set; }

    [Required(ErrorMessage = "Vui lòng chọn ít nhất 1 loại câu hỏi")]
    public List<string> EnabledTypes { get; set; } = new();

    [Range(5, 100, ErrorMessage = "Số câu hỏi từ 5 đến 100 câu")]
    public int TotalQuestions { get; set; } = 20;

    public int? TimeLimitMinutes { get; set; }

    [Range(0, 10, ErrorMessage = "Điểm đạt thang 10")]
    public decimal PassScore { get; set; } = 5.0m;

    public bool RequiresAccessCode { get; set; }

    [MaxLength(64)]
    public string? NewAccessCode { get; set; }

    [Range(1, 100)]
    public int? MaxAttempts { get; set; }

    public DateTime? StartDate { get; set; }
    public DateTime? Deadline { get; set; }
}

public class GeneratedQuestionDto
{
    public int QuestionIndex { get; set; }
    public string Type { get; set; } = string.Empty; // Canonical identifier
    public string TypeLabel { get; set; } = string.Empty; // Vietnamese display label
    public string Prompt { get; set; } = string.Empty;
    public string? TargetWord { get; set; }
    public string? TargetMeaning { get; set; }
    public string? CorrectAnswer { get; set; }
    public List<string> Options { get; set; } = new();
    public List<MatchingPairDto>? MatchingPairs { get; set; }
    public string? AudioText { get; set; }
}

public class MatchingPairDto
{
    public string Word { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
}

public class TestPreviewDto
{
    public int TestId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int TotalGeneratedQuestions { get; set; }
    public List<GeneratedQuestionDto> Questions { get; set; } = new();
}
