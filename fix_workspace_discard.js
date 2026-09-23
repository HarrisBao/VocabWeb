const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/learn/reading/ReadingAttemptWorkspace.tsx', 'utf8');
content = content.replace(/\r\n/g, '\n');

const target = `  const handleConfirmExit = async () => {
    // 1. block further editing & stop autosave
    setIsDiscarding(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaveStatus('SAVED'); // fake success to clear errors

    // 2. perform discard
    try {
      await api.delete(\`/learn/class/\${id}/reading/\${readingId}/attempts/\${activeAttemptId || attemptId}/discard\`);
    } catch (e) {
      console.error('Failed to discard attempt', e);
    }
    
    // 3. navigate away
    navigate(\`/student/classes/\${id}?tab=reading\`);
  };`;

const replacement = `  const handleConfirmExit = async () => {
    setIsDiscarding(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaveStatus('SAVED');

    try {
      console.log("[READING DISCARD] start", { classId: id, readingId, attemptId: activeAttemptId || attemptId });
      console.log("[READING DISCARD] calling API");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await api.delete(\`/learn/class/\${id}/reading/\${readingId}/attempts/\${activeAttemptId || attemptId}/discard\`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log("[READING DISCARD] success", response);

      navigate(\`/student/classes/\${id}?tab=reading\`);
    } catch (e: any) {
      console.error("[READING DISCARD] failed", e);
      alert('Không thể thoát khỏi bài lúc này. Vui lòng thử lại.');
      setShowExitConfirm(false);
    } finally {
      console.log("[READING DISCARD] finished");
      setIsDiscarding(false);
    }
  };`;

if (content.includes(target)) {
    fs.writeFileSync('Frontend/src/pages/learn/reading/ReadingAttemptWorkspace.tsx', content.replace(target, replacement));
    console.log('Replaced successfully');
} else {
    console.log('Target not found');
}
