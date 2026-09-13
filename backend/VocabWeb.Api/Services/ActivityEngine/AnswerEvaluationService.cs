using System;
using System.Collections.Generic;
using System.Linq;
using VocabWeb.Api.Models;
using VocabWeb.Api.Models.ActivityEngine;

namespace VocabWeb.Api.Services.ActivityEngine;

public class AnswerEvaluationService : IAnswerEvaluationService
{
    public (List<EvaluationResult> Results, double FinalScore) EvaluateAnswers(List<UserAnswerSubmission> submissions, List<VocabularyItem> vocabularyItems)
    {
        var results = new List<EvaluationResult>();
        int correctValidCount = 0;
        int totalValidCount = 0;

        foreach (var sub in submissions)
        {
            var targetItem = vocabularyItems.FirstOrDefault(v => v.Id == sub.TargetVocabularyItemId);
            if (targetItem == null) continue;

            var result = new EvaluationResult
            {
                QuestionId = sub.QuestionId,
                TechnicalFailure = sub.TechnicalFailure,
                UserAnswer = sub.AnswerValue
            };

            // If there's a technical failure (e.g., mic broken, audio blocked), skip grading it for the score
            if (!sub.TechnicalFailure)
            {
                totalValidCount++;
                bool isCorrect = EvaluateSingleAnswer(sub, targetItem, out string correctAnswer);
                result.IsCorrect = isCorrect;
                result.CorrectAnswer = correctAnswer;

                if (isCorrect)
                {
                    correctValidCount++;
                }
            }

            results.Add(result);
        }

        double finalScore = 0;
        if (totalValidCount > 0)
        {
            finalScore = Math.Round((double)correctValidCount / totalValidCount * 10, 1);
        }

        return (results, finalScore);
    }

    private bool EvaluateSingleAnswer(UserAnswerSubmission sub, VocabularyItem targetItem, out string correctAnswer)
    {
        correctAnswer = string.Empty;
        var userAnswerNorm = QuestionGenerationService.NormalizeString(sub.AnswerValue);

        switch (sub.Type)
        {
            case ActivityType.WORD_TO_MEANING:
            case ActivityType.LISTEN_TO_MEANING:
                // Expected answer is the VocabularyItemId of the chosen option
                correctAnswer = targetItem.Id.ToString();
                return userAnswerNorm == targetItem.Id.ToString();

            case ActivityType.MEANING_TO_WORD:
            case ActivityType.LISTEN_TO_WORD:
                correctAnswer = targetItem.Id.ToString();
                return userAnswerNorm == targetItem.Id.ToString();

            case ActivityType.MEANING_TO_TYPE_WORD:
            case ActivityType.LISTEN_TO_TYPE_WORD:
            case ActivityType.MISSING_LETTERS:
            case ActivityType.UNSCRAMBLE_WORD:
            case ActivityType.PRONUNCIATION:
                // Word matching evaluation (text matching only for V1 PRONUNCIATION)
                correctAnswer = targetItem.Word;
                return userAnswerNorm == QuestionGenerationService.NormalizeString(targetItem.Word);

            case ActivityType.WORD_TO_TYPE_MEANING:
                correctAnswer = targetItem.Meaning;
                return userAnswerNorm == QuestionGenerationService.NormalizeString(targetItem.Meaning);

            case ActivityType.MATCH_WORD_MEANING:
                // Matching evaluation can be complex, skipping exact impl for now
                correctAnswer = "MATCH_DATA";
                return false;

            default:
                return false;
        }
    }
}
