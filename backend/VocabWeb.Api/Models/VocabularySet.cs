namespace VocabWeb.Api.Models;

public class VocabularySet
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Level { get; set; } = "Intermediate"; // Beginner, Intermediate, Advanced
    public bool IsPublic { get; set; } = false;
    public bool IsArchived { get; set; } = false;

    public string TeacherId { get; set; } = string.Empty;
    public ApplicationUser Teacher { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<VocabularyItem> Items { get; set; } = new List<VocabularyItem>();
    public ICollection<ClassLesson> ClassLessons { get; set; } = new List<ClassLesson>();
    public ICollection<Test> Tests { get; set; } = new List<Test>();
}
