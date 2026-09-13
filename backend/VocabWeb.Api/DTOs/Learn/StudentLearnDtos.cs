namespace VocabWeb.Api.DTOs.Learn;

public class StudentClassDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string FixedLinkToken { get; set; } = string.Empty;
    
    public bool AllowGuestAccess { get; set; }
    public bool RequireLogin { get; set; }

    public List<StudentLessonDto> Lessons { get; set; } = new();
}

public class StudentLessonDto
{
    public int VocabularySetId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Level { get; set; } = string.Empty;
    public int WordCount { get; set; }
    public bool IsPinned { get; set; }
    public int OrderIndex { get; set; }
}

public class VocabularyReviewDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Level { get; set; } = string.Empty;
    public List<VocabularyReviewItemDto> Items { get; set; } = new();
}

public class VocabularyReviewItemDto
{
    public int Id { get; set; }
    public string Word { get; set; } = string.Empty;
    public string? IPA { get; set; }
    public string Meaning { get; set; } = string.Empty;
    public string? Example { get; set; }
    public int OrderIndex { get; set; }
}
