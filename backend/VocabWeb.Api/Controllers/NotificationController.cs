using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VocabWeb.Api.Data;
using VocabWeb.Api.Models;

namespace VocabWeb.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationController : ControllerBase
{
    private readonly AppDbContext _db;

    public NotificationController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetNotifications()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var profile = await _db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == userId);
        if (profile == null) return Ok(new List<object>()); // Not a student

        var notifications = await _db.StudentNotifications
            .Where(n => n.StudentProfileId == profile.Id)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .Select(n => new 
            {
                n.Id,
                n.Type,
                n.Message,
                n.IsRead,
                n.CreatedAt,
                n.ClassId
            })
            .ToListAsync();

        return Ok(notifications);
    }

    [HttpPut("{id}/read")]
    [Authorize]
    public async Task<IActionResult> MarkRead(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var profile = await _db.StudentProfiles.FirstOrDefaultAsync(sp => sp.UserId == userId);
        if (profile == null) return Forbid();

        var notification = await _db.StudentNotifications.FirstOrDefaultAsync(n => n.Id == id && n.StudentProfileId == profile.Id);
        if (notification == null) return NotFound();

        notification.IsRead = true;
        await _db.SaveChangesAsync();

        return Ok();
    }
}
