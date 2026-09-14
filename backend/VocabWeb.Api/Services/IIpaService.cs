using VocabWeb.Api.DTOs;
using VocabWeb.Api.Models;

namespace VocabWeb.Api.Services;

public interface IIpaService
{
    Task<string?> GenerateIpaForWordAsync(string word);
    Task<GenerateIpaResultDto> GenerateMissingIpaAsync(List<VocabularyItem> items);
}
