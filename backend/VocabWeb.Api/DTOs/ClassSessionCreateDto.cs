using System.ComponentModel.DataAnnotations;
namespace VocabWeb.Api.DTOs;
public class ClassSessionCreateDto
{
    [Required] public DateTime SessionDate { get; set; }
    public string? Title { get; set; }
    public int? TestId { get; set; }
    public VocabWeb.Api.Models.IeltsSkill Skill { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
}