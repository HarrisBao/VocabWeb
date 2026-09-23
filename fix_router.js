const fs = require('fs');
let content = fs.readFileSync('Frontend/src/router/index.tsx', 'utf8');

const importTarget = `import { StudentFeedbackPage } from '../pages/student/StudentFeedbackPage'`;
const importReplacement = importTarget + `\nimport { StudentVocabularyHubPage } from '../pages/student/StudentVocabularyHubPage'`;

const routeTarget = `<Route path="classes/:id/:skillId" element={<StudentComingSoonPage />} />`;
const routeReplacement = `<Route path="classes/:id/:skill-vocabulary" element={<StudentVocabularyHubPage />} />\n              ` + routeTarget;

content = content.replace(importTarget, importReplacement).replace(routeTarget, routeReplacement);

fs.writeFileSync('Frontend/src/router/index.tsx', content);
console.log('Replaced successfully');
