using VocabWeb.Api.DTOs;
using VocabWeb.Api.Models;

namespace VocabWeb.Api.Services;

public interface IIpaService
{
    string? GenerateIpaForWord(string word);
    GenerateIpaResultDto GenerateMissingIpa(List<VocabularyItem> items);
}
