import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { StudentActivityRenderer } from '../test/StudentActivityRenderer';
import { CurrentStageDto, StudentAnswerSubmissionDto } from '../../../services/testSession';
import { getCategoryFromType, getAccentColors } from './ColorMapping';

interface PracticeActivityViewProps {
  vocabularySetId: number;
  activityType: string;
  activityName: string;
}

export const PracticeActivityView: React.FC<PracticeActivityViewProps> = ({ vocabularySetId, activityType, activityName }) => {
  const [stage, setStage] = useState<CurrentStageDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null);

  const fetchPracticeSession = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.get<CurrentStageDto>(`/learn/vocabulary/${vocabularySetId}/practice/generate?type=${activityType}`);
      setStage(res);
    } catch (err: any) {
      setError(err.message || 'Không thể tạo hoạt động này lúc này.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPracticeSession();
  }, [vocabularySetId, activityType]);

  const handleComplete = (answers: StudentAnswerSubmissionDto[]) => {
    if (!stage) return;
    
    let correctCount = 0;
    
    answers.forEach(ans => {
      const q = stage.questions.find(x => x.id === ans.questionId);
      if (!q) return;

      // In practice mode, q.id is the actual targetVocabularyItemId (unprotected).
      // ans.answerValue contains the submitted ID (or typed word depending on activity type).
      
      let isCorrect = false;
      
      // For choice/matching activities, answerValue is the ID.
      if (['WORD_TO_MEANING', 'MEANING_TO_WORD', 'LISTEN_TO_WORD', 'LISTEN_TO_MEANING', 'MATCH_WORD_MEANING'].includes(activityType)) {
        isCorrect = ans.answerValue === q.id;
      } else {
        // For typing activities, compare text with TargetWord or TargetMeaning
        const submittedText = ans.answerValue.trim().toLowerCase();
        
        if (activityType === 'WORD_TO_TYPE_MEANING') {
          // Compare with TargetMeaning
          const target = q.targetMeaning?.trim().toLowerCase() || '';
          isCorrect = target === submittedText;
        } else {
          // Compare with TargetWord
          const target = q.targetWord?.trim().toLowerCase() || '';
          isCorrect = target === submittedText;
        }
      }

      if (isCorrect) correctCount++;
    });

    setResult({
      correct: correctCount,
      total: stage.questions.length
    });
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 text-center animate-in fade-in">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl mb-3">⚠️</div>
        <h3 className="text-base font-bold text-gray-900 mb-1">{error}</h3>
        <button 
          onClick={fetchPracticeSession}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (result) {
    const score = Math.round((result.correct / result.total) * 100);
    return (
      <div className="w-full max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
          🎉
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hoàn thành!</h2>
        <p className="text-gray-500 font-medium mb-6">{activityName}</p>
        
        <div className="flex flex-col items-center justify-center mb-8">
          <span className="text-5xl font-black text-green-600 mb-2">{score}%</span>
          <span className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            {result.correct} / {result.total} đúng
          </span>
        </div>

        <button 
          onClick={fetchPracticeSession}
          className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-sm transition-all hover:-translate-y-0.5"
        >
          Làm lại hoạt động
        </button>
      </div>
    );
  }

  const category = getCategoryFromType(activityType);
  const colors = getAccentColors(category);

  return (
    <div className={`w-full animate-in fade-in rounded-2xl overflow-hidden border ${colors.border}`}>
      <div className={`w-full px-4 py-3 flex items-center justify-between border-b ${colors.base} ${colors.border}`}>
        <h2 className={`text-sm font-bold uppercase tracking-wider ${colors.text}`}>{activityName}</h2>
      </div>
      <div className="p-4 bg-white">
        {stage && <StudentActivityRenderer stage={stage} onComplete={handleComplete} mode="PRACTICE" />}
      </div>
    </div>
  );
};
