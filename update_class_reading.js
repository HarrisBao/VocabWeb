const fs = require('fs');

let content = fs.readFileSync('Frontend/src/pages/student/StudentClassReadingPage.tsx', 'utf8');
content = content.replace(/<h1 className="text-3xl font-black text-gray-900 mb-2">Reading<\/h1>/, '<h1 className="text-3xl font-black text-gray-900 mb-2">Đọc hiểu</h1>');
content = content.replace(/Các bài tập Reading/, 'Các bài tập Đọc hiểu');
fs.writeFileSync('Frontend/src/pages/student/StudentClassReadingPage.tsx', content);

let classDetail = fs.readFileSync('Frontend/src/pages/student/StudentClassDetailPage.tsx', 'utf8');
classDetail = classDetail.replace(/Vocabulary</, 'Từ vựng<');
fs.writeFileSync('Frontend/src/pages/student/StudentClassDetailPage.tsx', classDetail);

console.log('Done');
