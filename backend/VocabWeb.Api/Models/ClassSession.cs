namespace VocabWeb.Api.Models;

public class ClassSession
{
    public int Id { get; set; }
    
    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;
    
    public DateTime SessionDate { get; set; }
    public string? Title { get; set; }
    
    public string? CreatedById { get; set; }
    public ApplicationUser? CreatedBy { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
}
