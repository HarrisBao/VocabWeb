const fs = require('fs');
let content = fs.readFileSync('Frontend/src/components/progress/StudentProgressWidget.tsx', 'utf8');

content = content.replace(/\\\$/g, '$');
content = content.replace(/\\`/g, '`');

fs.writeFileSync('Frontend/src/components/progress/StudentProgressWidget.tsx', content);
console.log('Fixed syntax');
