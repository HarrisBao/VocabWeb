namespace VocabWeb.Api.Models;

public class ClassSkillOffering
{
    public int Id { get; set; }

    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;

    public IeltsSkill Skill { get; set; }

    public string? TeacherId { get; set; }
    public ApplicationUser? Teacher { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
