using System.ComponentModel.DataAnnotations;
using VocabWeb.Api.Models;

namespace VocabWeb.Api.DTOs.Schedule;

public class CreateScheduleRequestDto
{
    [Required]
    public int ClassId { get; set; }
    
    [Required]
    public IeltsSkill Skill { get; set; }
    
    [Required]
    public RequestType RequestType { get; set; }
    
    public int? AffectedSessionId { get; set; }
    public DateTime? EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    
    public string? Reason { get; set; }
    public string? Availability { get; set; }
}

public class ResolveScheduleRequestDto
{
    [Required]
    public int RequestId { get; set; }
    
    // If makeup
    public int? TargetSessionId { get; set; }
    
    // If transfer
    public int? TargetClassId { get; set; }
    
    [Required]
    public RequestStatus Status { get; set; } // Usually RESOLVED or CANCELLED
}

public class AdminCreateScheduleRequestDto : CreateScheduleRequestDto
{
    [Required]
    public int StudentProfileId { get; set; }
}
