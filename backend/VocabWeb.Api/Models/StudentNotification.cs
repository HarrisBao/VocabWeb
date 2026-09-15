namespace VocabWeb.Api.Models;

public class StudentNotification
{
    public int Id { get; set; }
    
    public int StudentProfileId { get; set; }
    public StudentProfile StudentProfile { get; set; } = null!;
    
    public string Type { get; set; } = string.Empty; // e.g. CLASS_ADDED
    
    public int? ClassId { get; set; }
    public Class? Class { get; set; }
    
    public string? ActorUserId { get; set; }
    public ApplicationUser? ActorUser { get; set; }
    
    public string Message { get; set; } = string.Empty;
    
    public bool IsRead { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
