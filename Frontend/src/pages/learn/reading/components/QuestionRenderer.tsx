import React from 'react';

interface QuestionRendererProps {
  question: any;
  group: any;
  answer: string;
  onAnswerChange: (ans: string) => void;
  onFocus: () => void;
  isCurrent: boolean;
  questionRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  isSummary?: boolean;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  group,
  answer,
  onAnswerChange,
  onFocus,
  isCurrent,
  questionRefs,
  isSummary
}) => {
  const isSelect = group.interactionType === 'SHORT_LETTER_RESPONSE';
  const isYesNo = group.interactionType === 'YES_NO_NOT_GIVEN';
  const isInline = group.interactionType === 'INLINE_GAP' || isSummary;
  
  // Extract options if domain is provided e.g. "A-G"
  let options: string[] = [];
  if (isSelect && group.allowedAnswerDomain) {
    const parts = group.allowedAnswerDomain.split('-');
    if (parts.length === 2) {
      const start = parts[0].charCodeAt(0);
      const end = parts[1].charCodeAt(0);
      for (let i = start; i <= end; i++) {
        options.push(String.fromCharCode(i));
      }
    }
  } else if (isYesNo) {
    options = ['TRUE', 'FALSE', 'NOT GIVEN', 'YES', 'NO'];
  }
  
  const currentClass = isCurrent ? 'ring-2 ring-indigo-400 bg-indigo-50/50 shadow-sm border-indigo-200' : 'bg-white/90 border-transparent';

  // INLINE SUMMARY RENDERER
  if (isInline) {
    return (
      <span 
        ref={el => questionRefs.current[question.id] = el}
        className={`inline-flex items-center mx-1 transition-all rounded-md px-1 ${isCurrent ? 'ring-2 ring-indigo-400 bg-indigo-50' : ''}`}
        onFocusCapture={onFocus}
        onClick={onFocus}
      >
        <strong className="mr-2 text-sm text-gray-500">{question.displayNumber}</strong>
        <input 
          type="text"
          className="border-b-2 border-gray-400 bg-transparent focus:border-indigo-600 focus:outline-none px-2 py-1 min-w-[120px] text-center font-bold text-gray-800 placeholder-gray-300"
          value={answer}
          onChange={e => onAnswerChange(e.target.value)}
          placeholder="[________]"
        />
      </span>
    );
  }

  // STANDARD BLOCK RENDERER
  return (
    <div 
      ref={el => questionRefs.current[question.id] = el}
      className={`p-4 rounded-xl border transition-all duration-200 ${currentClass}`}
      onFocusCapture={onFocus}
      onClick={onFocus}
    >
      <div className="flex gap-4">
        <div className="font-bold text-gray-700 w-8 flex-shrink-0 text-right mt-1.5">{question.displayNumber}.</div>
        <div className="flex-1">
          {question.content && (
            <div className="text-gray-800 mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: question.content }} />
          )}
          
          {(isSelect || isYesNo) && options.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {options.map(opt => (
                <button
                  key={opt}
                  onClick={() => onAnswerChange(opt)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm border-2 transition-colors ${
                    answer.toUpperCase() === opt 
                      ? 'bg-brand-600 border-brand-600 text-white shadow-md' 
                      : 'bg-white border-gray-300 text-gray-700 hover:border-brand-400 hover:bg-brand-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
              {answer && !options.includes(answer.toUpperCase()) && (
                <button onClick={() => onAnswerChange('')} className="px-3 py-2 text-red-500 text-sm hover:bg-red-50 rounded-lg ml-2">
                  Bỏ chọn
                </button>
              )}
            </div>
          ) : (
            <input 
              type="text"
              className="w-full md:w-2/3 border-2 border-gray-300 rounded-lg p-3 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 outline-none font-bold text-gray-800"
              value={answer}
              onChange={e => onAnswerChange(e.target.value)}
              placeholder="Nhập câu trả lời..."
            />
          )}
        </div>
      </div>
    </div>
  );
};
