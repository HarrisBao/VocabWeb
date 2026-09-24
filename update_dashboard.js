const fs = require('fs');

let content = fs.readFileSync('Frontend/src/pages/student/StudentAccountDashboard.tsx', 'utf8');

content = content.replace("label: 'Reading'", "label: 'Đọc hiểu'");
content = content.replace("label: 'Listening'", "label: 'Nghe'");
content = content.replace("label: 'Writing'", "label: 'Viết'");
content = content.replace("label: 'Speaking'", "label: 'Nói'");

fs.writeFileSync('Frontend/src/pages/student/StudentAccountDashboard.tsx', content);
console.log('StudentAccountDashboard updated');
