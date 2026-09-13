using System.Text.RegularExpressions;
using VocabWeb.Api.DTOs;
using VocabWeb.Api.Models;

namespace VocabWeb.Api.Services;

public class QuestionEngineService : IQuestionEngineService
{
    private static readonly Dictionary<string, string> TypeLabels = new()
    {
        ["WORD_TO_MEANING"] = "Từ → Chọn nghĩa",
        ["MEANING_TO_WORD"] = "Nghĩa → Chọn từ",
        ["LISTEN_TO_WORD"] = "Nghe → Chọn từ",
        ["LISTEN_TO_MEANING"] = "Nghe → Chọn nghĩa",
        ["MEANING_TO_TYPE_WORD"] = "Nghĩa → Điền từ",
        ["LISTEN_TO_TYPE_WORD"] = "Nghe → Điền từ",
        ["WORD_TO_TYPE_MEANING"] = "Từ → Điền nghĩa",
        ["MISSING_LETTERS"] = "Điền chữ còn thiếu",
        ["UNSCRAMBLE_WORD"] = "Sắp xếp chữ thành từ",
        ["MATCH_WORD_MEANING"] = "Ghép Từ ↔ Nghĩa",
        ["PRONUNCIATION"] = "Phát âm"
    };

    public string NormalizeMeaning(string meaning)
    {
        if (string.IsNullOrWhiteSpace(meaning)) return string.Empty;

        var normalized = meaning.Trim().ToLowerInvariant();
        // Remove surrounding punctuation
        normalized = Regex.Replace(normalized, @"^[.,!?;:\-–—\(\)\[\]""'\s]+", "");
        normalized = Regex.Replace(normalized, @"[.,!?;:\-–—\(\)\[\]""'\s]+$", "");
        // Normalize inner whitespace
        normalized = Regex.Replace(normalized, @"\s+", " ");
        return normalized;
    }

    public TestPreviewDto GenerateTestQuestions(Test test, List<VocabularyItem> items)
    {
        var preview = new TestPreviewDto
        {
            TestId = test.Id,
            Title = test.Title
        };

        if (items.Count == 0) return preview;

        // Parse enabled test types
        var enabledTypes = test.EnabledTypes
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(t => TypeLabels.ContainsKey(t))
            .ToList();

        if (enabledTypes.Count == 0)
        {
            enabledTypes = new List<string> { "WORD_TO_MEANING", "MEANING_TO_WORD" };
        }

        var rng = new Random();
        int targetTotal = Math.Min(test.TotalQuestions > 0 ? test.TotalQuestions : 20, 50);

        var questions = new List<GeneratedQuestionDto>();
        string? lastTargetWord = null;

        // Shuffle candidate items
        var shuffledItems = items.OrderBy(_ => rng.Next()).ToList();
        int itemIndex = 0;
        int attempts = 0;
        int maxAttempts = targetTotal * 10;

        while (questions.Count < targetTotal && attempts < maxAttempts)
        {
            attempts++;
            var candidate = shuffledItems[itemIndex % shuffledItems.Count];
            itemIndex++;

            // Avoid same target word in adjacent questions
            if (shuffledItems.Count > 1 && candidate.Word.Equals(lastTargetWord, StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            // Pick a test type cyclically with random offset
            var testType = enabledTypes[(questions.Count + attempts) % enabledTypes.Count];

            var generatedQuestion = TryGenerateQuestion(testType, candidate, items, questions.Count + 1, rng);
            if (generatedQuestion != null)
            {
                questions.Add(generatedQuestion);
                lastTargetWord = candidate.Word;
            }
        }

        preview.Questions = questions;
        preview.TotalGeneratedQuestions = questions.Count;
        return preview;
    }

    private GeneratedQuestionDto? TryGenerateQuestion(
        string type,
        VocabularyItem target,
        List<VocabularyItem> allItems,
        int questionIndex,
        Random rng)
    {
        var targetNormMeaning = NormalizeMeaning(target.Meaning);
        var label = TypeLabels.GetValueOrDefault(type, type);

        switch (type)
        {
            case "WORD_TO_MEANING":
            case "LISTEN_TO_MEANING":
                {
                    // Word -> Choose Meaning: Target is Word, choices are Meanings.
                    // RULE: Deduplicate meanings across options. Same normalized meaning must appear only once!
                    var distractors = allItems
                        .Where(i => !i.Word.Equals(target.Word, StringComparison.OrdinalIgnoreCase))
                        .Where(i => NormalizeMeaning(i.Meaning) != targetNormMeaning)
                        .GroupBy(i => NormalizeMeaning(i.Meaning))
                        .Select(g => g.First().Meaning)
                        .OrderBy(_ => rng.Next())
                        .Take(3)
                        .ToList();

                    if (distractors.Count < 3)
                    {
                        // Insufficient valid distractors; skip target for this question type
                        return null;
                    }

                    var options = new List<string>(distractors) { target.Meaning }
                        .OrderBy(_ => rng.Next())
                        .ToList();

                    var isAudio = type == "LISTEN_TO_MEANING";
                    return new GeneratedQuestionDto
                    {
                        QuestionIndex = questionIndex,
                        Type = type,
                        TypeLabel = label,
                        Prompt = isAudio ? "Nghe và chọn ý nghĩa đúng của từ:" : $"Chọn ý nghĩa chính xác cho từ: \"{target.Word}\"",
                        TargetWord = target.Word,
                        TargetMeaning = target.Meaning,
                        CorrectAnswer = target.Meaning,
                        Options = options,
                        AudioText = target.Word
                    };
                }

            case "MEANING_TO_WORD":
            case "LISTEN_TO_WORD":
                {
                    // Meaning -> Choose Word: Target is Meaning, choices are Words.
                    // RULE: Words sharing the same target Meaning must NOT compete against one another in distractors!
                    var distractors = allItems
                        .Where(i => !i.Word.Equals(target.Word, StringComparison.OrdinalIgnoreCase))
                        .Where(i => NormalizeMeaning(i.Meaning) != targetNormMeaning) // Distractor must have different meaning!
                        .GroupBy(i => i.Word.Trim().ToLowerInvariant())
                        .Select(g => g.First().Word)
                        .OrderBy(_ => rng.Next())
                        .Take(3)
                        .ToList();

                    if (distractors.Count < 3)
                    {
                        return null;
                    }

                    var options = new List<string>(distractors) { target.Word }
                        .OrderBy(_ => rng.Next())
                        .ToList();

                    var isAudio = type == "LISTEN_TO_WORD";
                    return new GeneratedQuestionDto
                    {
                        QuestionIndex = questionIndex,
                        Type = type,
                        TypeLabel = label,
                        Prompt = isAudio ? "Nghe và chọn từ vựng đúng:" : $"Chọn từ vựng tiếng Anh tương ứng với nghĩa: \"{target.Meaning}\"",
                        TargetWord = target.Word,
                        TargetMeaning = target.Meaning,
                        CorrectAnswer = target.Word,
                        Options = options,
                        AudioText = target.Word
                    };
                }

            case "MEANING_TO_TYPE_WORD":
                {
                    return new GeneratedQuestionDto
                    {
                        QuestionIndex = questionIndex,
                        Type = type,
                        TypeLabel = label,
                        Prompt = $"Nhập từ tiếng Anh tương ứng với nghĩa: \"{target.Meaning}\"",
                        TargetWord = target.Word,
                        TargetMeaning = target.Meaning,
                        CorrectAnswer = target.Word,
                        Options = new List<string>()
                    };
                }

            case "LISTEN_TO_TYPE_WORD":
                {
                    return new GeneratedQuestionDto
                    {
                        QuestionIndex = questionIndex,
                        Type = type,
                        TypeLabel = label,
                        Prompt = "Nghe phát âm và gõ lại từ vựng chính xác:",
                        TargetWord = target.Word,
                        TargetMeaning = target.Meaning,
                        CorrectAnswer = target.Word,
                        AudioText = target.Word,
                        Options = new List<string>()
                    };
                }

            case "WORD_TO_TYPE_MEANING":
                {
                    return new GeneratedQuestionDto
                    {
                        QuestionIndex = questionIndex,
                        Type = type,
                        TypeLabel = label,
                        Prompt = $"Nhập ý nghĩa tiếng Việt của từ: \"{target.Word}\"",
                        TargetWord = target.Word,
                        TargetMeaning = target.Meaning,
                        CorrectAnswer = target.Meaning,
                        Options = new List<string>()
                    };
                }

            case "MISSING_LETTERS":
                {
                    // Mask 1 or 2 characters from the word
                    var word = target.Word.Trim();
                    if (word.Length <= 3) return null;

                    var chars = word.ToCharArray();
                    int maskCount = word.Length > 6 ? 2 : 1;
                    var maskIndices = Enumerable.Range(1, word.Length - 2).OrderBy(_ => rng.Next()).Take(maskCount).ToList();
                    foreach (var idx in maskIndices)
                    {
                        chars[idx] = '_';
                    }

                    var maskedWord = new string(chars);
                    return new GeneratedQuestionDto
                    {
                        QuestionIndex = questionIndex,
                        Type = type,
                        TypeLabel = label,
                        Prompt = $"Điền chữ cái còn thiếu để hoàn thiện từ: {maskedWord} ({target.Meaning})",
                        TargetWord = target.Word,
                        TargetMeaning = target.Meaning,
                        CorrectAnswer = target.Word,
                        Options = new List<string>()
                    };
                }

            case "UNSCRAMBLE_WORD":
                {
                    var word = target.Word.Trim().ToLowerInvariant();
                    if (word.Length < 4) return null;

                    var scrambled = new string(word.OrderBy(_ => rng.Next()).ToArray());
                    if (scrambled == word)
                    {
                        scrambled = new string(word.Reverse().ToArray());
                    }

                    return new GeneratedQuestionDto
                    {
                        QuestionIndex = questionIndex,
                        Type = type,
                        TypeLabel = label,
                        Prompt = $"Sắp xếp lại các chữ cái sau thành từ đúng: {string.Join(" ", scrambled.ToCharArray())} (Nghĩa: {target.Meaning})",
                        TargetWord = target.Word,
                        TargetMeaning = target.Meaning,
                        CorrectAnswer = target.Word,
                        Options = new List<string>()
                    };
                }

            case "MATCH_WORD_MEANING":
                {
                    // MATCHING RULE: In a matching batch, only one item with the same normalized Meaning may appear!
                    var batchCandidates = allItems
                        .GroupBy(i => NormalizeMeaning(i.Meaning))
                        .Select(g => g.First()) // deduplicate identical meanings
                        .OrderBy(_ => rng.Next())
                        .Take(4)
                        .ToList();

                    if (batchCandidates.Count < 3) return null;

                    var pairs = batchCandidates.Select(b => new MatchingPairDto
                    {
                        Word = b.Word,
                        Meaning = b.Meaning
                    }).ToList();

                    return new GeneratedQuestionDto
                    {
                        QuestionIndex = questionIndex,
                        Type = type,
                        TypeLabel = label,
                        Prompt = "Ghép cặp từ vựng tiếng Anh với nghĩa tương ứng:",
                        MatchingPairs = pairs,
                        CorrectAnswer = string.Join(";", pairs.Select(p => $"{p.Word}={p.Meaning}"))
                    };
                }

            case "PRONUNCIATION":
                {
                    return new GeneratedQuestionDto
                    {
                        QuestionIndex = questionIndex,
                        Type = type,
                        TypeLabel = label,
                        Prompt = $"Phát âm từ sau qua microphone: \"{target.Word}\" {target.IPA}",
                        TargetWord = target.Word,
                        TargetMeaning = target.Meaning,
                        CorrectAnswer = target.Word,
                        AudioText = target.Word,
                        Options = new List<string>()
                    };
                }

            default:
                return null;
        }
    }
}
