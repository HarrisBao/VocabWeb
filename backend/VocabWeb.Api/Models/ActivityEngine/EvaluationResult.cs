namespace VocabWeb.Api.Models.ActivityEngine;

public class EvaluationResult
{
    public string QuestionId { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    
    /// <summary>
    /// Báo hiệu nếu có lỗi kỹ thuật (vd: lỗi mic, lỗi audio block) để không tính vào tổng câu sai.
    /// </summary>
    public bool TechnicalFailure { get; set; }
    
    public string UserAnswer { get; set; } = string.Empty;
    public string CorrectAnswer { get; set; } = string.Empty;
}

public class UserAnswerSubmission
{
    public string QuestionId { get; set; } = string.Empty;
    public int TargetVocabularyItemId { get; set; }
    public ActivityType Type { get; set; }
    
    /// <summary>
    /// Câu trả lời của người dùng (ID cho trắc nghiệm, chuỗi gõ cho điền từ).
    /// </summary>
    public string AnswerValue { get; set; } = string.Empty;
    
    public bool TechnicalFailure { get; set; }
}
