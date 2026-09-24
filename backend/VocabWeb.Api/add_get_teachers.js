const fs = require('fs');

let content = fs.readFileSync('Controllers/AdminController.cs', 'utf8');

const getTeachersMethod = `
    [HttpGet("teachers")]
    public async Task<IActionResult> GetTeachers()
    {
        var teachers = await _userManager.GetUsersInRoleAsync("Teacher");
        return Ok(teachers.Where(t => t.IsActive).Select(t => new { t.Id, t.FullName, t.Email }));
    }
`;

content = content.replace('public async Task<IActionResult> GetAdminOverview()', getTeachersMethod + '\n    [HttpGet("overview")]\n    public async Task<IActionResult> GetAdminOverview()');

fs.writeFileSync('Controllers/AdminController.cs', content);
console.log('Added GetTeachers');
