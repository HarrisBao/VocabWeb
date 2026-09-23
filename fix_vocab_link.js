const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/student/components/StudentReadingHome.tsx', 'utf8');

content = content.replace(
  "to={`/student/classes/${classId}/vocabulary/${unit.id}`}",
  "to={`/learn/vocabulary/${unit.id}?classId=${classId}`}"
);

fs.writeFileSync('Frontend/src/pages/student/components/StudentReadingHome.tsx', content);
console.log('Fixed vocabulary link in StudentReadingHome');
