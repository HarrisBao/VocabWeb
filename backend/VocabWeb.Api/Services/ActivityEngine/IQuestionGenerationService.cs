using System.Collections.Generic;
using VocabWeb.Api.Models;
using VocabWeb.Api.Models.ActivityEngine;

namespace VocabWeb.Api.Services.ActivityEngine;

public interface IQuestionGenerationService
{
    /// <summary>
    /// Sinh danh sách câu hỏi dựa trên các hoạt động được yêu cầu.
    /// Thực thi: Random engine, duplicate meaning rule, và question quality rule.
    /// </summary>
    /// <param name="vocabularyItems">Danh sách từ vựng nguồn.</param>
    /// <param name="requestedActivityTypes">Danh sách các loại activity cần tạo.</param>
    /// <param name="totalQuestions">Tổng số câu hỏi mong muốn.</param>
    /// <returns>Danh sách câu hỏi đã được tạo hợp lệ.</returns>
    List<GeneratedQuestion> GenerateQuestions(List<VocabularyItem> vocabularyItems, List<ActivityType> requestedActivityTypes, int totalQuestions);

    /// <summary>
    /// Trả về metadata cấu hình của các hoạt động.
    /// </summary>
    List<ActivityDefinition> GetActivityDefinitions();
}
