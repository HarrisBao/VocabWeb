const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/student/components/StudentEmptySkillHome.tsx', 'utf8');

if (!content.includes('useParams')) {
    content = content.replace("import React from 'react';", "import React from 'react';\nimport { useParams } from 'react-router-dom';");
    content = content.replace(/(export const StudentEmptySkillHome.*?{)/s, "$1\n  const { id } = useParams<{ id: string }>();");
    content = content.replace(/\$\{window\.location\.pathname\.split\('\/'\)\[3\]\}/g, "${id}");
    fs.writeFileSync('Frontend/src/pages/student/components/StudentEmptySkillHome.tsx', content);
    console.log('Fixed useParams');
}
