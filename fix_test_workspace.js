const fs = require('fs');
let content = fs.readFileSync('Frontend/src/pages/learn/test/TestSessionPage.tsx', 'utf8');

// 1. Add states
content = content.replace(
    /const \[finalResult, setFinalResult\] = useState<TestFinalResultDto \| null>\(null\)/,
    'const [finalResult, setFinalResult] = useState<TestFinalResultDto | null>(null)\n    const [showExitConfirm, setShowExitConfirm] = useState(false)\n    const [isDiscarding, setIsDiscarding] = useState(false)'
);

// 2. Add handleExit functions
const exitFns = `
    const handleExitClick = () => setShowExitConfirm(true);
    
    const handleConfirmExit = async () => {
      setIsDiscarding(true);
      try {
        await api.delete(\`/learn/attempts/\${attemptId}/discard\`);
      } catch (e) {
        console.error('Failed to discard test attempt', e);
      }
      navigate(\`/test/\${publicCode}\`);
    };

    const handleCancelExit = () => setShowExitConfirm(false);
`;

content = content.replace(
    /const loadCurrentStage = async \(\) => {/,
    exitFns + '\n    const loadCurrentStage = async () => {'
);

// 3. Add Thoát button to Header
content = content.replace(
    /<h1 className="font-bold text-green-700 hidden sm:block">IELTS Thanh LA Learning<\/h1>/,
    `<div className="flex items-center gap-4">
            <button 
              onClick={handleExitClick}
              disabled={isDiscarding}
              className="font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors border border-gray-200 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              Thoát
            </button>
            <h1 className="font-bold text-green-700 hidden sm:block">IELTS Thanh Lê Learning</h1>
          </div>`
);

content = content.replace(
    /<h1 className="font-bold text-green-700 hidden sm:block">IELTS Thanh Lê Learning<\/h1>/,
    `<div className="flex items-center gap-4">
            <button 
              onClick={handleExitClick}
              disabled={isDiscarding}
              className="font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors border border-gray-200 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              Thoát
            </button>
            <h1 className="font-bold text-green-700 hidden sm:block">IELTS Thanh Lê Learning</h1>
          </div>`
); // Run again just in case the character encoding was messed up in regex

// 4. Update the render logic for the ActivityRenderer to hide when discarding
content = content.replace(
    /\{\!loading && \!activityResult && stage && \(/,
    '{!loading && !activityResult && stage && !isDiscarding && ('
);

// 5. Add the modal at the bottom
const modalMarkup = `
        {/* Exit Confirmation Modal */}
        {showExitConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-black text-gray-900 mb-2">Bạn có muốn thoát khỏi bài kiểm tra này không?</h3>
              <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
                Nếu thoát, thời gian và nội dung của lượt kiểm tra hiện tại sẽ không được lưu.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={handleCancelExit}
                  disabled={isDiscarding}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
                >
                  Tiếp tục
                </button>
                <button 
                  onClick={handleConfirmExit}
                  disabled={isDiscarding}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isDiscarding ? 'Đang thoát...' : 'Thoát'}
                </button>
              </div>
            </div>
          </div>
        )}
`;

content = content.replace(
    /<\/div>\n\s*\)\n\}/,
    modalMarkup + '      </div>\n    )\n}'
);

fs.writeFileSync('Frontend/src/pages/learn/test/TestSessionPage.tsx', content);
console.log('Fixed TestSessionPage');
