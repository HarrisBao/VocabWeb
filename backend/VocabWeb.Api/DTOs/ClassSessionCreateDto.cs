using System.ComponentModel.DataAnnotations;
namespace VocabWeb.Api.DTOs;
public class ClassSessionCreateDto
{
    [Required] public DateTime SessionDate { get; set; }
    public string? Title { get; set; }
    public int? TestId { get; set; }
}