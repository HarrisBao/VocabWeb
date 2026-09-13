using System.Collections.Generic;
using VocabWeb.Api.Models;
using VocabWeb.Api.Models.ActivityEngine;

namespace VocabWeb.Api.Services.ActivityEngine;

public interface IAnswerEvaluationService
{
    /// <summary>
    /// Chấm điểm danh sách câu trả lời.
    /// Tính tổng điểm (thang điểm 10): CorrectValidQuestions / TotalValidQuestions * 10.
    /// Các câu TechnicalFailure (hư mic, lỗi audio) sẽ bị loại khỏi TotalValidQuestions.
    /// </summary>
    /// <param name="submissions">Danh sách câu trả lời của user.</param>
    /// <param name="vocabularyItems">Danh sách từ vựng gốc để đối chiếu đáp án.</param>
    /// <returns>Danh sách chi tiết kết quả từng câu và điểm tổng.</returns>
    (List<EvaluationResult> Results, double FinalScore) EvaluateAnswers(List<UserAnswerSubmission> submissions, List<VocabularyItem> vocabularyItems);
}
