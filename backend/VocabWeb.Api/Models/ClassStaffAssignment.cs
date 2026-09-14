namespace VocabWeb.Api.Models;

public class ClassStaffAssignment
{
    public int Id { get; set; }
    
    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;
    
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;
    
    public string StaffRole { get; set; } = "TA"; // TEACHER or TA
}
