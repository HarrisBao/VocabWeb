namespace VocabWeb.Api.Models;

public class ClassLesson
{
    public int Id { get; set; }
    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;

    public int VocabularySetId { get; set; }
    public VocabularySet VocabularySet { get; set; } = null!;

    public bool IsPinned { get; set; } = false;
    public bool IsHidden { get; set; } = false;
    public int OrderIndex { get; set; } = 0;
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
