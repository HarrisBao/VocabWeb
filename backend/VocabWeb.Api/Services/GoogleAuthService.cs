using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using VocabWeb.Api.Models;

namespace VocabWeb.Api.Services;

public class GoogleAuthService : IGoogleAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GoogleAuthService> _logger;

    public GoogleAuthService(
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration,
        ILogger<GoogleAuthService> logger)
    {
        _userManager = userManager;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<GoogleAuthResult> AuthenticateGoogleTeacherAsync(string idToken, string? ipAddress)
    {
        var clientId = _configuration["GOOGLE_CLIENT_ID"] ?? _configuration["Google:ClientId"];

        if (string.IsNullOrWhiteSpace(clientId) || clientId == "your_google_client_id_here")
        {
            return new GoogleAuthResult
            {
                Success = false,
                ErrorMessage = "Hệ thống chưa cấu hình GOOGLE_CLIENT_ID. Vui lòng cấu hình Client ID từ Google Cloud Console để sử dụng tính năng này."
            };
        }

        GoogleJsonWebSignature.Payload payload;
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { clientId }
            };

            payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
        }
        catch (InvalidJwtException ex)
        {
            _logger.LogWarning(ex, "Invalid Google ID token");
            return new GoogleAuthResult
            {
                Success = false,
                ErrorMessage = "Token Google không hợp lệ hoặc đã hết hạn. Vui lòng thử lại."
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Google token validation failed");
            return new GoogleAuthResult
            {
                Success = false,
                ErrorMessage = "Không thể xác thực với Google. Vui lòng thử lại sau."
            };
        }

        if (!payload.EmailVerified)
        {
            return new GoogleAuthResult
            {
                Success = false,
                ErrorMessage = "Tài khoản Google chưa được xác minh địa chỉ email."
            };
        }

        var normalizedEmail = payload.Email.Trim().ToLowerInvariant();
        var user = await _userManager.FindByEmailAsync(normalizedEmail);

        if (user != null)
        {
            // Check if account is active
            if (!user.IsActive)
            {
                return new GoogleAuthResult
                {
                    Success = false,
                    ErrorMessage = "Tài khoản giáo viên này hiện đang bị khóa. Vui lòng liên hệ quản trị viên."
                };
            }

            // Account Linking: Link Google ID and update avatar if not present
            bool needsUpdate = false;
            if (string.IsNullOrEmpty(user.GoogleSubjectId))
            {
                user.GoogleSubjectId = payload.Subject;
                needsUpdate = true;
            }

            if (string.IsNullOrEmpty(user.AvatarUrl) && !string.IsNullOrEmpty(payload.Picture))
            {
                user.AvatarUrl = payload.Picture;
                needsUpdate = true;
            }

            user.LastLoginAt = DateTime.UtcNow;
            if (needsUpdate)
            {
                await _userManager.UpdateAsync(user);
            }

            // Ensure Teacher role is assigned
            if (!await _userManager.IsInRoleAsync(user, "Teacher"))
            {
                await _userManager.AddToRoleAsync(user, "Teacher");
            }

            return new GoogleAuthResult
            {
                Success = true,
                User = user
            };
        }

        // Create new Teacher user from Google profile
        var newUser = new ApplicationUser
        {
            UserName = normalizedEmail,
            Email = normalizedEmail,
            EmailConfirmed = true,
            FullName = !string.IsNullOrWhiteSpace(payload.Name) ? payload.Name : payload.Email.Split('@')[0],
            AvatarUrl = payload.Picture,
            GoogleSubjectId = payload.Subject,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow
        };

        var createResult = await _userManager.CreateAsync(newUser);
        if (!createResult.Succeeded)
        {
            var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
            _logger.LogError("Failed to create local user for Google sign-in: {Errors}", errors);
            return new GoogleAuthResult
            {
                Success = false,
                ErrorMessage = "Không thể tạo tài khoản từ Google. Vui lòng thử lại."
            };
        }

        // Hard-code assign Teacher role (Do NOT accept role from frontend)
        await _userManager.AddToRoleAsync(newUser, "Teacher");

        // Add external login info
        await _userManager.AddLoginAsync(newUser, new UserLoginInfo("Google", payload.Subject, "Google"));

        return new GoogleAuthResult
        {
            Success = true,
            User = newUser
        };
    }
}
