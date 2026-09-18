import React from 'react';

interface QuestionNavigatorProps {
  questions: Array<{ id: number; displayNumber: string; groupId: number }>;
  answers: Record<number, string>;
  currentQuestionId: number | null;
  onQuestionClick: (id: number) => void;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({ questions, answers, currentQuestionId, onQuestionClick }) => {
  // Group questions by groupId to visually separate them
  const groups: Record<number, typeof questions> = {};
  questions.forEach(q => {
    if (!groups[q.groupId]) groups[q.groupId] = [];
    groups[q.groupId].push(q);
  });
  
  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] overflow-x-auto">
      <div className="flex items-center space-x-6 min-w-max mx-auto justify-center">
        {Object.keys(groups).map((groupIdStr, idx) => {
          const groupId = parseInt(groupIdStr);
          const groupQuestions = groups[groupId];
          
          return (
            <div key={groupId} className="flex items-center space-x-2">
              {groupQuestions.map(q => {
                const ans = answers[q.id];
                const isAnswered = ans !== undefined && ans.trim() !== '';
                const isCurrent = q.id === currentQuestionId;
                
                let stateClass = "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"; // Unanswered
                if (isAnswered) {
                  stateClass = "bg-green-100 text-green-800 border-green-200"; // Answered
                }
                
                let focusClass = "border";
                if (isCurrent) {
                  focusClass = "border-2 border-indigo-500 ring-2 ring-indigo-200 ring-offset-1"; // Current focus ring
                }
                
                const ariaLabel = `Câu ${q.displayNumber}, ${isAnswered ? 'đã trả lời' : 'chưa trả lời'}${isCurrent ? ', đang xem' : ''}`;
                
                return (
                  <button
                    key={q.id}
                    aria-label={ariaLabel}
                    title={ariaLabel}
                    onClick={() => onQuestionClick(q.id)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${stateClass} ${focusClass}`}
                  >
                    {q.displayNumber}
                  </button>
                );
              })}
              {idx < Object.keys(groups).length - 1 && (
                <div className="w-px h-6 bg-gray-300 ml-4"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
