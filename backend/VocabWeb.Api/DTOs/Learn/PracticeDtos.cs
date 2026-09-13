using System.Collections.Generic;
using VocabWeb.Api.Models.ActivityEngine;

namespace VocabWeb.Api.DTOs.Learn;

public class PracticeAvailabilityDto
{
    public ActivityType Type { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
    public string Reason { get; set; } = string.Empty;
}

public class PracticeSessionDto
{
    public ActivityType Type { get; set; }
    public List<GeneratedQuestion> Questions { get; set; } = new();
}
