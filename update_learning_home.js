const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/student/components/StudentLearningHome.tsx', 'utf8');

content = content.replace("label: 'Reading'", "label: 'Đọc hiểu'");
content = content.replace("label: 'Listening'", "label: 'Nghe'");
content = content.replace("label: 'Writing'", "label: 'Viết'");
content = content.replace("label: 'Speaking'", "label: 'Nói'");
content = content.replace("Vocabulary</p>", "Từ vựng</p>");
content = content.replace("Truy cập qua các kỹ năng Reading hoặc Listening", "Truy cập qua các kỹ năng Đọc hiểu hoặc Nghe");
content = content.replace("Ôn Reading", "Ôn Đọc hiểu");
content = content.replace("Ôn Listening", "Ôn Nghe");

fs.writeFileSync('Frontend/src/pages/student/components/StudentLearningHome.tsx', content);
console.log('StudentLearningHome updated');
