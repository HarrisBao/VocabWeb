namespace VocabWeb.Api.Models;

public class ClassSessionTest
{
    public int Id { get; set; }
    
    public int ClassSessionId { get; set; }
    public ClassSession ClassSession { get; set; } = null!;
    
    public int TestId { get; set; }
    public Test Test { get; set; } = null!;
    
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
}