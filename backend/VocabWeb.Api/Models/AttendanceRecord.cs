namespace VocabWeb.Api.Models;

public class AttendanceRecord
{
    public int Id { get; set; }
    
    public int ClassSessionId { get; set; }
    public ClassSession ClassSession { get; set; } = null!;
    
    public int ClassEnrollmentId { get; set; }
    public ClassEnrollment ClassEnrollment { get; set; } = null!;
    
    public string Status { get; set; } = "PRESENT"; // PRESENT, ABSENT, ONLINE
    
    public string? UpdatedById { get; set; }
    public ApplicationUser? UpdatedBy { get; set; }
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
