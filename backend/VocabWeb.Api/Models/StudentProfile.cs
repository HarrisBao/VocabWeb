namespace VocabWeb.Api.Models;

public class StudentProfile
{
    public int Id { get; set; }
    
    public string FullName { get; set; } = string.Empty;
    
    public string? NormalizedPhone { get; set; }
    
    public string? UserId { get; set; }
    public ApplicationUser? User { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ClassEnrollment> Enrollments { get; set; } = new List<ClassEnrollment>();
}
