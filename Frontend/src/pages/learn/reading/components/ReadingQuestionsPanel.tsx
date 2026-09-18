import React from 'react';
import { QuestionGroupRenderer } from './QuestionGroupRenderer';

interface ReadingQuestionsPanelProps {
  questionGroups: any[];
  answers: Record<number, string>;
  onAnswerChange: (questionId: number, answer: string) => void;
  onQuestionFocus: (questionId: number) => void;
  currentQuestionId: number | null;
  questionRefs: React.MutableRefObject<Record<number, HTMLDivElement | null>>;
}

export const ReadingQuestionsPanel: React.FC<ReadingQuestionsPanelProps> = ({
  questionGroups,
  answers,
  onAnswerChange,
  onQuestionFocus,
  currentQuestionId,
  questionRefs
}) => {
  return (
    <div className="space-y-12 pb-32">
      {questionGroups.map((group, idx) => (
        <QuestionGroupRenderer 
          key={group.id} 
          group={group} 
          index={idx}
          answers={answers}
          onAnswerChange={onAnswerChange}
          onQuestionFocus={onQuestionFocus}
          currentQuestionId={currentQuestionId}
          questionRefs={questionRefs}
        />
      ))}
    </div>
  );
};
