const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/learn/reading/ReadingAttemptWorkspace.tsx', 'utf8');

// 1. Add activeAttemptId state
content = content.replace(
    /const \[isDiscarding, setIsDiscarding\] = useState\(false\);/,
    'const [isDiscarding, setIsDiscarding] = useState(false);\n    const [activeAttemptId, setActiveAttemptId] = useState<string | undefined>(attemptId);'
);

// 2. Set activeAttemptId when fetched
content = content.replace(
    /const startRes = await api\.post\(\`\/learn\/class\/\$\{id\}\/reading\/\$\{readingId\}\/start\`, \{\}\);/,
    `const startRes = await api.post(\`/learn/class/\${id}/reading/\${readingId}/start\`, {});\n        setActiveAttemptId(startRes.attemptId?.toString());`
);

// 3. Fix handleConfirmExit to use activeAttemptId
content = content.replace(
    /await api\.delete\(\`\/learn\/class\/\$\{id\}\/reading\/\$\{readingId\}\/attempts\/\$\{attemptId\}\/discard\`\);/,
    'await api.delete(`/learn/class/${id}/reading/${readingId}/attempts/${activeAttemptId || attemptId}/discard`);'
);

// 4. Fix ReadingAttemptHeader attemptId prop
content = content.replace(
    /attemptId=\{attemptId\}/,
    'attemptId={activeAttemptId || attemptId}'
);

// 5. Add browser back button interception
const popStateCode = `
    useEffect(() => {
      if (isReview) return;
      const handlePopState = (event: PopStateEvent) => {
        window.history.pushState(null, '', window.location.href);
        setShowExitConfirm(true);
      };
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }, [isReview]);
`;
content = content.replace(
    /useEffect\(\(\) => \{\n\s*if \(isReview\)\s*\{\n\s*fetchDataAndStart\(\);\n\s*return;\n\s*\}/,
    popStateCode + '\n    useEffect(() => {\n      if (isReview) {\n        fetchDataAndStart();\n        return;\n      }'
);

fs.writeFileSync('Frontend/src/pages/learn/reading/ReadingAttemptWorkspace.tsx', content);
console.log('Fixed ReadingAttemptWorkspace attemptId & popstate');
