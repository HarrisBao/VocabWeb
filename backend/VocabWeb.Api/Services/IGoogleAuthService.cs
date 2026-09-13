using Google.Apis.Auth;
using VocabWeb.Api.DTOs;
using VocabWeb.Api.Models;

namespace VocabWeb.Api.Services;

public class GoogleAuthResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public ApplicationUser? User { get; set; }
}

public interface IGoogleAuthService
{
    Task<GoogleAuthResult> AuthenticateGoogleTeacherAsync(string idToken, string? ipAddress);
}
