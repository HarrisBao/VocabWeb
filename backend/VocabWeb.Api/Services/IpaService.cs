using System.Text.Json;
using VocabWeb.Api.DTOs;
using VocabWeb.Api.Models;

namespace VocabWeb.Api.Services;

public class IpaService : IIpaService
{
    private readonly IHttpClientFactory _httpClientFactory;

    public IpaService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<string?> GenerateIpaForWordAsync(string word)
    {
        if (string.IsNullOrWhiteSpace(word)) return null;

        var clean = word.Trim().ToLowerInvariant();
        try
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(5);
            var response = await client.GetAsync($"https://api.dictionaryapi.dev/api/v2/entries/en/{Uri.EscapeDataString(clean)}");

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var content = await response.Content.ReadAsStringAsync();
            var json = JsonDocument.Parse(content);
            var root = json.RootElement;

            if (root.ValueKind == JsonValueKind.Array && root.GetArrayLength() > 0)
            {
                var entry = root[0];
                string? fallbackIpa = null;
                
                if (entry.TryGetProperty("phonetics", out var phoneticsProp) && phoneticsProp.ValueKind == JsonValueKind.Array)
                {
                    foreach (var p in phoneticsProp.EnumerateArray())
                    {
                        string? currentText = null;
                        if (p.TryGetProperty("text", out var textProp) && textProp.ValueKind == JsonValueKind.String)
                        {
                            currentText = textProp.GetString();
                        }
                        
                        if (string.IsNullOrEmpty(currentText)) continue;
                        
                        fallbackIpa ??= currentText;
                        
                        if (p.TryGetProperty("audio", out var audioProp) && audioProp.ValueKind == JsonValueKind.String)
                        {
                            var audioUrl = audioProp.GetString() ?? "";
                            if (audioUrl.Contains("-uk.mp3", StringComparison.OrdinalIgnoreCase))
                            {
                                return currentText;
                            }
                        }
                    }
                }
                
                if (!string.IsNullOrEmpty(fallbackIpa)) return fallbackIpa;

                if (entry.TryGetProperty("phonetic", out var phoneticProp) && phoneticProp.ValueKind == JsonValueKind.String)
                {
                    var ipa = phoneticProp.GetString();
                    if (!string.IsNullOrEmpty(ipa)) return ipa;
                }
            }
        }
        catch
        {
            // Ignore network or parsing errors and fallback to null
        }

        return null; // Remove the spelling-based IPA fallback
    }

    public async Task<GenerateIpaResultDto> GenerateMissingIpaAsync(List<VocabularyItem> items)
    {
        var result = new GenerateIpaResultDto();
        var missing = items.Where(i => string.IsNullOrWhiteSpace(i.IPA)).ToList();
        result.TotalMissingFound = missing.Count;

        // Process sequentially to avoid rate-limiting if there are many words.
        // Dictionary API is free but has limits.
        foreach (var item in missing)
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
        }

        return result;
    }
}
