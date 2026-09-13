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
            new() { Type = ActivityType.WORD_TO_MEANING, Name = "Từ → Chọn nghĩa", Description = "Hiển thị từ tiếng Anh, chọn nghĩa tiếng Việt đúng.", RequiredInputs = new List<string> { "Word", "Meaning" } },
            new() { Type = ActivityType.MEANING_TO_WORD, Name = "Nghĩa → Chọn từ", Description = "Hiển thị nghĩa tiếng Việt, chọn từ tiếng Anh đúng.", RequiredInputs = new List<string> { "Word", "Meaning" } },
            new() { Type = ActivityType.LISTEN_TO_WORD, Name = "Nghe → Chọn từ", Description = "Nghe phát âm, chọn từ tiếng Anh đúng.", RequiredInputs = new List<string> { "Word", "Audio" } },
            new() { Type = ActivityType.LISTEN_TO_MEANING, Name = "Nghe → Chọn nghĩa", Description = "Nghe phát âm, chọn nghĩa tiếng Việt đúng.", RequiredInputs = new List<string> { "Meaning", "Audio" } },
            new() { Type = ActivityType.MEANING_TO_TYPE_WORD, Name = "Nghĩa → Gõ từ", Description = "Hiển thị nghĩa tiếng Việt, gõ từ tiếng Anh tương ứng.", RequiredInputs = new List<string> { "Word", "Meaning" } },
            new() { Type = ActivityType.LISTEN_TO_TYPE_WORD, Name = "Nghe → Gõ từ", Description = "Nghe phát âm, gõ từ tiếng Anh tương ứng.", RequiredInputs = new List<string> { "Word", "Audio" } },
            new() { Type = ActivityType.WORD_TO_TYPE_MEANING, Name = "Từ → Gõ nghĩa", Description = "Hiển thị từ tiếng Anh, gõ nghĩa tiếng Việt tương ứng.", RequiredInputs = new List<string> { "Word", "Meaning" } },
            new() { Type = ActivityType.MISSING_LETTERS, Name = "Điền chữ còn thiếu", Description = "Điền các chữ cái còn thiếu vào từ tiếng Anh.", RequiredInputs = new List<string> { "Word" } },
            new() { Type = ActivityType.UNSCRAMBLE_WORD, Name = "Sắp xếp chữ cái", Description = "Sắp xếp lại các chữ cái bị xáo trộn thành từ đúng.", RequiredInputs = new List<string> { "Word" } },
            new() { Type = ActivityType.MATCH_WORD_MEANING, Name = "Ghép thẻ từ & nghĩa", Description = "Nối các thẻ từ tiếng Anh với nghĩa tiếng Việt tương ứng.", RequiredInputs = new List<string> { "Word", "Meaning" } },
            new() { Type = ActivityType.PRONUNCIATION, Name = "Phát âm", Description = "Nghe và phát âm lại từ vựng.", RequiredInputs = new List<string> { "Word" } }
        };
    }

    public List<GeneratedQuestion> GenerateQuestions(List<VocabularyItem> vocabularyItems, List<ActivityType> requestedActivityTypes)
    {
        var questions = new List<GeneratedQuestion>();
        if (vocabularyItems == null || vocabularyItems.Count == 0 || requestedActivityTypes == null || requestedActivityTypes.Count == 0)
        {
            return questions;
        }

        int totalWords = vocabularyItems.Count;
        bool isSingleActivity = requestedActivityTypes.Count == 1;

        // Global Coverage Planner
        var usageCounts = vocabularyItems.ToDictionary(v => v.Id, v => 0);

        foreach (var activityType in requestedActivityTypes)
        {
            int targetSize = GetTargetSizeForActivity(activityType, totalWords, isSingleActivity);
            var selectedItems = new List<VocabularyItem>();
            var availableItems = new List<VocabularyItem>(vocabularyItems);

            // Loop until we reach target size or run out of valid candidates
            while (selectedItems.Count < targetSize && availableItems.Count > 0)
            {
                // Order by lowest usage count first, then random
                var candidate = availableItems
                    .OrderBy(v => usageCounts[v.Id])
                    .ThenBy(v => Rng.Next())
                    .First();

                availableItems.Remove(candidate);

                var question = GenerateSingleQuestion(candidate, activityType, vocabularyItems);
                if (question != null)
                {
                    question.QuestionId = Guid.NewGuid().ToString();
                    questions.Add(question);
                    selectedItems.Add(candidate);
                    usageCounts[candidate.Id]++;
                }
            }
        }

        // Check if full coverage is achieved. If not, forcefully insert unused words into random activities.
        var unusedWords = vocabularyItems.Where(v => usageCounts[v.Id] == 0).ToList();
        foreach (var unused in unusedWords)
        {
            // Try to assign it to a random activity that hasn't already used it (if possible)
            var shuffledActivities = requestedActivityTypes.OrderBy(a => Rng.Next()).ToList();
            bool assigned = false;

            foreach (var activityType in shuffledActivities)
            {
                // Check if this activity already generated a question for this word
                bool alreadyInActivity = questions.Any(q => q.Type == activityType && q.TargetVocabularyItemId == unused.Id);
                if (!alreadyInActivity)
                {
                    var question = GenerateSingleQuestion(unused, activityType, vocabularyItems);
                    if (question != null)
                    {
                        question.QuestionId = Guid.NewGuid().ToString();
                        questions.Add(question);
                        usageCounts[unused.Id]++;
                        assigned = true;
                        break;
                    }
                }
            }
        }

        return questions;
    }

    private int GetTargetSizeForActivity(ActivityType type, int totalWords, bool isSingleActivity)
    {
        if (isSingleActivity) return totalWords;
        if (totalWords < 15) return totalWords;

        // Default approximate system targets
        return type switch
        {
            ActivityType.WORD_TO_MEANING => 20,
            ActivityType.MEANING_TO_WORD => 20,
            ActivityType.LISTEN_TO_WORD => 20,
            ActivityType.LISTEN_TO_MEANING => 20,
            ActivityType.MEANING_TO_TYPE_WORD => 18,
            ActivityType.LISTEN_TO_TYPE_WORD => 18,
            ActivityType.WORD_TO_TYPE_MEANING => 18,
            ActivityType.MISSING_LETTERS => 18,
            ActivityType.UNSCRAMBLE_WORD => 18,
            ActivityType.MATCH_WORD_MEANING => 15,
            ActivityType.PRONUNCIATION => 15,
            _ => 15
        };
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
                if (q.Options.Count < 2) return null;
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
        normalized = Regex.Replace(normalized, @"[.,!?;:]", "");
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
        var validDistractors = allItems.Where(item => item.Id != target.Id).ToList();

        if (isMeaningOptions)
        {
            validDistractors = validDistractors
                .Where(item => NormalizeString(item.Meaning) != targetNormalizedMeaning)
                .ToList();
        }
        else
        {
            validDistractors = validDistractors
                .Where(item => NormalizeString(item.Meaning) != targetNormalizedMeaning)
                .ToList();
        }

        var distinctDistractors = new List<VocabularyItem>();
        var seenTexts = new HashSet<string> { NormalizeString(textSelector(target)) };
        var shuffledValidDistractors = validDistractors.OrderBy(x => Rng.Next()).ToList();

        foreach (var item in shuffledValidDistractors)
        {
            var textNormalized = NormalizeString(textSelector(item));
            if (!seenTexts.Contains(textNormalized))
            {
                seenTexts.Add(textNormalized);
                distinctDistractors.Add(item);
                if (distinctDistractors.Count == 3) break;
            }
        }

        foreach (var item in distinctDistractors)
        {
            options.Add(new QuestionOption { VocabularyItemId = item.Id, Text = textSelector(item) });
        }

        return options.OrderBy(x => Rng.Next()).ToList();
    }

    private string CreateMissingLettersPrompt(string word)
    {
        if (string.IsNullOrWhiteSpace(word) || word.Length <= 2) return "_";
        var chars = word.ToCharArray();
        int lettersToHide = Math.Max(1, word.Length / 3);
        for (int i = 0; i < lettersToHide; i++)
        {
            int idx = Rng.Next(1, word.Length - 1);
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
