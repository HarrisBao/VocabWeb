const fs = require('fs');

let content = fs.readFileSync('Frontend/src/pages/learn/reading/ReadingAttemptWorkspace.tsx', 'utf8');

// Normalize line endings for regex
content = content.replace(/\r\n/g, '\n');

const popStateCode = `
  useEffect(() => {
    if (isReview) return;
    const handlePopState = (event) => {
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
    /useEffect\(\(\) => \{\n\s*if \(isReview\)\s*\{\n\s*fetchDataAndStart\(\);\n\s*return;\n\s*\}\n\n\s*const result = runCheck\(\);/,
    popStateCode + '\n  useEffect(() => {\n    if (isReview) {\n      fetchDataAndStart();\n      return;\n    }\n\n    const result = runCheck();'
);

fs.writeFileSync('Frontend/src/pages/learn/reading/ReadingAttemptWorkspace.tsx', content);

console.log("popstate included:", content.includes("popstate"));
