using System.Security.Claims;
using VocabWeb.Api.DTOs;
using VocabWeb.Api.Models;

namespace VocabWeb.Api.Services;

public interface ITokenService
{
    string GenerateAccessToken(ApplicationUser user, string role);
    string GenerateNoAccountStudentToken(StudentProfile profile, ClassEnrollment enrollment);
    RefreshToken GenerateRefreshToken(string userId, string? ipAddress);
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
