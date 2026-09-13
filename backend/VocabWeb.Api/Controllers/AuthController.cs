using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocabWeb.Api.Data;
using VocabWeb.Api.DTOs;
using VocabWeb.Api.Models;
using VocabWeb.Api.Services;

namespace VocabWeb.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly IGoogleAuthService _googleAuthService;
    private readonly AppDbContext _db;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ITokenService tokenService,
        IGoogleAuthService googleAuthService,
        AppDbContext db,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _googleAuthService = googleAuthService;
        _db = db;
        _logger = logger;
    }

    [HttpPost("teacher/register")]
    public async Task<IActionResult> TeacherRegister([FromBody] TeacherRegisterDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var existing = await _userManager.FindByEmailAsync(normalizedEmail);
        if (existing != null)
        {
            return BadRequest(new { message = "Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác." });
        }

        var user = new ApplicationUser
        {
            UserName = normalizedEmail,
            Email = normalizedEmail,
            FullName = dto.FullName.Trim(),
            Specialization = dto.Specialization.Trim(),
            PhoneNumber = dto.PhoneNumber?.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return BadRequest(new { message = "Đăng ký không thành công: " + errors });
        }

        // Hard-code role Teacher
        await _userManager.AddToRoleAsync(user, "Teacher");

        // Issue tokens
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var accessToken = _tokenService.GenerateAccessToken(user, "Teacher");
        var refreshToken = _tokenService.GenerateRefreshToken(user.Id, ip);

        _db.RefreshTokens.Add(refreshToken);
        await _db.SaveChangesAsync();

        return Ok(new TokenResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            ExpiresAt = DateTime.UtcNow.AddHours(2),
            User = new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl,
                Specialization = user.Specialization,
                Role = "Teacher",
                CreatedAt = user.CreatedAt
            }
        });
    }

    [HttpPost("teacher/login")]
    public async Task<IActionResult> TeacherLogin([FromBody] TeacherLoginDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var user = await _userManager.FindByEmailAsync(normalizedEmail);
        if (user == null || !user.IsActive)
        {
            return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác." });
        }

        var passCheck = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
        if (!passCheck.Succeeded)
        {
            return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác." });
        }

        // Verify user is Teacher
        var isTeacher = await _userManager.IsInRoleAsync(user, "Teacher");
        if (!isTeacher)
        {
            return StatusCode(403, new { message = "Tài khoản của bạn không có quyền giáo viên." });
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var accessToken = _tokenService.GenerateAccessToken(user, "Teacher");
        var refreshToken = _tokenService.GenerateRefreshToken(user.Id, ip);

        _db.RefreshTokens.Add(refreshToken);
        await _db.SaveChangesAsync();

        return Ok(new TokenResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            ExpiresAt = DateTime.UtcNow.AddHours(2),
            User = new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl,
                Specialization = user.Specialization,
                Role = "Teacher",
                CreatedAt = user.CreatedAt
            }
        });
    }

    [HttpPost("teacher/google")]
    public async Task<IActionResult> TeacherGoogleLogin([FromBody] GoogleLoginDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var authResult = await _googleAuthService.AuthenticateGoogleTeacherAsync(dto.IdToken, ip);

        if (!authResult.Success || authResult.User == null)
        {
            return BadRequest(new { message = authResult.ErrorMessage ?? "Đăng nhập Google thất bại." });
        }

        var user = authResult.User;
        var accessToken = _tokenService.GenerateAccessToken(user, "Teacher");
        var refreshToken = _tokenService.GenerateRefreshToken(user.Id, ip);

        _db.RefreshTokens.Add(refreshToken);
        await _db.SaveChangesAsync();

        return Ok(new TokenResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            ExpiresAt = DateTime.UtcNow.AddHours(2),
            User = new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl,
                Specialization = user.Specialization,
                Role = "Teacher",
                CreatedAt = user.CreatedAt
            }
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto dto)
    {
        var existingToken = await _db.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == dto.RefreshToken);

        if (existingToken == null || !existingToken.IsActive)
        {
            return Unauthorized(new { message = "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại." });
        }

        var user = existingToken.User;
        if (user == null || !user.IsActive)
        {
            return Unauthorized(new { message = "Tài khoản không tồn tại hoặc đã bị khóa." });
        }

        // Revoke old token and issue new token (Rotation)
        existingToken.RevokedAt = DateTime.UtcNow;
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var newRefreshToken = _tokenService.GenerateRefreshToken(user.Id, ip);
        existingToken.ReplacedByToken = newRefreshToken.Token;

        _db.RefreshTokens.Add(newRefreshToken);
        await _db.SaveChangesAsync();

        var roles = await _userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? "Teacher";
        var accessToken = _tokenService.GenerateAccessToken(user, primaryRole);

        return Ok(new TokenResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = newRefreshToken.Token,
            ExpiresAt = DateTime.UtcNow.AddHours(2),
            User = new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl,
                Specialization = user.Specialization,
                Role = primaryRole,
                CreatedAt = user.CreatedAt
            }
        });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDto? dto)
    {
        if (dto != null && !string.IsNullOrWhiteSpace(dto.RefreshToken))
        {
            var token = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.Token == dto.RefreshToken);
            if (token != null && token.IsActive)
            {
                token.RevokedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }

        return Ok(new { message = "Đăng xuất thành công." });
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            AvatarUrl = user.AvatarUrl,
            Specialization = user.Specialization,
            Role = roles.FirstOrDefault() ?? "Teacher",
            CreatedAt = user.CreatedAt
        });
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        user.FullName = dto.FullName.Trim();
        user.Specialization = dto.Specialization?.Trim();
        if (dto.AvatarUrl != null)
        {
            user.AvatarUrl = dto.AvatarUrl.Trim();
        }

        await _userManager.UpdateAsync(user);

        return Ok(new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            AvatarUrl = user.AvatarUrl,
            Specialization = user.Specialization,
            Role = "Teacher",
            CreatedAt = user.CreatedAt
        });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return BadRequest(new { message = "Đổi mật khẩu thất bại: " + errors });
        }

        return Ok(new { message = "Đổi mật khẩu thành công." });
    }
}
