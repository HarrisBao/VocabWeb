using System.ComponentModel.DataAnnotations;
namespace VocabWeb.Api.DTOs;
public class NoAccountStudentDto
{
    [Required] public string FullName { get; set; } = string.Empty;
    [Required] public string Phone { get; set; } = string.Empty;
}