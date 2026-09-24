const fs = require('fs');

let content = fs.readFileSync('Frontend/src/pages/student/StudentFeedbackPage.tsx', 'utf8');
content = content.replace("name: 'Reading',", "name: 'Đọc hiểu',");
content = content.replace("name: 'Listening',", "name: 'Nghe',");
content = content.replace("name: 'Writing',", "name: 'Viết',");
content = content.replace("name: 'Speaking',", "name: 'Nói',");

fs.writeFileSync('Frontend/src/pages/student/StudentFeedbackPage.tsx', content);
console.log('StudentFeedbackPage updated');
