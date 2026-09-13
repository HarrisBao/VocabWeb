namespace VocabWeb.Api.Models;

public class VocabularyItem
{
    public int Id { get; set; }
    public int VocabularySetId { get; set; }
    public VocabularySet VocabularySet { get; set; } = null!;

    public string Word { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
    public string? IPA { get; set; }
    public string? Example { get; set; }
    public int OrderIndex { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
