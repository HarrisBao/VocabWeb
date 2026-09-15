namespace VocabWeb.Api.Models;

public class ClassEnrollmentPeriod
{
    public int Id { get; set; }
    
    public int ClassEnrollmentId { get; set; }
    public ClassEnrollment ClassEnrollment { get; set; } = null!;
    
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAt { get; set; }
}
