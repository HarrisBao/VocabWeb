namespace VocabWeb.Api.Models;

public class IeltsMockExam
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string TeacherId { get; set; } = string.Empty;
    public ApplicationUser Teacher { get; set; } = null!;
    public int? ClassId { get; set; }
    public Class? Class { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<IeltsMockExamResult> Results { get; set; } = new List<IeltsMockExamResult>();
}
