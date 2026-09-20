namespace VocabWeb.Api.Models;

// ========================
// Feedback Cycle
// ========================
public enum FeedbackCycleType
{
    MONTHLY,
    MID_STAGE,
    END_STAGE,
    CUSTOM
}

public enum FeedbackCycleStatus
{
    ACTIVE,
    CLOSED
}

public class FeedbackCycle
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;     // e.g. "09/2026", "Mid-stage Review"
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public FeedbackCycleType Type { get; set; } = FeedbackCycleType.MONTHLY;
    public FeedbackCycleStatus Status { get; set; } = FeedbackCycleStatus.ACTIVE;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// ========================
// Feedback Template
// ========================
public class FeedbackTemplate
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;     // e.g. "IELTS Writing Rubric"
    public IeltsSkill Skill { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<FeedbackTemplateCriterion> Criteria { get; set; } = new List<FeedbackTemplateCriterion>();
}

public class FeedbackTemplateCriterion
{
    public int Id { get; set; }

    public int FeedbackTemplateId { get; set; }
    public FeedbackTemplate FeedbackTemplate { get; set; } = null!;

    public string Name { get; set; } = string.Empty;     // e.g. "Task Achievement"
    public string? Description { get; set; }
    public int SortOrder { get; set; }
}

// ========================
// Student Skill Feedback
// ========================
public enum FeedbackStatus
{
    NOT_STARTED,
    TA_DRAFT,
    WAITING_TEACHER,
    TEACHER_DRAFT,
    COMPLETED
}

public class StudentSkillFeedback
{
    public int Id { get; set; }

    public int StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;

    public int HomeClassEnrollmentId { get; set; }
    public ClassEnrollment HomeClassEnrollment { get; set; } = null!;

    public IeltsSkill Skill { get; set; }

    public int? HostClassSkillOfferingId { get; set; }
    public ClassSkillOffering? HostClassSkillOffering { get; set; }

    public int FeedbackCycleId { get; set; }
    public FeedbackCycle FeedbackCycle { get; set; } = null!;

    public int? FeedbackTemplateId { get; set; }
    public FeedbackTemplate? FeedbackTemplate { get; set; }

    public string? TaFeedbackHtml { get; set; }
    public string? TeacherFeedbackHtml { get; set; }

    public FeedbackStatus Status { get; set; } = FeedbackStatus.NOT_STARTED;

    public string? TaUserId { get; set; }
    public ApplicationUser? TaUser { get; set; }

    public string? TeacherUserId { get; set; }
    public ApplicationUser? TeacherUser { get; set; }

    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<StudentSkillFeedbackScore> Scores { get; set; } = new List<StudentSkillFeedbackScore>();
}

public class StudentSkillFeedbackScore
{
    public int Id { get; set; }

    public int StudentSkillFeedbackId { get; set; }
    public StudentSkillFeedback StudentSkillFeedback { get; set; } = null!;

    public int FeedbackTemplateCriterionId { get; set; }
    public FeedbackTemplateCriterion FeedbackTemplateCriterion { get; set; } = null!;

    public string ScoreCode { get; set; } = string.Empty;  // E, VG, G, F, NI, P
    public int ScoreValue { get; set; }                     // 6, 5, 4, 3, 2, 1
}
