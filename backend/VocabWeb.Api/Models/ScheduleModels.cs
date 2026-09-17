namespace VocabWeb.Api.Models;

public class ClassSkillSchedule
{
    public int Id { get; set; }
    
    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;
    
    public IeltsSkill Skill { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    
    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
}

public enum RequestType
{
    MAKEUP,
    TEMPORARY_TRANSFER,
    PERMANENT_TRANSFER
}

public enum RequestSource
{
    STUDENT_SELF_SERVICE,
    TA_DIRECT,
    ADMIN_DIRECT
}

public enum RequestStatus
{
    PENDING,
    RESOLVED,
    CANCELLED
}

public class StudentScheduleRequest
{
    public int Id { get; set; }
    
    public int StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;
    
    public int ClassEnrollmentId { get; set; }
    public ClassEnrollment ClassEnrollment { get; set; } = null!;
    
    public IeltsSkill Skill { get; set; }
    
    public RequestType RequestType { get; set; }
    
    // For MAKEUP
    public int? AffectedSessionId { get; set; }
    public ClassSession? AffectedSession { get; set; }
    
    // For TRANSFER
    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    
    public string? Reason { get; set; }
    public string? Availability { get; set; }
    
    public RequestSource Source { get; set; }
    public RequestStatus Status { get; set; } = RequestStatus.PENDING;
    
    public string? CreatedByUserId { get; set; }
    public ApplicationUser? CreatedByUser { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
}

public class StudentSessionOverride
{
    public int Id { get; set; }
    
    public int ClassEnrollmentId { get; set; }
    public ClassEnrollment ClassEnrollment { get; set; } = null!;
    
    public int OriginalSessionId { get; set; }
    public ClassSession OriginalSession { get; set; } = null!;
    
    public int TargetSessionId { get; set; }
    public ClassSession TargetSession { get; set; } = null!;
    
    public RequestType Type { get; set; } = RequestType.MAKEUP;
    public string? Reason { get; set; }
    
    public string? CreatedByUserId { get; set; }
    public ApplicationUser? CreatedByUser { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class EnrollmentSkillAssignment
{
    public int Id { get; set; }
    
    public int ClassEnrollmentId { get; set; }
    public ClassEnrollment ClassEnrollment { get; set; } = null!;
    
    public IeltsSkill Skill { get; set; }
    
    public int SourceClassId { get; set; }
    public Class SourceClass { get; set; } = null!;
    
    public int TargetClassId { get; set; }
    public Class TargetClass { get; set; } = null!;
    
    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    
    public RequestType AssignmentType { get; set; }
    public string? Reason { get; set; }
    public bool IsActive { get; set; } = true;
    
    public string? CreatedByUserId { get; set; }
    public ApplicationUser? CreatedByUser { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
