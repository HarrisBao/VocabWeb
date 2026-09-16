namespace VocabWeb.Api.Models;

public class IeltsMockExamResult
{
    public int Id { get; set; }
    
    public int IeltsMockExamId { get; set; }
    public IeltsMockExam MockExam { get; set; } = null!;
    
    public int StudentProfileId { get; set; }
    public StudentProfile Student { get; set; } = null!;
    
    public decimal? ListeningBand { get; set; }
    public decimal? ReadingBand { get; set; }
    public decimal? WritingBand { get; set; }
    public decimal? SpeakingBand { get; set; }
    
    public decimal? RawAverage { get; set; }
    public decimal? OverallBand { get; set; }
    
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
}
