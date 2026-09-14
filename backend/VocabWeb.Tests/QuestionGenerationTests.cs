using System.Collections.Generic;
using System.Linq;
using VocabWeb.Api.Models;
using VocabWeb.Api.Models.ActivityEngine;
using VocabWeb.Api.Services.ActivityEngine;
using Xunit;

namespace VocabWeb.Tests;

public class QuestionGenerationTests
{
    private readonly QuestionGenerationService _service;

    public QuestionGenerationTests()
    {
        _service = new QuestionGenerationService();
    }

    [Theory]
    [InlineData("Hello, World!", "hello world")]
    [InlineData("   RAPID!  ", "rapid")]
    [InlineData("Nhanh; chong", "nhanh chong")]
    public void NormalizeString_ShouldHandlePunctuationAndCase(string input, string expected)
    {
        var result = QuestionGenerationService.NormalizeString(input);
        Assert.Equal(expected, result);
    }

    [Fact]
    public void GenerateQuestions_MeaningToWord_ShouldNotIncludeSynonymsAsOptions()
    {
        // Arrange
        var items = new List<VocabularyItem>
        {
            new() { Id = 1, Word = "rapid", Meaning = "nhanh" },
            new() { Id = 2, Word = "quick", Meaning = "nhanh" },
            new() { Id = 3, Word = "slow", Meaning = "chậm" },
            new() { Id = 4, Word = "apple", Meaning = "quả táo" },
            new() { Id = 5, Word = "banana", Meaning = "quả chuối" }
        };

        var types = new List<ActivityType> { ActivityType.MEANING_TO_WORD };

        // Act
        // Generating questions to ensure we hit 'rapid' or 'quick'
        var questions = _service.GenerateQuestions(items, types);

        // Assert
        foreach (var q in questions)
        {
            var options = q.Options;
            
            // If target is rapid or quick, the options should NOT contain the other one
            var target = items.First(i => i.Id == q.TargetVocabularyItemId);
            if (target.Word == "rapid" || target.Word == "quick")
            {
                var optionWords = options.Select(o => o.Text).ToList();
                // Ensure only ONE of them is in the options (the correct one)
                int synonymCount = optionWords.Count(w => w == "rapid" || w == "quick");
                Assert.Equal(1, synonymCount);
            }
        }
    }
    
    [Fact]
    public void GenerateQuestions_WordToMeaning_ShouldNotIncludeSynonymMeanings()
    {
        // Arrange
        var items = new List<VocabularyItem>
        {
            new() { Id = 1, Word = "rapid", Meaning = "nhanh" },
            new() { Id = 2, Word = "quick", Meaning = "nhanh" },
            new() { Id = 3, Word = "slow", Meaning = "chậm" },
            new() { Id = 4, Word = "apple", Meaning = "quả táo" },
            new() { Id = 5, Word = "banana", Meaning = "quả chuối" }
        };

        var types = new List<ActivityType> { ActivityType.WORD_TO_MEANING };

        // Act
        var questions = _service.GenerateQuestions(items, types);

        // Assert
        foreach (var q in questions)
        {
            var options = q.Options;
            var target = items.First(i => i.Id == q.TargetVocabularyItemId);
            
            // Check that meanings are distinct (after normalization)
            var normalizedMeanings = options.Select(o => QuestionGenerationService.NormalizeString(o.Text)).ToList();
            var distinctMeanings = normalizedMeanings.Distinct().ToList();
            
            Assert.Equal(options.Count, distinctMeanings.Count);
        }
    }
}
