const fs = require('fs');

// Fix StudentVocabularyHubPage
let hub = fs.readFileSync('Frontend/src/pages/student/StudentVocabularyHubPage.tsx', 'utf8');
hub = hub.replace('ctx•.hostClassId', 'ctx?.hostClassId');
fs.writeFileSync('Frontend/src/pages/student/StudentVocabularyHubPage.tsx', hub);

// Fix StudentEmptySkillHome imports
let emptyHome = fs.readFileSync('Frontend/src/pages/student/components/StudentEmptySkillHome.tsx', 'utf8');
emptyHome = emptyHome.replace('../../components/ui/BilingualText', '../../../components/ui/BilingualText');
emptyHome = emptyHome.replace('../../i18n/labels', '../../../i18n/labels');
fs.writeFileSync('Frontend/src/pages/student/components/StudentEmptySkillHome.tsx', emptyHome);

console.log('Fixed build errors');
