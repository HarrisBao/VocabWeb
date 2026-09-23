const fs = require('fs');

let content = fs.readFileSync('Frontend/src/pages/learn/reading/ReadingAttemptWorkspace.tsx', 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

const modalCode = `
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Bạn có muốn thoát khỏi bài làm này không?</h3>
            <p className="text-gray-600 mb-6">Nếu thoát, thời gian và nội dung của lượt làm hiện tại sẽ không được lưu.</p>
            <div className="flex space-x-3">
              <button 
                onClick={handleCancelExit}
                disabled={isDiscarding}
                className="flex-1 bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-800 font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
              >
                Tiếp tục
              </button>
              <button 
                onClick={handleConfirmExit}
                disabled={isDiscarding}
                className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isDiscarding ? <Spinner /> : 'Thoát'}
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
    /return \(\n\s*<div className="flex flex-col h-screen overflow-hidden bg-gray-50 font-sans">/,
    'return (\n      <div className="flex flex-col h-screen overflow-hidden bg-gray-50 font-sans">\n' + modalCode
);

fs.writeFileSync('Frontend/src/pages/learn/reading/ReadingAttemptWorkspace.tsx', content);
console.log("Modal rendered:", content.includes("Bạn có muốn thoát khỏi bài làm này không?"));
