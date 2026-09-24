const fs = require('fs');

function updateReadingHome() {
    let content = fs.readFileSync('Frontend/src/pages/student/components/StudentReadingHome.tsx', 'utf8');
    content = content.replace('title="Reading"', 'title="Đọc hiểu"');
    
    // Instead of using BilingualText for "Vocabulary for Reading", replace with Vietnamese text directly
    // Wait, the BilingualText component will be modified globally? 
    // The user said: "Do NOT mix English + Vietnamese labels such as: Vocabulary / Từ vựng... All SYSTEM-GENERATED UI must be Vietnamese."
    // Let's replace the BilingualText usages with spans to be safe.
    
    content = content.replace(/<BilingualText\s+primary=\{vocabularyLabels\.vocabulary\.en\}\s+secondary=\{vocabularyLabels\.vocabulary\.vi\}\s+primaryClass="([^"]+)"\s+secondaryClass="[^"]+"\s*\/>/g, '<span className="$1">{vocabularyLabels.vocabulary.vi}</span>');
    
    content = content.replace(/<BilingualText\s+primary=\{vocabularyLabels\.vocabularyForReading\.en\}\s+secondary=\{vocabularyLabels\.vocabularyForReading\.vi\}\s+primaryClass="([^"]+)"\s+secondaryClass="[^"]+"\s*\/>/g, '<span className="$1 block mb-1">{vocabularyLabels.vocabularyForReading.vi}</span>');
    
    content = content.replace(/<BilingualText\s+primary=\{vocabularyLabels\.viewVocabulary\.en\}\s+secondary=\{vocabularyLabels\.viewVocabulary\.vi\}\s+primaryClass="([^"]*)"\s+secondaryClass="([^"]*)"\s+containerClass="([^"]*)"\s*\/>/g, '<span className="font-bold">{vocabularyLabels.viewVocabulary.vi}</span>');
    
    content = content.replace(/\{vocabularyLabels\.vocabularySets\.en\}/g, '{vocabularyLabels.vocabularySets.vi}');
    
    // Also "Bài tập Reading" -> "Bài tập Đọc hiểu"
    content = content.replace(/<h2 className="text-lg font-black text-gray-900 px-2">Bài tập Reading<\/h2>/g, '<h2 className="text-lg font-black text-gray-900 px-2">Bài tập Đọc hiểu</h2>');

    // Remove BilingualText import if completely unused, but it might still be there. I'll just leave the import to avoid TS errors.
    fs.writeFileSync('Frontend/src/pages/student/components/StudentReadingHome.tsx', content);
}

function updateEmptySkillHome() {
    let content = fs.readFileSync('Frontend/src/pages/student/components/StudentEmptySkillHome.tsx', 'utf8');
    
    // Replace BilingualText usages
    content = content.replace(/<BilingualText\s+primary=\{vocabularyLabels\.vocabulary\.en\}\s+secondary=\{vocabularyLabels\.vocabulary\.vi\}\s+primaryClass="([^"]+)"\s+secondaryClass="[^"]+"\s*\/>/g, '<span className="$1">{vocabularyLabels.vocabulary.vi}</span>');
    
    content = content.replace(/<BilingualText\s+primary=\{title\.toLowerCase\(\) === 'listening' \? vocabularyLabels\.vocabularyForListening\.en : vocabularyLabels\.vocabularyForReading\.en\}\s+secondary=\{title\.toLowerCase\(\) === 'listening' \? vocabularyLabels\.vocabularyForListening\.vi : vocabularyLabels\.vocabularyForReading\.vi\}\s+primaryClass="([^"]+)"\s+secondaryClass="[^"]+"\s*\/>/g, '<span className="$1 block mb-1">{title.toLowerCase() === \'listening\' ? vocabularyLabels.vocabularyForListening.vi : vocabularyLabels.vocabularyForReading.vi}</span>');
    
    content = content.replace(/<BilingualText\s+primary=\{vocabularyLabels\.viewVocabulary\.en\}\s+secondary=\{vocabularyLabels\.viewVocabulary\.vi\}\s+primaryClass="([^"]*)"\s+secondaryClass="([^"]*)"\s+containerClass="([^"]*)"\s*\/>/g, '<span className="font-bold">{vocabularyLabels.viewVocabulary.vi}</span>');
    
    content = content.replace(/\{vocabularyLabels\.vocabularySets\.en\}/g, '{vocabularyLabels.vocabularySets.vi}');
    
    fs.writeFileSync('Frontend/src/pages/student/components/StudentEmptySkillHome.tsx', content);
}

function updateClassDetail() {
    let content = fs.readFileSync('Frontend/src/pages/student/StudentClassDetailPage.tsx', 'utf8');
    
    // Update the props passed to EmptySkillHome
    content = content.replace(/title="Writing"/g, 'title="Viết"');
    content = content.replace(/title="Listening"/g, 'title="Nghe"');
    content = content.replace(/title="Speaking"/g, 'title="Nói"');
    
    fs.writeFileSync('Frontend/src/pages/student/StudentClassDetailPage.tsx', content);
}

updateReadingHome();
updateEmptySkillHome();
updateClassDetail();

console.log('Skill homes updated');
