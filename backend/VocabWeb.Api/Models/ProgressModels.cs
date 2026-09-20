namespace VocabWeb.Api.Models;

// ========================
// Learning Stage per Skill Offering
// ========================
public class ClassLearningStage
{
    public int Id { get; set; }

    public int ClassSkillOfferingId { get; set; }
    public ClassSkillOffering ClassSkillOffering { get; set; } = null!;

    public string Name { get; set; } = string.Empty;     // e.g. "Foundation", "IELTS Practice"
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<LearningMilestone> Milestones { get; set; } = new List<LearningMilestone>();
}

// ========================
// Milestone within a Stage
// ========================
public class LearningMilestone
{
    public int Id { get; set; }

    public int ClassLearningStageId { get; set; }
    public ClassLearningStage ClassLearningStage { get; set; } = null!;

    public string Name { get; set; } = string.Empty;     // e.g. "Unit 1 Complete", "Mock Test 1"
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// ========================
// Student Progress per Milestone
// ========================
public class StudentMilestoneProgress
{
    public int Id { get; set; }

    public int StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public int LearningMilestoneId { get; set; }
    public LearningMilestone LearningMilestone { get; set; } = null!;

    public int ClassSkillOfferingId { get; set; }
    public ClassSkillOffering ClassSkillOffering { get; set; } = null!;

    public DateTime? CompletedAt { get; set; }

    public string? MarkedByUserId { get; set; }
    public ApplicationUser? MarkedByUser { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
