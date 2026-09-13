namespace VocabWeb.Api.Models;

public class ClassMember
{
    public int Id { get; set; }
    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;

    public string StudentId { get; set; } = string.Empty;
    public ApplicationUser Student { get; set; } = null!;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}
