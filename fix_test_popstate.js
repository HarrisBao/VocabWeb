const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/learn/test/TestSessionPage.tsx', 'utf8');

// Add popstate hook
const popStateCode = `
    useEffect(() => {
      const handlePopState = (event: PopStateEvent) => {
        window.history.pushState(null, '', window.location.href);
        setShowExitConfirm(true);
      };
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }, []);
`;
content = content.replace(
    /const loadCurrentStage = async \(\) => \{/,
    popStateCode + '\n    const loadCurrentStage = async () => {'
);

fs.writeFileSync('Frontend/src/pages/learn/test/TestSessionPage.tsx', content);
console.log('Fixed TestSessionPage popstate');
