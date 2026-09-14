import React, { useState, useEffect } from 'react';
import type { StudentQuestionDto, StudentAnswerSubmissionDto } from '../../../services/testSession';

interface Props {
  questions: StudentQuestionDto[];
  activityType: string;
  onComplete: (answers: StudentAnswerSubmissionDto[]) => void;
  mode?: 'PRACTICE' | 'TEST';
}

interface MeaningChip {
  id: string; // vocabularyItemId
  text: string;
  theme: string;
}

const PASTEL_THEMES = [
  'bg-blue-50 border-blue-200 text-blue-900',
  'bg-purple-50 border-purple-200 text-purple-900',
  'bg-yellow-50 border-yellow-200 text-yellow-900',
  'bg-pink-50 border-pink-200 text-pink-900',
  'bg-emerald-50 border-emerald-200 text-emerald-900',
  'bg-orange-50 border-orange-200 text-orange-900',
  'bg-cyan-50 border-cyan-200 text-cyan-900'
];

export const MatchWordMeaningActivity: React.FC<Props> = ({ questions, activityType, onComplete, mode = 'TEST' }) => {
  const [unresolvedIds, setUnresolvedIds] = useState<string[]>(questions.map(q => q.id));
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [firstAttempts, setFirstAttempts] = useState<Record<string, string>>({});
  
  const [totalWrongAttempts, setTotalWrongAttempts] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);

  const [roundQuestions, setRoundQuestions] = useState<StudentQuestionDto[]>([]);
  const [meaningPool, setMeaningPool] = useState<MeaningChip[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({}); // questionId -> meaningId
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedMeaningId, setSelectedMeaningId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize first round
  useEffect(() => {
    if (questions.length > 0 && roundQuestions.length === 0 && !isFinished) {
      startNextRound(unresolvedIds);
    }
  }, [questions]);

  const startNextRound = (currentUnresolved: string[]) => {
    if (currentUnresolved.length === 0) {
      setIsFinished(true);
      return;
    }

    const shuffled = [...currentUnresolved].sort(() => Math.random() - 0.5);
    const selectedQIds = shuffled.slice(0, 5);
    const currentQs = selectedQIds.map(id => questions.find(q => q.id === id)!);

    const correctMeanings: MeaningChip[] = currentQs.map((q, i) => ({
      id: q.id,
      text: q.targetMeaning || 'N/A',
      theme: PASTEL_THEMES[i % PASTEL_THEMES.length]
    }));

    const availableDistractors = currentUnresolved.filter(id => !selectedQIds.includes(id));
    const shuffledDistractors = [...availableDistractors].sort(() => Math.random() - 0.5);
    const needed = Math.max(0, 10 - correctMeanings.length);
    const selectedDistractorIds = shuffledDistractors.slice(0, needed);

    const distractorMeanings: MeaningChip[] = selectedDistractorIds.map((id, i) => {
      const q = questions.find(q => q.id === id)!;
      return {
        id: q.id,
        text: q.targetMeaning || 'N/A',
        theme: PASTEL_THEMES[(correctMeanings.length + i) % PASTEL_THEMES.length]
      };
    });

    let pool = [...correctMeanings, ...distractorMeanings];
    pool = pool.sort(() => Math.random() - 0.5);

    setRoundQuestions(currentQs);
    setMeaningPool(pool);
    setAssignments({});
    setIsSubmitted(false);
    setSelectedMeaningId(null);
  };

  const handleAssign = (questionId: string, meaningId: string) => {
    if (isSubmitted) return;
    
    // If the meaning is already assigned to another question in this round, remove it from there
    const newAssignments = { ...assignments };
    for (const [qId, mId] of Object.entries(newAssignments)) {
      if (mId === meaningId) {
        delete newAssignments[qId];
      }
    }
    
    newAssignments[questionId] = meaningId;
    setAssignments(newAssignments);
    setSelectedMeaningId(null);
  };

  const handleRemoveAssignment = (questionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSubmitted) return;
    const newAssignments = { ...assignments };
    delete newAssignments[questionId];
    setAssignments(newAssignments);
  };

  const handleSubmitRound = () => {
    if (isSubmitted) return;
    
    setIsSubmitted(true);
    setRoundsPlayed(prev => prev + 1);

    const newCompleted = new Set(completedIds);
    let newWrong = totalWrongAttempts;
    const newFirstAttempts = { ...firstAttempts };

    roundQuestions.forEach(q => {
      const assignedMeaningId = assignments[q.id];
      const isCorrect = assignedMeaningId === q.id;

      // Record first attempt
      if (!newFirstAttempts[q.id]) {
        newFirstAttempts[q.id] = assignedMeaningId || ''; // '' if unanswered
      }

      if (isCorrect) {
        newCompleted.add(q.id);
      } else {
        newWrong++;
      }
    });

    setCompletedIds(newCompleted);
    setTotalWrongAttempts(newWrong);
    setFirstAttempts(newFirstAttempts);
  };

  const handleNextRound = () => {
    const remaining = unresolvedIds.filter(id => !completedIds.has(id));
    setUnresolvedIds(remaining);
    startNextRound(remaining);
  };

  const handleFinish = () => {
    // Generate answers array using first attempts, mapping any unanswered to ''
    const finalAnswers: StudentAnswerSubmissionDto[] = questions.map(q => ({
      questionId: q.id,
      targetVocabularyItemId: parseInt(q.id, 10) || 0,
      answerValue: firstAttempts[q.id] || '',
      technicalFailure: false
    }));
    onComplete(finalAnswers);
  };

  if (isFinished) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Bạn đã ghép xong tất cả các từ!</h2>
        <div className="bg-gray-50 rounded-xl p-6 w-full max-w-sm mb-8 border border-gray-100">
          <div className="flex justify-between mb-3">
            <span className="text-gray-600 font-medium">Tổng số từ:</span>
            <span className="font-bold text-gray-900">{questions.length}</span>
          </div>
          <div className="flex justify-between mb-3">
            <span className="text-gray-600 font-medium">Số lượt đã chơi:</span>
            <span className="font-bold text-gray-900">{roundsPlayed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">Tổng số lỗi sai:</span>
            <span className="font-bold text-red-600">{totalWrongAttempts}</span>
          </div>
        </div>
        <button 
          onClick={handleFinish}
          className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-sm"
        >
          Xem kết quả
        </button>
      </div>
    );
  }

  // Calculate round stats
  let correctInRound = 0;
  let wrongInRound = 0;
  if (isSubmitted) {
    roundQuestions.forEach(q => {
      const assigned = assignments[q.id];
      if (assigned === q.id) correctInRound++;
      else wrongInRound++;
    });
  }

  const allAssigned = roundQuestions.every(q => assignments[q.id]);
  const assignedMeaningIds = Object.values(assignments);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center animate-in fade-in duration-300 py-4">
      
      {/* Progress & Header */}
      <div className="w-full mb-6 px-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">
            Tiến độ: {completedIds.size} / {questions.length} từ
          </span>
          <span className="text-sm font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-md">
            Lỗi sai: {totalWrongAttempts}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-500" 
            style={{ width: `${(completedIds.size / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Word Slots */}
      <div className="w-full grid gap-4 mb-8">
        {roundQuestions.map(q => {
          const assignedId = assignments[q.id];
          const assignedMeaning = assignedId ? meaningPool.find(m => m.id === assignedId) : null;
          
          let slotStateClass = "border-gray-200 bg-gray-50 hover:bg-gray-100";
          if (assignedId) slotStateClass = "border-blue-200 bg-blue-50";
          
          if (isSubmitted) {
            if (assignedId === q.id) slotStateClass = "border-green-300 bg-green-50 ring-2 ring-green-500/20";
            else slotStateClass = "border-red-300 bg-red-50 ring-2 ring-red-500/20";
          }

          return (
            <div key={q.id} className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="sm:w-1/3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm font-bold text-lg text-gray-800 text-center sm:text-left flex-shrink-0">
                {q.targetWord}
              </div>
              
              <div 
                className={`flex-grow min-h-[64px] border-2 border-dashed rounded-xl flex items-center justify-center p-2 transition-all cursor-pointer ${slotStateClass} ${selectedMeaningId && !isSubmitted ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                onClick={() => {
                  if (selectedMeaningId) {
                    handleAssign(q.id, selectedMeaningId);
                  }
                }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  const mId = e.dataTransfer.getData("text/plain");
                  if (mId) handleAssign(q.id, mId);
                }}
              >
                {!assignedMeaning && !isSubmitted && (
                  <span className="text-gray-400 font-medium text-sm">chạm hoặc kéo thả nghĩa vào đây</span>
                )}
                
                {assignedMeaning && (
                  <div className={`relative w-full text-center py-2 px-8 rounded-lg font-bold shadow-sm ${
                    isSubmitted 
                      ? (assignedId === q.id ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                      : assignedMeaning.theme
                  }`}>
                    {assignedMeaning.text}
                    
                    {!isSubmitted && (
                      <button 
                        onClick={(e) => handleRemoveAssignment(q.id, e)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/50 hover:bg-white flex items-center justify-center text-gray-600 transition-colors"
                        aria-label="Gỡ nghĩa"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}
                
                {!assignedMeaning && isSubmitted && (
                  <span className="text-red-500 font-bold text-sm">Chưa chọn đáp án</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Meaning Pool */}
      <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8">
        <h3 className="text-sm font-bold text-gray-500 mb-4 text-center uppercase tracking-wide">Kho nghĩa</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {meaningPool.map(m => {
            const isAssigned = assignedMeaningIds.includes(m.id);
            if (isAssigned) return null; // Hide assigned meanings

            const isSelected = selectedMeaningId === m.id;

            return (
              <div 
                key={m.id}
                draggable={!isSubmitted}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", m.id);
                  setSelectedMeaningId(m.id);
                }}
                onClick={() => {
                  if (isSubmitted) return;
                  if (isSelected) setSelectedMeaningId(null);
                  else setSelectedMeaningId(m.id);
                }}
                className={`px-4 py-2.5 rounded-xl font-semibold border-2 cursor-pointer transition-all shadow-sm select-none ${m.theme} ${
                  isSelected ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : 'hover:-translate-y-0.5 hover:shadow-md'
                } ${isSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {m.text}
              </div>
            );
          })}
          {meaningPool.filter(m => !assignedMeaningIds.includes(m.id)).length === 0 && (
            <span className="text-gray-400 italic text-sm py-2">Đã dùng hết nghĩa trong kho</span>
          )}
        </div>
      </div>

      {/* Action Area */}
      <div className="w-full flex flex-col items-center border-t border-gray-100 pt-6">
        {isSubmitted && (
          <div className="mb-6 flex gap-6 text-center">
            <div>
              <div className="text-3xl font-black text-green-600">{correctInRound}</div>
              <div className="text-sm font-bold text-gray-500">Đúng</div>
            </div>
            <div>
              <div className="text-3xl font-black text-red-500">{wrongInRound}</div>
              <div className="text-sm font-bold text-gray-500">Sai</div>
            </div>
          </div>
        )}

        {!isSubmitted ? (
          <button
            onClick={handleSubmitRound}
            disabled={!allAssigned}
            className={`px-8 py-3 rounded-xl font-bold transition-all shadow-sm ${
              allAssigned 
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Nộp lượt
          </button>
        ) : (
          <button
            onClick={handleNextRound}
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-sm hover:-translate-y-0.5"
          >
            {unresolvedIds.filter(id => !completedIds.has(id)).length === 0 ? 'Hoàn tất' : 'Qua lượt tiếp theo'}
          </button>
        )}
      </div>
    </div>
  );
};
