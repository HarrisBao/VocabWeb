const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/learn/reading/ReadingAttemptWorkspace.tsx', 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// Pass onExit to ReadingAttemptHeader
content = content.replace(
    /isSubmitting=\{isSubmitting\}\n\s*isReview=\{isReview\}\n\s*\/>/,
    'isSubmitting={isSubmitting}\n          isReview={isReview}\n          onExit={!isReview ? handleExitClick : undefined}\n        />'
);

fs.writeFileSync('Frontend/src/pages/learn/reading/ReadingAttemptWorkspace.tsx', content);
console.log("onExit prop passed:", content.includes("onExit={!isReview ? handleExitClick : undefined}"));
