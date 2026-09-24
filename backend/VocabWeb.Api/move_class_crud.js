const fs = require('fs');

let classCtrl = fs.readFileSync('Controllers/ClassController.cs', 'utf8');

// Extract the methods
const createRegex = /\[HttpPost\][\s\S]*?public async Task<IActionResult> CreateClass\(\[FromBody\] CreateClassDto dto\)[\s\S]*?_db\.SaveChangesAsync\(\);\s*return Ok\(new \{[^\}]+\}\);\s*\}/;
const updateRegex = /\[HttpPut\("\{id\}"\)\][\s\S]*?public async Task<IActionResult> UpdateClass\(int id, \[FromBody\] CreateClassDto dto\)[\s\S]*?_db\.SaveChangesAsync\(\);\s*return Ok\(new \{[^\}]+\}\);\s*\}/;
const deleteRegex = /\[HttpDelete\("\{id\}"\)\][\s\S]*?public async Task<IActionResult> DeleteClass\(int id\)[\s\S]*?_db\.SaveChangesAsync\(\);\s*return Ok\(new \{[^\}]+\}\);\s*\}/;

const createMatch = classCtrl.match(createRegex);
const updateMatch = classCtrl.match(updateRegex);
const deleteMatch = classCtrl.match(deleteRegex);

if (!createMatch || !updateMatch || !deleteMatch) {
    console.log("Could not find one or more methods in ClassController.");
}

// Remove from ClassController
classCtrl = classCtrl.replace(createMatch[0], '');
classCtrl = classCtrl.replace(updateMatch[0], '');
classCtrl = classCtrl.replace(deleteMatch[0], '');

fs.writeFileSync('Controllers/ClassController.cs', classCtrl);

// Now add to AdminController
let adminCtrl = fs.readFileSync('Controllers/AdminController.cs', 'utf8');

// Modify the extracted methods to use Admin ID for TeacherId (since it's a required FK)
let newCreate = createMatch[0].replace('var teacherId = GetTeacherId();', 'var teacherId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;');
newCreate = newCreate.replace('if (string.IsNullOrEmpty(teacherId)) return Unauthorized();', 'if (string.IsNullOrEmpty(teacherId)) return Unauthorized();');
// change route to [HttpPost("classes")]
newCreate = newCreate.replace('[HttpPost]', '[HttpPost("classes")]');

let newUpdate = updateMatch[0].replace('var teacherId = GetTeacherId();', 'var teacherId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;');
newUpdate = newUpdate.replace('c.TeacherId == teacherId && ', ''); // Admin can update any class
newUpdate = newUpdate.replace('[HttpPut("{id}")]', '[HttpPut("classes/{id}")]');

let newDelete = deleteMatch[0].replace('var teacherId = GetTeacherId();', 'var teacherId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;');
newDelete = newDelete.replace('c.TeacherId == teacherId && ', ''); // Admin can delete any class
newDelete = newDelete.replace('[HttpDelete("{id}")]', '[HttpDelete("classes/{id}")]');

const methodsToAdd = `
${newCreate}
${newUpdate}
${newDelete}
`;

adminCtrl = adminCtrl.replace('public async Task<IActionResult> GetAdminOverview()', methodsToAdd + '\n    [HttpGet("overview")]\n    public async Task<IActionResult> GetAdminOverview()');

// Also need CreateClassDto in AdminController? It might be in another file, or we can just redefine it or use it if it's in a shared namespace.
// In ClassController.cs, CreateClassDto is defined at the bottom.
// Let's copy CreateClassDto if it's not available. Actually, they are in the same namespace `VocabWeb.Api.Controllers`.
// Wait, `CreateClassDto` is in `VocabWeb.Api.Controllers` namespace! So it's accessible.

fs.writeFileSync('Controllers/AdminController.cs', adminCtrl);

console.log('Moved class CRUD to AdminController.');
