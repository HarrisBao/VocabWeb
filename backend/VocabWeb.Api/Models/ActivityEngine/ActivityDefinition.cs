using System.Collections.Generic;

namespace VocabWeb.Api.Models.ActivityEngine;

public class ActivityDefinition
{
    public ActivityType Type { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> RequiredInputs { get; set; } = new(); // e.g., "Word", "Meaning", "Audio"
}
