namespace VocabWeb.Api.Models;

public class Class
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string FixedLinkToken { get; set; } = Guid.NewGuid().ToString("N");
    public bool IsArchived { get; set; } = false;

    // Access control
    public bool AllowGuestAccess { get; set; } = true;
    public bool RequireLogin { get; set; } = false;

    public string TeacherId { get; set; } = string.Empty;
    public ApplicationUser Teacher { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<ClassLesson> Lessons { get; set; } = new List<ClassLesson>();
    public ICollection<ClassMember> Members { get; set; } = new List<ClassMember>();
    public ICollection<Test> Tests { get; set; } = new List<Test>();
}
