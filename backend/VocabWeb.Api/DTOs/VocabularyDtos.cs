using System.ComponentModel.DataAnnotations;

namespace VocabWeb.Api.DTOs;

public class VocabularyItemDto
{
    public int? Id { get; set; }

    [Required(ErrorMessage = "Từ vựng không được để trống")]
    public string Word { get; set; } = string.Empty;

    [Required(ErrorMessage = "Ý nghĩa không được để trống")]
    public string Meaning { get; set; } = string.Empty;

    public string? IPA { get; set; }
    public string? Example { get; set; }
    public int OrderIndex { get; set; }
}

public class VocabularySetDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Level { get; set; } = "Intermediate";
    public bool IsPublic { get; set; }
    public int WordCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<VocabularyItemDto> Items { get; set; } = new();
}

public class CreateVocabularySetDto
{
    [Required(ErrorMessage = "Tên bộ từ vựng không được để trống")]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }
    public string Level { get; set; } = "Intermediate";
    public bool IsPublic { get; set; }

    public List<VocabularyItemDto> Items { get; set; } = new();
}

public class ImportResultDto
{
    public int TotalRead { get; set; }
    public int ValidCount { get; set; }
    public int SkippedCount { get; set; }
    public List<VocabularyItemDto> Items { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
}

public class GenerateIpaResultDto
{
    public int TotalMissingFound { get; set; }
    public int GeneratedCount { get; set; }
    public List<VocabularyItemDto> UpdatedItems { get; set; } = new();
}
