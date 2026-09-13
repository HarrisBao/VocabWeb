namespace VocabWeb.Api.Models;

public class AttemptAnswer
{
    public int Id { get; set; }
    public int TestAttemptId { get; set; }
    public TestAttempt TestAttempt { get; set; } = null!;

    public int? VocabularyItemId { get; set; }
    public VocabularyItem? VocabularyItem { get; set; }

    public string QuestionType { get; set; } = string.Empty;
    public string QuestionPrompt { get; set; } = string.Empty;
    public string UserAnswer { get; set; } = string.Empty;
    public string CorrectAnswer { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}
