namespace VocabWeb.Api.Models;

public class ClassEnrollment
{
    public int Id { get; set; }
    
    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;
    
    public int StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;
    
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    
    public bool IsActive { get; set; } = true;
    public DateTime? LeftAt { get; set; }
}
