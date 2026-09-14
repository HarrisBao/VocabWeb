using System.ComponentModel.DataAnnotations;

namespace VocabWeb.Api.DTOs;

public class PhoneLoginDto
{
    [Required]
    public string ClassSlug { get; set; } = string.Empty;

    [Required]
    public string Phone { get; set; } = string.Empty;
}
