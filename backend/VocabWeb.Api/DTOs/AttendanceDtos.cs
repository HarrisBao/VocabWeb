namespace VocabWeb.Api.DTOs;

public class ClassSessionDto
{
    public int Id { get; set; }
    public int ClassId { get; set; }
    public DateTime SessionDate { get; set; }
    public string? Title { get; set; }
    public List<AttendanceRecordDto> AttendanceRecords { get; set; } = new();
    
    // Statistics for this session across multiple assigned tests/activities
    public List<SessionActivityStatsDto> Activities { get; set; } = new();
}

public class AttendanceRecordDto
{
    public int Id { get; set; }
    public int ClassEnrollmentId { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class SessionActivityStatsDto
{
    public int TestId { get; set; }
    public string Title { get; set; } = string.Empty;
    public int TotalStudents { get; set; }
    public int CompletedCount { get; set; }
    public int NotCompletedCount { get; set; }
    public List<int> CompletedEnrollmentIds { get; set; } = new();
}

public class ClassEnrollmentDto
{
    public int Id { get; set; }
    public int StudentProfileId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? UserId { get; set; }
    public DateTime JoinedAt { get; set; }
}