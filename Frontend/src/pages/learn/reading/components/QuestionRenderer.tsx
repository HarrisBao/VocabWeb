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
  isReview?: boolean;
  reviewResult?: any;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  group,
  answer,
  onAnswerChange,
  onFocus,
  isCurrent,
  questionRefs,
  isSummary,
  isReview,
  reviewResult
}) => {
  const isSelect = group.interactionType === 'SHORT_LETTER_RESPONSE';
  const isYesNo = group.interactionType === 'YES_NO_NOT_GIVEN';
  const isInline = group.interactionType === 'INLINE_GAP' || isSummary;
  
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
  
  const currentClass = isCurrent ? 'ring-2 ring-indigo-400 shadow-sm border-indigo-200' : 'border-transparent';
  const baseContainerClass = isCurrent ? 'bg-indigo-50/50' : 'bg-white/90';

  // --- REVIEW RENDERERS ---
  if (isReview && reviewResult) {
    const isBlank = !reviewResult.studentAnswer || reviewResult.studentAnswer.trim() === '';
    const isCorrect = reviewResult.isCorrect;
    const correctAns = reviewResult.correctAnswer;
    
    if (isInline) {
      let gapClass = "border-b-2 border-amber-400 bg-amber-100/50 text-amber-900"; // Blank
      if (!isBlank) {
         gapClass = isCorrect ? "border-b-2 border-green-500 bg-green-100 text-green-900" : "border-b-2 border-red-500 bg-red-100 text-red-900";
      }
      return (
        <span className="inline-flex items-center mx-1 group/inline relative" onFocusCapture={onFocus} onClick={onFocus} ref={el => questionRefs.current[question.id] = el}>
          <strong className="mr-1 text-xs text-gray-500">{question.displayNumber}</strong>
          <span className={px-3 py-1 font-bold rounded-md  }>
            {isBlank ? 'Chưa trả lời' : reviewResult.studentAnswer}
          </span>
          {(!isCorrect || isBlank) && (
            <span className="ml-2 inline-flex items-center">
              <span className="text-xs text-gray-500 mr-1">Đáp án đúng:</span>
              <span className="px-2 py-1 font-bold text-sm bg-green-100 text-green-900 border border-green-300 rounded-md">
                {correctAns}
              </span>
            </span>
          )}
        </span>
      );
    }
    
    // Block review
    return (
      <div ref={el => questionRefs.current[question.id] = el} className={p-4 rounded-xl border transition-all duration-200  } onClick={onFocus}>
        <div className="flex gap-4">
          <div className="font-bold text-gray-700 w-8 flex-shrink-0 text-right mt-1.5">{question.displayNumber}.</div>
          <div className="flex-1">
            {question.content && <div className="text-gray-800 mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: question.content }} />}
            <div className="flex flex-col space-y-3 mt-4">
               <div>
                 <span className="text-sm text-gray-500 font-medium block mb-1">Đáp án của bạn:</span>
                 {isBlank ? (
                   <span className="inline-block px-4 py-2 bg-amber-100 text-amber-900 font-bold border border-amber-300 rounded-lg">Chưa trả lời</span>
                 ) : (
                   <span className={inline-block px-4 py-2 font-bold border rounded-lg }>
                     {reviewResult.studentAnswer}
                   </span>
                 )}
               </div>
               
               {(!isCorrect || isBlank) && (
                 <div>
                   <span className="text-sm text-gray-500 font-medium block mb-1">Đáp án đúng:</span>
                   <span className="inline-block px-4 py-2 font-bold border rounded-lg bg-green-100 text-green-900 border-green-300">
                     {correctAns}
                   </span>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- ATTEMPT RENDERERS ---
  if (isInline) {
    return (
      <span 
        ref={el => questionRefs.current[question.id] = el}
        className={inline-flex items-center mx-1 transition-all rounded-md px-1 }
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
          disabled={isReview}
        />
      </span>
    );
  }

  return (
    <div 
      ref={el => questionRefs.current[question.id] = el}
      className={p-4 rounded-xl border transition-all duration-200  }
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
                  disabled={isReview}
                  className={px-4 py-2 rounded-lg font-bold text-sm border-2 transition-colors }
                >
                  {opt}
                </button>
              ))}
              {answer && !options.includes(answer.toUpperCase()) && !isReview && (
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
              disabled={isReview}
            />
          )}
        </div>
      </div>
    </div>
  );
};
