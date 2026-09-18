import React from 'react';
import { QuestionRenderer } from './QuestionRenderer';

interface QuestionGroupRendererProps {
  group: any;
  index: number;
  answers: Record<number, string>;
  onAnswerChange: (questionId: number, answer: string) => void;
  onQuestionFocus: (questionId: number) => void;
  currentQuestionId: number | null;
  questionRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
  isReview?: boolean;
  reviewAnswers?: any[];
}

export const QuestionGroupRenderer: React.FC<QuestionGroupRendererProps> = ({
  group,
  index,
  answers,
  onAnswerChange,
  onQuestionFocus,
  currentQuestionId,
  questionRefs,
  isReview,
  reviewAnswers
}) => {
  const getStructuralColor = () => {
    const type = group.academicQuestionType || '';
    if (type.includes('MATCHING_INFORMATION') || type.includes('MATCHING_HEADING')) return 'bg-blue-50/80 border-blue-200 text-blue-900';
    if (type.includes('MATCHING_PEOPLE') || type.includes('MATCHING_FEATURE')) return 'bg-purple-50/80 border-purple-200 text-purple-900';
    if (type.includes('SUMMARY_COMPLETION')) return 'bg-orange-50/80 border-orange-200 text-orange-900';
    
    const colors = [
      'bg-blue-50/80 border-blue-200 text-blue-900',
      'bg-purple-50/80 border-purple-200 text-purple-900',
      'bg-orange-50/80 border-orange-200 text-orange-900',
      'bg-teal-50/80 border-teal-200 text-teal-900'
    ];
    return colors[index % colors.length];
  };

  const structuralClass = getStructuralColor();
  const isSummary = group.academicQuestionType?.includes('SUMMARY_COMPLETION');

  return (
    <div className={`rounded-2xl border-2 p-6 transition-all ${structuralClass}`}>
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2 uppercase tracking-wide opacity-100">
          {group.academicQuestionType?.replace(/_/g, ' ') || 'QUESTIONS'}
        </h3>
        {group.instruction && (
          <div className="font-medium opacity-90 text-gray-800 mb-4" dangerouslySetInnerHTML={{ __html: group.instruction }} />
        )}
      </div>

      <div className={isSummary ? "prose prose-slate max-w-none text-gray-800 leading-loose text-lg bg-white/60 p-6 rounded-xl border border-white/40" : "space-y-6"}>
        {group.questions?.map((q: any) => {
          const revRes = isReview && reviewAnswers ? reviewAnswers.find(a => a.questionId === q.id) : null;
          return (
            <QuestionRenderer 
              key={q.id}
              question={q}
              group={group}
              answer={answers[q.id] || ''}
              onAnswerChange={(ans) => onAnswerChange(q.id, ans)}
              onFocus={() => onQuestionFocus(q.id)}
              isCurrent={currentQuestionId === q.id}
              questionRefs={questionRefs}
              isSummary={isSummary}
              isReview={isReview}
              reviewResult={revRes}
            />
          );
        })}
      </div>
    </div>
  );
};
