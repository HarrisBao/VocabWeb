using VocabWeb.Api.DTOs;
using VocabWeb.Api.Models;

namespace VocabWeb.Api.Services;

public interface IQuestionEngineService
{
    TestPreviewDto GenerateTestQuestions(Test test, List<VocabularyItem> items);
    string NormalizeMeaning(string meaning);
}
