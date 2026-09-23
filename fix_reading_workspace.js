const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/learn/reading/ReadingAttemptWorkspace.tsx', 'utf8');

// 1. Add showExitConfirm state
content = content.replace(
    /const \[isSubmitting, setIsSubmitting\] = useState\(false\);/,
    'const [isSubmitting, setIsSubmitting] = useState(false);\n  const [showExitConfirm, setShowExitConfirm] = useState(false);\n  const [isDiscarding, setIsDiscarding] = useState(false);'
);

// 2. Add handleExit logic
const handleExitFn = `  const handleExitClick = () => {
    setShowExitConfirm(true);
  };

  const handleConfirmExit = async () => {
    // 1. block further editing & stop autosave
    setIsDiscarding(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaveStatus('SAVED'); // fake success to clear errors

    // 2. perform discard
    try {
      await api.delete(\`/learn/class/\${id}/reading/\${readingId}/attempts/\${attemptId}/discard\`);
    } catch (e) {
      console.error('Failed to discard attempt', e);
    }
    
    // 3. navigate away
    navigate(\`/student/classes/\${id}?tab=reading\`);
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };
`;

content = content.replace(
    /const handleAnswerChange = /,
    handleExitFn + '\n  const handleAnswerChange = '
);

// 3. Update ReadingAttemptHeader to use onExit
content = content.replace(
    /isReview=\{isReview\}\n\s*\/>/,
    'isReview={isReview}\n          onExit={!isReview ? handleExitClick : undefined}\n        />'
);

// 4. Add the modal before the final closing tag
const modalMarkup = `
      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-gray-900 mb-2">Bạn có muốn thoát khỏi bài làm này không?</h3>
            <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
              Nếu thoát, thời gian và nội dung của lượt làm hiện tại sẽ không được lưu.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={handleCancelExit}
                disabled={isDiscarding}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
              >
                Tiếp tục
              </button>
              <button 
                onClick={handleConfirmExit}
                disabled={isDiscarding}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isDiscarding ? <Spinner /> : 'Thoát'}
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
    /<\/div>\n\s*\);\n\}/,
    modalMarkup + '      </div>\n    );\n}'
);

// 5. Ensure the timer stops when showExitConfirm is true
content = content.replace(
    /if \(isReview \|\| !startedAt\) return;/,
    'if (isReview || !startedAt || showExitConfirm || isDiscarding) return;'
);

fs.writeFileSync('Frontend/src/pages/learn/reading/ReadingAttemptWorkspace.tsx', content);
console.log('Fixed ReadingAttemptWorkspace');
