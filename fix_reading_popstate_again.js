const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/learn/reading/ReadingAttemptWorkspace.tsx', 'utf8');

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
    /useEffect\(\(\) => \{\n\s*if \(isReview\) \{\n\s*fetchDataAndStart\(\);\n\s*return;\n\s*\}/,
    popStateCode + '\n  useEffect(() => {\n    if (isReview) {\n      fetchDataAndStart();\n      return;\n    }'
);

fs.writeFileSync('Frontend/src/pages/learn/reading/ReadingAttemptWorkspace.tsx', content);
console.log('Fixed ReadingAttemptWorkspace popstate');
