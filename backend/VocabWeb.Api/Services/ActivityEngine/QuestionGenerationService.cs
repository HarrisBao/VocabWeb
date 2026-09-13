using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using VocabWeb.Api.Models;
using VocabWeb.Api.Models.ActivityEngine;

namespace VocabWeb.Api.Services.ActivityEngine;

public class QuestionGenerationService : IQuestionGenerationService
{
    private static readonly Random Rng = new();

    public List<ActivityDefinition> GetActivityDefinitions()
    {
        return new List<ActivityDefinition>
        {
            new() { Type = ActivityType.WORD_TO_MEANING, Name = "Chọn Nghĩa", Description = "Hiển thị từ, chọn nghĩa", RequiredInputs = new List<string> { "Word", "Meaning" } },
            new() { Type = ActivityType.MEANING_TO_WORD, Name = "Chọn Từ", Description = "Hiển thị nghĩa, chọn từ", RequiredInputs = new List<string> { "Word", "Meaning" } },
            new() { Type = ActivityType.LISTEN_TO_WORD, Name = "Nghe Chọn Từ", Description = "Nghe âm thanh, chọn từ", RequiredInputs = new List<string> { "Word", "Audio" } },
            new() { Type = ActivityType.LISTEN_TO_MEANING, Name = "Nghe Chọn Nghĩa", Description = "Nghe âm thanh, chọn nghĩa", RequiredInputs = new List<string> { "Meaning", "Audio" } },
            new() { Type = ActivityType.MEANING_TO_TYPE_WORD, Name = "Gõ Từ", Description = "Hiển thị nghĩa, gõ lại từ", RequiredInputs = new List<string> { "Word", "Meaning" } },
            new() { Type = ActivityType.LISTEN_TO_TYPE_WORD, Name = "Nghe và Gõ Từ", Description = "Nghe âm thanh, gõ lại từ", RequiredInputs = new List<string> { "Word", "Audio" } },
            new() { Type = ActivityType.WORD_TO_TYPE_MEANING, Name = "Gõ Nghĩa", Description = "Hiển thị từ, gõ lại nghĩa", RequiredInputs = new List<string> { "Word", "Meaning" } },
            new() { Type = ActivityType.MISSING_LETTERS, Name = "Điền Chữ Cái", Description = "Điền chữ cái còn thiếu của từ", RequiredInputs = new List<string> { "Word" } },
            new() { Type = ActivityType.UNSCRAMBLE_WORD, Name = "Xếp Chữ", Description = "Sắp xếp lại các chữ cái bị xáo trộn", RequiredInputs = new List<string> { "Word" } },
            new() { Type = ActivityType.MATCH_WORD_MEANING, Name = "Ghép Từ và Nghĩa", Description = "Ghép nối từ với nghĩa", RequiredInputs = new List<string> { "Word", "Meaning" } },
            new() { Type = ActivityType.PRONUNCIATION, Name = "Phát Âm", Description = "Luyện phát âm", RequiredInputs = new List<string> { "Word" } }
        };
    }

    public List<GeneratedQuestion> GenerateQuestions(List<VocabularyItem> vocabularyItems, List<ActivityType> requestedActivityTypes, int totalQuestions)
    {
        var questions = new List<GeneratedQuestion>();
        if (vocabularyItems == null || !vocabularyItems.Any() || requestedActivityTypes == null || !requestedActivityTypes.Any() || totalQuestions <= 0)
        {
            return questions;
        }

        int previousTargetId = -1;

        for (int i = 0; i < totalQuestions; i++)
        {
            var activityType = requestedActivityTypes[Rng.Next(requestedActivityTypes.Count)];

            // Random target, ensuring it's not the exact same as the previous one if possible
            var validTargets = vocabularyItems.Where(v => v.Id != previousTargetId).ToList();
            if (!validTargets.Any()) validTargets = vocabularyItems; // Fallback if only 1 item exists

            var target = validTargets[Rng.Next(validTargets.Count)];

            var question = GenerateSingleQuestion(target, activityType, vocabularyItems);

            // Question Quality Rule: if question generation failed (e.g., not enough valid distractors), skip and try to regenerate?
            // To simplify for this phase, if it returns null, we just continue (or we could retry). Let's retry a few times.
            int retries = 0;
            while (question == null && retries < 3)
            {
                target = vocabularyItems[Rng.Next(vocabularyItems.Count)];
                question = GenerateSingleQuestion(target, activityType, vocabularyItems);
                retries++;
            }

            if (question != null)
            {
                question.QuestionId = Guid.NewGuid().ToString();
                questions.Add(question);
                previousTargetId = target.Id;
            }
            else
            {
                // If we couldn't generate a valid question even after retries, we might want to decrement i 
                // to try another activity type, or just break if impossible.
                // Let's decrement i to try again (up to a limit to avoid infinite loops).
                // Actually, if we just skip, we might not reach totalQuestions, but Question Quality > Quantity.
            }
        }

        return questions;
    }

    private GeneratedQuestion? GenerateSingleQuestion(VocabularyItem target, ActivityType type, List<VocabularyItem> allItems)
    {
        var q = new GeneratedQuestion
        {
            Type = type,
            TargetVocabularyItemId = target.Id,
            AudioBehavior = AudioBehavior.NO_AUDIO
        };

        switch (type)
        {
            case ActivityType.WORD_TO_MEANING:
                q.QuestionPrompt = target.Word;
                q.Options = GenerateOptions(target, allItems, item => item.Meaning, true);
                if (q.Options.Count < 2) return null; // Question Quality Rule: Needs at least 1 correct + 1 distractor
                break;

            case ActivityType.MEANING_TO_WORD:
                q.QuestionPrompt = target.Meaning;
                q.Options = GenerateOptions(target, allItems, item => item.Word, false);
                if (q.Options.Count < 2) return null;
                break;

            case ActivityType.LISTEN_TO_WORD:
                q.QuestionPrompt = "Nghe và chọn từ đúng";
                q.AudioBehavior = AudioBehavior.AUTO_PLAY_TARGET;
                q.Options = GenerateOptions(target, allItems, item => item.Word, false);
                if (q.Options.Count < 2) return null;
                break;

            case ActivityType.LISTEN_TO_MEANING:
                q.QuestionPrompt = "Nghe và chọn nghĩa đúng";
                q.AudioBehavior = AudioBehavior.AUTO_PLAY_TARGET;
                q.Options = GenerateOptions(target, allItems, item => item.Meaning, true);
                if (q.Options.Count < 2) return null;
                break;

            case ActivityType.MEANING_TO_TYPE_WORD:
                q.QuestionPrompt = target.Meaning;
                break;

            case ActivityType.LISTEN_TO_TYPE_WORD:
                q.QuestionPrompt = "Nghe và gõ lại từ";
                q.AudioBehavior = AudioBehavior.AUTO_PLAY_TARGET;
                break;

            case ActivityType.WORD_TO_TYPE_MEANING:
                q.QuestionPrompt = target.Word;
                break;

            case ActivityType.MISSING_LETTERS:
                q.QuestionPrompt = CreateMissingLettersPrompt(target.Word);
                break;

            case ActivityType.UNSCRAMBLE_WORD:
                q.QuestionPrompt = UnscrambleWord(target.Word);
                break;

            case ActivityType.MATCH_WORD_MEANING:
                // Not a standard single choice, maybe return options as pairs?
                // For simplicity, we won't fully implement the complex drag-drop payload here, just a basic structure.
                break;

            case ActivityType.PRONUNCIATION:
                q.QuestionPrompt = target.Word;
                q.AudioBehavior = AudioBehavior.REPLAY_TARGET;
                break;
        }

        return q;
    }

    public static string NormalizeString(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;
        var normalized = input.Trim().ToLowerInvariant();
        // Remove common punctuation: . , ! ? ; :
        normalized = Regex.Replace(normalized, @"[.,!?;:]", "");
        // Collapse multiple spaces
        normalized = Regex.Replace(normalized, @"\s+", " ");
        return normalized;
    }

    private List<QuestionOption> GenerateOptions(VocabularyItem target, List<VocabularyItem> allItems, Func<VocabularyItem, string> textSelector, bool isMeaningOptions)
    {
        var options = new List<QuestionOption>
        {
            new() { VocabularyItemId = target.Id, Text = textSelector(target) }
        };

        var targetNormalizedMeaning = NormalizeString(target.Meaning);

        // Filter valid distractors
        var validDistractors = allItems.Where(item => item.Id != target.Id).ToList();

        if (isMeaningOptions)
        {
            // If the options are meanings, we must NOT include any meaning that normalizes to the same as the target's meaning.
            validDistractors = validDistractors
                .Where(item => NormalizeString(item.Meaning) != targetNormalizedMeaning)
                .ToList();
        }
        else
        {
            // If the options are words (Meaning -> Word), we must NOT include words that have the same meaning as the target.
            // Example: target is "rapid" (meaning: nhanh). Distractor cannot be "quick" (meaning: nhanh).
            validDistractors = validDistractors
                .Where(item => NormalizeString(item.Meaning) != targetNormalizedMeaning)
                .ToList();
        }

        // Deduplicate distractors based on the text they will show
        var distinctDistractors = new List<VocabularyItem>();
        var seenTexts = new HashSet<string> { NormalizeString(textSelector(target)) };

        // Randomize the valid distractors before selecting
        var shuffledValidDistractors = validDistractors.OrderBy(x => Rng.Next()).ToList();

        foreach (var item in shuffledValidDistractors)
        {
            var textNormalized = NormalizeString(textSelector(item));
            if (!seenTexts.Contains(textNormalized))
            {
                seenTexts.Add(textNormalized);
                distinctDistractors.Add(item);
                if (distinctDistractors.Count == 3) break; // Need 3 distractors for 4 options total
            }
        }

        foreach (var item in distinctDistractors)
        {
            options.Add(new QuestionOption { VocabularyItemId = item.Id, Text = textSelector(item) });
        }

        // Shuffle options
        return options.OrderBy(x => Rng.Next()).ToList();
    }

    private string CreateMissingLettersPrompt(string word)
    {
        if (string.IsNullOrWhiteSpace(word) || word.Length <= 2) return "_";
        var chars = word.ToCharArray();
        // Simple logic: replace ~30-50% of letters with '_'
        int lettersToHide = Math.Max(1, word.Length / 3);
        for (int i = 0; i < lettersToHide; i++)
        {
            int idx = Rng.Next(1, word.Length - 1); // Avoid hiding first and last letter if possible
            chars[idx] = '_';
        }
        return new string(chars);
    }

    private string UnscrambleWord(string word)
    {
        if (string.IsNullOrWhiteSpace(word)) return string.Empty;
        var chars = word.ToCharArray();
        for (int i = 0; i < chars.Length; i++)
        {
            int j = Rng.Next(i, chars.Length);
            (chars[i], chars[j]) = (chars[j], chars[i]);
        }
        return new string(chars);
    }
}
