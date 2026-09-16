using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VocabWeb.Api.Models;

public class ClassVocabularyReviewSet
{
    public int Id { get; set; }
    
    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;

    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    public bool IsVisible { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ClassVocabularyReviewSetUnit> Units { get; set; } = new List<ClassVocabularyReviewSetUnit>();
}

public class ClassVocabularyReviewSetUnit
{
    public int ReviewSetId { get; set; }
    public ClassVocabularyReviewSet ReviewSet { get; set; } = null!;

    // Links to ClassLesson (the mapping between Class and VocabularySet)
    public int ClassLessonId { get; set; }
    public ClassLesson ClassLesson { get; set; } = null!;
}
