const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/student/StudentAccountDashboard.tsx', 'utf8');

content = content.replace(/\\\$/g, '$');
content = content.replace(/\\`/g, '`');

fs.writeFileSync('Frontend/src/pages/student/StudentAccountDashboard.tsx', content);
console.log('Fixed syntax');
