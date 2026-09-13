using System.Collections.Generic;
using VocabWeb.Api.Models;
using VocabWeb.Api.Models.ActivityEngine;

namespace VocabWeb.Api.Services.ActivityEngine;

public interface IQuestionGenerationService
{
    /// <summary>
    /// Sinh danh sách câu hỏi dựa trên các hoạt động được yêu cầu, sử dụng Global Coverage Planner.
    /// </summary>
    /// <param name="vocabularyItems">Danh sách từ vựng nguồn.</param>
    /// <param name="requestedActivityTypes">Danh sách các loại activity cần tạo.</param>
    /// <returns>Danh sách câu hỏi đã được tạo hợp lệ.</returns>
    List<GeneratedQuestion> GenerateQuestions(List<VocabularyItem> vocabularyItems, List<ActivityType> requestedActivityTypes);

    /// <summary>
    /// Trả về metadata cấu hình của các hoạt động.
    /// </summary>
    List<ActivityDefinition> GetActivityDefinitions();
}
