import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { Spinner } from '../../../components/ui/Spinner';
import { ReadingAttemptHeader } from './components/ReadingAttemptHeader';
import { ReadingPassagePanel } from './components/ReadingPassagePanel';
import { ReadingQuestionsPanel } from './components/ReadingQuestionsPanel';
import { QuestionNavigator } from './components/QuestionNavigator';
import { useAssessmentEnvironmentCheck } from '../../../components/assessment/useAssessmentEnvironmentCheck';
import { EnvironmentWarningModal } from '../../../components/assessment/EnvironmentWarningModal';

export const ReadingAttemptWorkspace: React.FC<{ isReview?: boolean }> = ({ isReview }) => {
  const { id, readingId, attemptId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  // Review specific
  const [reviewResult, setReviewResult] = useState<any>(null);

  // Timer & State
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [allowedDuration, setAllowedDuration] = useState<number>(0);
  const [elapsed, setElapsed] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SAVED' | 'ERROR'>('IDLE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
    const [activeAttemptId, setActiveAttemptId] = useState<string | undefined>(attemptId);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [mobileTab, setMobileTab] = useState<'PASSAGE' | 'QUESTIONS'>('QUESTIONS');
  
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const saveTimeoutRef = useRef<any>(null);

  const { isClean, detectionResult, runCheck } = useAssessmentEnvironmentCheck('HOMEWORK');

  
  useEffect(() => {
    if (isReview) return;
    const handlePopState = (event) => {
      window.history.pushState(null, '', window.location.href);
      setShowExitConfirm(true);
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isReview]);

  useEffect(() => {
    if (isReview) {
      fetchDataAndStart();
      return;
    }

    const result = runCheck();
    if (result.status === 'CLEAN') {
      fetchDataAndStart();
    }
  }, [readingId, id, attemptId, isReview]);

  useEffect(() => {
    if (isReview || !startedAt || isDiscarding) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diffSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
      setElapsed(diffSeconds > 0 ? diffSeconds : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, isReview]);

  const fetchDataAndStart = async () => {
    try {
      setLoading(true);
      
      if (isReview) {
        // Fetch snapshot and result for review
        const res = await api.get(`/learn/class/${id}/reading/${readingId}/attempts/${attemptId}`);
        setReviewResult(res);
        setAssignment({
          title: "Xem lại bài làm", // We might not have the original title in the attempt, but we can fetch it if needed. Actually we'll fetch the assignment title just in case.
          passage: res.passage,
          questionGroups: res.questionGroups
        });
        
        // Load original assignment just to get the title
        try {
           const liveRes = await api.get(`/learn/class/${id}/reading/${readingId}`);
           setAssignment((prev: any) => ({ ...prev, title: liveRes.title }));
        } catch(e) {}
        
        // Restore answers from the submitted attempt
        const finalAnswers: Record<number, string> = {};
        if (res.answers) {
          res.answers.forEach((a: any) => {
            finalAnswers[a.questionId] = a.studentAnswer;
          });
        }
        setAnswers(finalAnswers);
        
      } else {
        // Normal Attempt Mode
        const res = await api.get(`/learn/class/${id}/reading/${readingId}`);
        setAssignment(res);
        
        const startRes = await api.post(`/learn/class/${id}/reading/${readingId}/start`, {});
        setActiveAttemptId(startRes.attemptId?.toString());
        setStartedAt(new Date(startRes.startedAt));
        setAllowedDuration(startRes.allowedDurationSecondsSnapshot);
        
        if (res.draftAnswers) {
          setAnswers(res.draftAnswers);
        }
      }
      
      setLoading(false);
    } catch (e: any) {
      alert("Không thể tải bài làm: " + e.message);
      navigate(`/student/classes/${id}`);
    }
  };

    const handleExitClick = () => {
    setShowExitConfirm(true);
  };

  const handleConfirmExit = async () => {
    // 1. block further editing & stop autosave
    setIsDiscarding(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaveStatus('SAVED'); // fake success to clear errors

    // 2. perform discard
    try {
      await api.delete(`/learn/class/${id}/reading/${readingId}/attempts/${activeAttemptId || attemptId}/discard`);
    } catch (e) {
      console.error('Failed to discard attempt', e);
    }
    
    // 3. navigate away
    navigate(`/student/classes/${id}?tab=reading`);
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    if (isReview) return; // Prevent mutation during review
    
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    
    // Autosave with debounce
    setSaveStatus('SAVING');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await api.put(`/learn/class/${id}/reading/${readingId}/autosave`, newAnswers);
        setSaveStatus('SAVED');
      } catch (e) {
        setSaveStatus('ERROR');
      }
    }, 1000);
  };

  const handleQuestionFocus = (questionId: number) => {
    setCurrentQuestionId(questionId);
  };

  const handleNavigatorClick = (questionId: number) => {
    setCurrentQuestionId(questionId);
    setMobileTab('QUESTIONS');
    
    // Scroll question into view
    const el = questionRefs.current[questionId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSubmit = async () => {
    if (isReview) return;
    
    const total = assignment?.questionGroups?.reduce((acc: number, g: any) => acc + g.questions.length, 0) || 0;
    const answeredCount = Object.values(answers).filter(a => a.trim() !== '').length;
    
    if (answeredCount < total) {
      if (!window.confirm(`Bạn vẫn còn ${total - answeredCount} câu chưa trả lời. Bạn có chắc muốn nộp bài?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Bạn đã hoàn thành tất cả câu hỏi. Bạn có chắc muốn nộp bài?`)) {
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const res = await api.post(`/learn/class/${id}/reading/${readingId}/submit`, answers);
      alert('Đã nộp bài thành công!');
      navigate(`/student/classes/${id}/reading/${readingId}/attempts/${res.attemptId}/result`);
    } catch (e: any) {
      alert('Lỗi khi nộp bài: ' + e.message);
      setIsSubmitting(false);
    }
  };

  if (!isClean && !isReview && detectionResult) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <EnvironmentWarningModal 
          mode="HOMEWORK" 
          result={detectionResult} 
          onRetry={() => {
            const res = runCheck();
            if (res.status === 'CLEAN') {
              fetchDataAndStart();
            }
          }} 
        />
      </div>
    );
  }

  if (loading || !assignment) {
    return <div className="h-screen flex items-center justify-center bg-gray-50"><Spinner /></div>;
  }

  // Timer logic for Attempt vs Review
  let timeStr = "";
  let isOvertime = false;
  
  if (isReview && reviewResult) {
    const timeSpent = reviewResult.timeSpentSeconds || 0;
    const allowed = reviewResult.allowedDurationSecondsSnapshot || 0;
    isOvertime = timeSpent > allowed;
    const displaySecs = isOvertime ? timeSpent - allowed : timeSpent;
    const m = Math.floor(displaySecs / 60).toString().padStart(2, '0');
    const s = (displaySecs % 60).toString().padStart(2, '0');
    timeStr = `${m}:${s}`;
  } else {
    const remainingSeconds = allowedDuration - elapsed;
    isOvertime = remainingSeconds < 0;
    const absRemaining = Math.abs(remainingSeconds);
    const m = Math.floor(absRemaining / 60).toString().padStart(2, '0');
    const s = (absRemaining % 60).toString().padStart(2, '0');
    timeStr = `${m}:${s}`;
  }

  const allQuestions = assignment.questionGroups?.flatMap((g: any) => 
    g.questions.map((q: any) => ({ ...q, groupId: g.id }))
  ) || [];
  
  const answeredCount = Object.values(answers).filter(a => a.trim() !== '').length;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 font-sans">
      <ReadingAttemptHeader 
        title={assignment.title}
        classId={id}
        readingId={readingId}
        attemptId={activeAttemptId || attemptId}
        answeredCount={answeredCount}
        totalQuestions={allQuestions.length}
        timeRemainingStr={timeStr}
        isOvertime={isOvertime}
        saveStatus={saveStatus}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isReview={isReview}
      />

      {/* MOBILE TABS */}
      <div className="md:hidden flex border-b bg-white shrink-0">
        <button 
          onClick={() => setMobileTab('PASSAGE')} 
          className={`flex-1 py-3 font-bold text-sm ${mobileTab === 'PASSAGE' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500'}`}
        >
          Đoạn văn
        </button>
        <button 
          onClick={() => setMobileTab('QUESTIONS')} 
          className={`flex-1 py-3 font-bold text-sm ${mobileTab === 'QUESTIONS' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-gray-500'}`}
        >
          Câu hỏi
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* PASSAGE PANEL */}
        <div className={`md:flex md:w-[55%] overflow-y-auto p-4 md:p-8 lg:p-12 bg-white border-r border-gray-200 shadow-[inset_-10px_0_15px_-15px_rgba(0,0,0,0.1)] ${mobileTab === 'PASSAGE' ? 'block w-full' : 'hidden'}`}>
          <ReadingPassagePanel htmlContent={assignment.passage} />
        </div>
        
        {/* QUESTIONS PANEL */}
        <div className={`md:flex md:w-[45%] overflow-y-auto p-4 md:p-8 lg:p-12 relative flex-col bg-[#F9FAFB] ${mobileTab === 'QUESTIONS' ? 'flex w-full' : 'hidden'}`}>
          <ReadingQuestionsPanel 
            questionGroups={assignment.questionGroups || []}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onQuestionFocus={handleQuestionFocus}
            currentQuestionId={currentQuestionId}
            questionRefs={questionRefs}
            isReview={isReview}
            reviewAnswers={reviewResult?.answers || []}
          />
        </div>
      </div>

      <QuestionNavigator 
        questions={allQuestions}
        answers={answers}
        currentQuestionId={currentQuestionId}
        onQuestionClick={handleNavigatorClick}
        isReview={isReview}
        reviewAnswers={reviewResult?.answers || []}
      />
    </div>
  );
};
