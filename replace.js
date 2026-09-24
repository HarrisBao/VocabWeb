const fs = require('fs');
const path = require('path');

const files = [
    'backend/VocabWeb.Api/Controllers/ClassController.cs',
    'backend/VocabWeb.Api/Controllers/ReadingController.cs',
    'backend/VocabWeb.Api/Controllers/ProgressController.cs',
    'backend/VocabWeb.Api/Controllers/FeedbackController.cs'
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. ClassController: Remove c.TeacherId == teacherId from GetClasses
    content = content.replace(
        /.Where\(c => !c.IsArchived && \(allowedClassIds.Contains\(c.Id\) \|\| c.TeacherId == teacherId \|\| _db.ClassStaffAssignments.Any\(sa => sa.ClassId == c.Id && sa.UserId == teacherId\)\)\)/g,
        '.Where(c => !c.IsArchived && (allowedClassIds.Contains(c.Id) || _db.ClassStaffAssignments.Any(sa => sa.ClassId == c.Id && sa.UserId == teacherId)))'
    );

    // 2. ClassController: Remove cls.TeacherId == teacherId from GetClass
    content = content.replace(
        /var hasAccess = skills.Any\(\) \|\| cls.TeacherId == teacherId \|\| await _db.ClassStaffAssignments.AnyAsync\(sa => sa.ClassId == id && sa.UserId == teacherId\);/g,
        'var hasAccess = skills.Any() || await _db.ClassStaffAssignments.AnyAsync(sa => sa.ClassId == id && sa.UserId == teacherId);'
    );
    
    // 3. ReadingController: HasAccessToClass requireOwnership
    content = content.replace(
        /return await _db.Classes.AnyAsync\(c => c.Id == classId && c.TeacherId == teacherId\);/g,
        'return await _db.ClassSkillOfferings.AnyAsync(o => o.ClassId == classId && o.TeacherId == teacherId && o.Skill == IeltsSkill.READING && o.IsActive);'
    );

    // 4. ReadingController: GetAssignedClasses allTeacherClasses
    content = content.replace(
        /var allTeacherClasses = await _db.Classes\s*\n\s*\.Where\(c => c.TeacherId == teacherId\)/g,
        'var allTeacherClasses = await _db.Classes\n                .Where(c => _db.ClassSkillOfferings.Any(o => o.ClassId == c.Id && o.TeacherId == teacherId && o.IsActive))'
    );
    
    // 5. ReadingController: AssignToClasses validClasses
    content = content.replace(
        /var validClasses = await _db.Classes\s*\n\s*\.Where\(c => c.TeacherId == teacherId && classIds.Contains\(c.Id\)\)/g,
        'var validClasses = await _db.Classes\n                .Where(c => classIds.Contains(c.Id) && _db.ClassSkillOfferings.Any(o => o.ClassId == c.Id && o.TeacherId == teacherId && o.IsActive))'
    );

    // 6. FeedbackController: hasAccess
    content = content.replace(
        /if \(offering.TeacherId != userId && offering.Class.TeacherId != userId\)/g,
        'if (offering.TeacherId != userId)'
    );

    fs.writeFileSync(file, content);
}
console.log('Replacements complete');
