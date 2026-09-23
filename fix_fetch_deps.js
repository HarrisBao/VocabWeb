const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/student/StudentClassDetailPage.tsx', 'utf8');

content = content.replace("activeTab === 'vocabulary'", "['reading', 'listening'].includes(activeTab)");
content = content.replace("activeTab === 'reading'", "['overview', 'reading'].includes(activeTab)");

fs.writeFileSync('Frontend/src/pages/student/StudentClassDetailPage.tsx', content);
console.log('Fixed fetch dependencies');
