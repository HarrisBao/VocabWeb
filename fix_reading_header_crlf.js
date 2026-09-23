const fs = require('fs');

let content = fs.readFileSync('Frontend/src/pages/learn/reading/components/ReadingAttemptHeader.tsx', 'utf8');

// Normalize line endings for regex
content = content.replace(/\r\n/g, '\n');

// 1. Add onExit prop
content = content.replace(
    /isReview\?:\s*boolean;\n\}/,
    'isReview?: boolean;\n  onExit?: () => void;\n}'
);

// 2. Add onExit to destructuring
content = content.replace(
    /isSubmitting,\n\s*isReview\n\}\)\s*=>\s*\{/,
    'isSubmitting,\n  isReview,\n  onExit\n}) => {'
);

// 3. Fix the back button click
content = content.replace(
    /onClick=\{\(\)\s*=>\s*\{\n\s*if\s*\(isReview\)\s*\{\n\s*navigate\(`\/student\/classes\/\$\{classId\}\/reading\/\$\{readingId\}\/attempts\/\$\{attemptId\}\/result`\);\n\s*\}\s*else\s*\{\n\s*navigate\(`\/student\/classes\/\$\{classId\}`\);\n\s*\}\n\s*\}\}/,
    `onClick={() => {
            if (isReview) {
              navigate(\`/student/classes/\${classId}/reading/\${readingId}/attempts/\${attemptId}/result\`);
            } else {
              if (onExit) onExit();
              else navigate(\`/student/classes/\${classId}?tab=reading\`);
            }
          }}`
);

// Write back with CRLF if needed
fs.writeFileSync('Frontend/src/pages/learn/reading/components/ReadingAttemptHeader.tsx', content);

console.log("onExit included:", content.includes("onExit"));
console.log("navigate onExit included:", content.includes("if (onExit) onExit()"));
