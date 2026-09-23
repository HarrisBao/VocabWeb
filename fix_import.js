const fs = require('fs');

let hub = fs.readFileSync('Frontend/src/pages/student/StudentVocabularyHubPage.tsx', 'utf8');
hub = hub.replace('../../lib/api', '../../services/api');
fs.writeFileSync('Frontend/src/pages/student/StudentVocabularyHubPage.tsx', hub);

console.log('Fixed import');
