const fs = require('fs');

let content = fs.readFileSync('Frontend/src/pages/student/StudentVocabularyHubPage.tsx', 'utf8');

// The Page Header
content = content.replace(/<BilingualText\s+primary=\{enTitle\}\s+secondary=\{viTitle\}\s+primaryClass="font-black text-gray-900"\s+secondaryClass="text-gray-500 font-medium text-xs"\s+containerClass="flex flex-col ml-1"\s*\/>/g, '<span className="font-black text-gray-900 ml-1">{viTitle}</span>');

// The Banner Header
content = content.replace(/<BilingualText\s+primary=\{enTitle\}\s+secondary=\{viTitle\}\s+primaryClass="text-3xl font-black mb-1 block"\s+secondaryClass="text-white\/80 font-medium"\s*\/>/g, '<span className="text-3xl font-black mb-1 block">{viTitle}</span>');

// Banner Subtitle
content = content.replace(/<BilingualText\s+primary=\{vocabularyLabels\.teacherPreparedSets\.en\}\s+secondary=\{vocabularyLabels\.teacherPreparedSets\.vi\}\s+primaryClass="block font-semibold mb-0\.5"\s+secondaryClass="opacity-70 text-sm"\s+containerClass="mt-6"\s*\/>/g, '<div className="mt-6 font-semibold">{vocabularyLabels.teacherPreparedSets.vi}</div>');

// Empty State
content = content.replace(/<BilingualText\s+primary=\{vocabularyLabels\.emptyStateTitle\.en\}\s+secondary=\{vocabularyLabels\.emptyStateTitle\.vi\}\s+primaryClass="text-xl font-bold text-gray-900 mb-1 block"\s+secondaryClass="text-gray-500"\s*\/>/g, '<span className="text-xl font-bold text-gray-900 mb-1 block">{vocabularyLabels.emptyStateTitle.vi}</span>');

// Review Button
content = content.replace(/<BilingualText\s+primary=\{vocabularyLabels\.review\.en\}\s+secondary=\{vocabularyLabels\.review\.vi\}\s+primaryClass=""\s+secondaryClass="font-normal opacity-80 ml-1"\s+containerClass="flex items-baseline"\s*\/>/g, '<span>{vocabularyLabels.review.vi}</span>');

// Word count
content = content.replace(/\{unit\.wordCount\}\s*\{vocabularyLabels\.words\.en\}/g, '{unit.wordCount} {vocabularyLabels.words.vi}');

// Let's modify enTitle logic to just fallback if we want, but viTitle is enough.

fs.writeFileSync('Frontend/src/pages/student/StudentVocabularyHubPage.tsx', content);
console.log('Hub Page updated');
