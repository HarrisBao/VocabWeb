const fs = require('fs');

let content = fs.readFileSync('Frontend/src/pages/teacher/TeacherFeedbackPage.tsx', 'utf8');

content = content.replace("label: 'Reading',", "label: 'Đọc hiểu',");
content = content.replace("label: 'Listening',", "label: 'Nghe',");
content = content.replace("label: 'Writing',", "label: 'Viết',");
content = content.replace("label: 'Speaking',", "label: 'Nói',");

fs.writeFileSync('Frontend/src/pages/teacher/TeacherFeedbackPage.tsx', content);
console.log('TeacherFeedbackPage updated');
