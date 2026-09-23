const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/student/StudentClassDetailPage.tsx', 'utf8');

content = content.replace(/subtitle="[^"]*Vi[^"]*t"/g, 'subtitle="Luyện tập kỹ năng Viết"');
content = content.replace(/subtitle="[^"]*Nghe"/g, 'subtitle="Luyện tập kỹ năng Nghe"');
content = content.replace(/subtitle="[^"]*N[^"]*i"/g, 'subtitle="Luyện tập kỹ năng Nói"');

fs.writeFileSync('Frontend/src/pages/student/StudentClassDetailPage.tsx', content);
console.log('Fixed encoding issues');
