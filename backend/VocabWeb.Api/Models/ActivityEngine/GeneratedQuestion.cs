using System.Collections.Generic;

namespace VocabWeb.Api.Models.ActivityEngine;

public class GeneratedQuestion
{
    public string QuestionId { get; set; } = string.Empty;
    public ActivityType Type { get; set; }

    /// <summary>
    /// ID của VocabularyItem làm mục tiêu cho câu hỏi này.
    /// </summary>
    public int TargetVocabularyItemId { get; set; }

    /// <summary>
    /// Thông báo/Câu hỏi hiển thị cho người dùng (ví dụ: nghĩa của từ, hoặc chữ cái còn thiếu).
    /// </summary>
    public string QuestionPrompt { get; set; } = string.Empty;

    /// <summary>
    /// Chứa danh sách các lựa chọn (cho dạng trắc nghiệm).
    /// Các dạng gõ chữ hoặc phát âm có thể để trống.
    /// </summary>
    public List<QuestionOption> Options { get; set; } = new();

    public AudioBehavior AudioBehavior { get; set; }
}

public class QuestionOption
{
    public int VocabularyItemId { get; set; }
    public string Text { get; set; } = string.Empty;
}
