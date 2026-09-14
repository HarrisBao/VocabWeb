using System.ComponentModel.DataAnnotations;
namespace VocabWeb.Api.DTOs;
public class AttendanceUpdateDto
{
    [Required] public int ClassEnrollmentId { get; set; }
    [Required] public string Status { get; set; } = string.Empty; // PRESENT, ABSENT, ONLINE
}