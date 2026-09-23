const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/learn/reading/components/ReadingAttemptHeader.tsx', 'utf8');

// Add onExit prop
content = content.replace(
    /isReview\?: boolean;\n\}/,
    'isReview?: boolean;\n  onExit?: () => void;\n}'
);

// Destructure onExit
content = content.replace(
    /isSubmitting,\n  isReview\n\}\) => \{/,
    'isSubmitting,\n  isReview,\n  onExit\n}) => {'
);

// Modify the button onClick and content
content = content.replace(
    /if \(isReview\) \{\n\s*navigate\(\`\/student\/classes\/\$\{classId\}\/reading\/\$\{readingId\}\/attempts\/\$\{attemptId\}\/result\`\);\n\s*\} else \{\n\s*navigate\(\`\/student\/classes\/\$\{classId\}\`\);\n\s*\}/,
    `if (isReview) {
              navigate(\`/student/classes/\${classId}/reading/\${readingId}/attempts/\${attemptId}/result\`);
            } else {
              if (onExit) onExit();
              else navigate(\`/student/classes/\${classId}?tab=reading\`);
            }`
);

content = content.replace(
    /<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth=\{2\} d="M10 19l-7-7m0 0l7-7m-7 7h18" \/><\/svg>/,
    `{isReview ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          ) : (
            <span className="font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors border border-gray-200 flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>Thoát</span>
          )}`
);

fs.writeFileSync('Frontend/src/pages/learn/reading/components/ReadingAttemptHeader.tsx', content);
console.log('Fixed ReadingAttemptHeader');
