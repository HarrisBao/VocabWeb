const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/student/StudentClassDetailPage.tsx', 'utf8');

content = content.replace("const STUDENT_CLASS_TABS = ['overview', 'vocabulary', 'reading', 'writing'] as const;", "const STUDENT_CLASS_TABS = ['overview', 'reading', 'writing', 'listening', 'speaking'] as const;");

fs.writeFileSync('Frontend/src/pages/student/StudentClassDetailPage.tsx', content);
console.log('Replaced tabs');
