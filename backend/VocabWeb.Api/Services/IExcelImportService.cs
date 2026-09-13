using VocabWeb.Api.DTOs;

namespace VocabWeb.Api.Services;

public interface IExcelImportService
{
    Task<ImportResultDto> ImportVocabularyFileAsync(Stream fileStream, string fileName);
}
