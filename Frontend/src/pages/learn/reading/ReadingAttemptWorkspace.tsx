import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { Spinner } from '../../../components/ui/Spinner';
import { ReadingAttemptHeader } from './components/ReadingAttemptHeader';
import { ReadingPassagePanel } from './components/ReadingPassagePanel';
import { ReadingQuestionsPanel } from './components/ReadingQuestionsPanel';
import { QuestionNavigator } from './components/QuestionNavigator';

export const ReadingAttemptWorkspace: React.FC = () => {
  const { id, readingId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  // Timer & State
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [allowedDuration, setAllowedDuration] = useState<number>(0);
  const [elapsed, setElapsed] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SAVED' | 'ERROR'>('IDLE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [mobileTab, setMobileTab] = useState<'PASSAGE' | 'QUESTIONS'>('QUESTIONS');
  
  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const saveTimeoutRef = useRef<any>(null);

  useEffect(() => {
    fetchDataAndStart();
  }, [readingId, id]);

  useEffect(() => {
    if (!startedAt) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diffSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
      setElapsed(diffSeconds > 0 ? diffSeconds : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const fetchDataAndStart = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/learn/class/${id}/reading/${readingId}`);
      setAssignment(res);
      
      const startRes = await api.post(`/learn/class/${id}/reading/${readingId}/start`, {});
      setStartedAt(new Date(startRes.startedAt));
      setAllowedDuration(startRes.allowedDurationSecondsSnapshot);
      
      if (res.draftAnswers) {
        setAnswers(res.draftAnswers);
      }
      
      setLoading(false);
    } catch (e: any) {
      alert("Không thể tải bài làm: " + e.message);
      navigate(`/learn/classes/${id}`);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
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
      await api.post(`/learn/class/${id}/reading/${readingId}/submit`, answers);
      alert('Đã nộp bài thành công!');
      navigate(`/learn/classes/${id}`);
    } catch (e: any) {
      alert('Lỗi khi nộp bài: ' + e.message);
      setIsSubmitting(false);
    }
  };

  if (loading || !assignment) {
    return <div className="h-screen flex items-center justify-center bg-gray-50"><Spinner /></div>;
  }

  // Calculate timer
  const remainingSeconds = allowedDuration - elapsed;
  const isOvertime = remainingSeconds < 0;
  const absRemaining = Math.abs(remainingSeconds);
  const m = Math.floor(absRemaining / 60).toString().padStart(2, '0');
  const s = (absRemaining % 60).toString().padStart(2, '0');
  const timeStr = `${m}:${s}`;

  const allQuestions = assignment.questionGroups.flatMap((g: any) => 
    g.questions.map((q: any) => ({ ...q, groupId: g.id }))
  );
  
  const answeredCount = Object.values(answers).filter(a => a.trim() !== '').length;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 font-sans">
      <ReadingAttemptHeader 
        title={assignment.title}
        classId={id}
        answeredCount={answeredCount}
        totalQuestions={allQuestions.length}
        timeRemainingStr={timeStr}
        isOvertime={isOvertime}
        saveStatus={saveStatus}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
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
            questionGroups={assignment.questionGroups}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onQuestionFocus={handleQuestionFocus}
            currentQuestionId={currentQuestionId}
            questionRefs={questionRefs}
          />
        </div>
      </div>

      <QuestionNavigator 
        questions={allQuestions}
        answers={answers}
        currentQuestionId={currentQuestionId}
        onQuestionClick={handleNavigatorClick}
      />
    </div>
  );
};
