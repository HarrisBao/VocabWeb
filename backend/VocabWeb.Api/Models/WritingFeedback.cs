namespace VocabWeb.Api.Models;

public class WritingFeedback
{
    public int Id { get; set; }
    
    public int StudentProfileId { get; set; }
    public StudentProfile Student { get; set; } = null!;
    
    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;
    
    public string TaskName { get; set; } = string.Empty;
    
    public decimal? TaskResponse { get; set; }
    public decimal? CoherenceCohesion { get; set; }
    public decimal? LexicalResource { get; set; }
    public decimal? GrammaticalRange { get; set; }
    public decimal? OverallBand { get; set; }
    
    public string? GoodPoints { get; set; }
    public string? NeedsImprovement { get; set; }
    public string? TeacherComment { get; set; }
    public string? NextSteps { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
