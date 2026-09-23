const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/student/StudentClassDetailPage.tsx', 'utf8');

const regex = /api\.get<VocabularyUnit\[\]>\(\`\/student\/classes\/\$\{id\}\/vocabulary\`\)/;

if (regex.test(content)) {
    content = content.replace(regex, 'const activeCtx = skillContexts.find(c => c.skill === activeTab.toUpperCase());\n      const targetClassId = activeCtx?.hostClassId || id;\n      api.get<VocabularyUnit[]>(`/student/classes/${targetClassId}/vocabulary`)');
    
    // Also update the dependency array of the useEffect
    content = content.replace(/\[activeTab, id, vocabUnits\.length, vocabError\]/, '[activeTab, id, vocabUnits.length, vocabError, skillContexts]');
    
    fs.writeFileSync('Frontend/src/pages/student/StudentClassDetailPage.tsx', content);
    console.log('Replaced successfully');
} else {
    console.log('Not found');
}
