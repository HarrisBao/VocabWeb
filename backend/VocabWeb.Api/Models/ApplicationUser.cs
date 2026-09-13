using Microsoft.AspNetCore.Identity;

namespace VocabWeb.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Specialization { get; set; }
    public string? GoogleSubjectId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }

    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<VocabularySet> VocabularySets { get; set; } = new List<VocabularySet>();
    public ICollection<Class> Classes { get; set; } = new List<Class>();
    public ICollection<Test> Tests { get; set; } = new List<Test>();
}
