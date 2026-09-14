using System.Text.Json;
using Microsoft.Extensions.Logging;
using VocabWeb.Api.DTOs;
using VocabWeb.Api.Models;

namespace VocabWeb.Api.Services;

public class IpaService : IIpaService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<IpaService> _logger;

    public IpaService(IHttpClientFactory httpClientFactory, ILogger<IpaService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<string?> GenerateIpaForWordAsync(string word)
    {
        if (string.IsNullOrWhiteSpace(word))
            return null;

        var clean = word.Trim().ToLowerInvariant();

        var primary = await TryGetIpaFromSuvankarAsync(clean);
        if (IsValidIpa(primary, clean))
            return NormalizeIpa(primary);

        var fallback = await TryGetIpaFromDictionaryApiAsync(clean);
        if (IsValidIpa(fallback, clean))
            return NormalizeIpa(fallback);

        return null;
    }

    private async Task<string?> TryGetIpaFromSuvankarAsync(string word)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(8);
            var url = $"https://api.suvankar.cc/dictionaryapi/v1/definitions/en/{Uri.EscapeDataString(word)}";
            var response = await client.GetAsync(url);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("IPA provider Suvankar failed for word {Word} with status {StatusCode}", word, (int)response.StatusCode);
                return null;
            }

            var content = await response.Content.ReadAsStringAsync();
            using var json = JsonDocument.Parse(content);
            var root = json.RootElement;
            
            string? fallbackIpa = null;
            
            if (root.TryGetProperty("sounds", out var soundsProp) && soundsProp.ValueKind == JsonValueKind.Array)
            {
                foreach (var sound in soundsProp.EnumerateArray())
                {
                    if (sound.TryGetProperty("ipa", out var ipaProp) && ipaProp.ValueKind == JsonValueKind.String)
                    {
                        var ipa = ipaProp.GetString();
                        if (string.IsNullOrWhiteSpace(ipa)) continue;
                        
                        fallbackIpa ??= ipa;
                        
                        if (sound.TryGetProperty("tags", out var tagsProp) && tagsProp.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var tag in tagsProp.EnumerateArray())
                            {
                                var tagStr = tag.GetString();
                                if (tagStr == "Received-Pronunciation" || tagStr == "UK" || tagStr == "Received Pronunciation")
                                {
                                    return ipa;
                                }
                            }
                        }
                    }
                }
            }
            
            if (!string.IsNullOrWhiteSpace(fallbackIpa)) return fallbackIpa;
            
            if (root.TryGetProperty("ipa", out var rootIpa) && rootIpa.ValueKind == JsonValueKind.String)
            {
                return rootIpa.GetString();
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "IPA lookup failed using Suvankar for word {Word}", word);
        }
        return null;
    }

    private async Task<string?> TryGetIpaFromDictionaryApiAsync(string word)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(8);
            var url = $"https://api.dictionaryapi.dev/api/v2/entries/en/{Uri.EscapeDataString(word)}";
            var response = await client.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("IPA provider DictionaryApi failed for word {Word} with status {StatusCode}", word, (int)response.StatusCode);
                return null;
            }

            var content = await response.Content.ReadAsStringAsync();
            using var json = JsonDocument.Parse(content);
            var root = json.RootElement;

            if (root.ValueKind != JsonValueKind.Array || root.GetArrayLength() == 0)
                return null;

            var entry = root[0];
            string? fallbackIpa = null;

            if (entry.TryGetProperty("phonetics", out var phoneticsProp) && phoneticsProp.ValueKind == JsonValueKind.Array)
            {
                foreach (var phonetic in phoneticsProp.EnumerateArray())
                {
                    if (!phonetic.TryGetProperty("text", out var textProp) || textProp.ValueKind != JsonValueKind.String)
                        continue;

                    var ipa = textProp.GetString();
                    if (string.IsNullOrWhiteSpace(ipa)) continue;

                    fallbackIpa ??= ipa;

                    if (phonetic.TryGetProperty("audio", out var audioProp) && audioProp.ValueKind == JsonValueKind.String)
                    {
                        var audioUrl = audioProp.GetString() ?? "";
                        if (audioUrl.Contains("-uk.mp3", StringComparison.OrdinalIgnoreCase))
                            return ipa;
                    }
                }
            }

            if (!string.IsNullOrWhiteSpace(fallbackIpa)) return fallbackIpa;

            if (entry.TryGetProperty("phonetic", out var phoneticProp) && phoneticProp.ValueKind == JsonValueKind.String)
                return phoneticProp.GetString();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "IPA lookup failed using DictionaryApi for word {Word}", word);
        }
        return null;
    }

    private bool IsValidIpa(string? ipa, string word)
    {
        if (string.IsNullOrWhiteSpace(ipa)) return false;
        var cleanIpa = ipa.Replace("/", "").Trim().ToLowerInvariant();
        if (cleanIpa == word.Trim().ToLowerInvariant()) return false;
        if (cleanIpa.Contains("html") || cleanIpa.Contains("{") || cleanIpa.Contains("}")) return false;
        return true;
    }

    private string? NormalizeIpa(string? ipa)
    {
        if (string.IsNullOrWhiteSpace(ipa)) return null;
        var clean = ipa.Replace("/", "").Trim();
        return $"/{clean}/";
    }

    private bool IsMissingOrLegacyInvalidIpa(VocabularyItem item)
    {
        if (string.IsNullOrWhiteSpace(item.IPA)) return true;
        var cleanIpa = item.IPA.Replace("/", "").Trim().ToLowerInvariant();
        var cleanWord = item.Word.Trim().ToLowerInvariant();
        return cleanIpa == cleanWord;
    }

    public async Task<GenerateIpaResultDto> GenerateMissingIpaAsync(List<VocabularyItem> items)
    {
        var result = new GenerateIpaResultDto();
        var toGenerate = items.Where(IsMissingOrLegacyInvalidIpa).ToList();
        result.TotalMissingFound = toGenerate.Count;

        foreach (var item in toGenerate)
        {
            var generated = await GenerateIpaForWordAsync(item.Word);
            if (!string.IsNullOrEmpty(generated))
            {
                item.IPA = generated;
                result.GeneratedCount++;
                result.UpdatedItems.Add(new VocabularyItemDto
                {
                    Id = item.Id,
                    Word = item.Word,
                    Meaning = item.Meaning,
                    IPA = item.IPA,
                    Example = item.Example,
                    OrderIndex = item.OrderIndex
                });
            }
            else
            {
                result.UnresolvedCount++;
            }
        }

        return result;
    }
}
