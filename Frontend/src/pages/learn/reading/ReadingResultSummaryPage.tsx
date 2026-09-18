import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';

export const ReadingResultSummaryPage: React.FC = () => {
  const { id, readingId, attemptId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [assignment, setAssignment] = useState<any>(null);

  useEffect(() => {
    fetchResult();
  }, [id, readingId, attemptId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/learn/class/${id}/reading/${readingId}/attempts/${attemptId}`);
      setResult(res);
      
      try {
         const liveRes = await api.get(`/learn/class/${id}/reading/${readingId}`);
         setAssignment(liveRes);
      } catch (e) {}
      
      setLoading(false);
    } catch (e: any) {
      alert("Không thể tải kết quả: " + e.message);
      navigate(`/student/classes/${id}`);
    }
  };

  const handleRetake = async () => {
     try {
       const startRes = await api.post(`/learn/class/${id}/reading/${readingId}/start`, {});
       navigate(`/student/classes/${id}/reading/${readingId}/attempts/${startRes.attemptId}`);
     } catch (e: any) {
       alert("Không thể bắt đầu làm lại (có thể bài đã đóng): " + e.message);
     }
  };

  if (loading || !result) {
    return <div className="h-screen flex items-center justify-center bg-gray-50"><Spinner /></div>;
  }

  const score = result.totalQuestions > 0 ? ((result.correctCount / result.totalQuestions) * 10).toFixed(2) : "0.00";
  const unansweredCount = result.answers.filter((a: any) => !a.studentAnswer || a.studentAnswer.trim() === '').length;
  const incorrectCount = result.totalQuestions - result.correctCount - unansweredCount;

  const m = Math.floor(result.timeSpentSeconds / 60).toString().padStart(2, '0');
  const s = (result.timeSpentSeconds % 60).toString().padStart(2, '0');
  const allowedM = Math.floor(result.allowedDurationSecondsSnapshot / 60).toString().padStart(2, '0');
  const allowedS = (result.allowedDurationSecondsSnapshot % 60).toString().padStart(2, '0');
  
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Link to={`/student/classes/${id}`} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">{assignment?.title || "Kết quả Reading"}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Main Score Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border-t-4 border-brand-500">
            <h2 className="text-gray-500 font-bold uppercase tracking-wider mb-2">Điểm</h2>
            <div className="text-6xl font-black text-brand-600 mb-6">
              {score} <span className="text-2xl text-gray-400">/ 10</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-green-50 px-4 py-3 rounded-xl border border-green-100">
                <span className="font-medium text-green-800">Đúng</span>
                <span className="font-bold text-green-700 bg-green-200 px-3 py-1 rounded-full">{result.correctCount} câu</span>
              </div>
              <div className="flex justify-between items-center bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                <span className="font-medium text-red-800">Sai</span>
                <span className="font-bold text-red-700 bg-red-200 px-3 py-1 rounded-full">{incorrectCount} câu</span>
              </div>
              <div className="flex justify-between items-center bg-amber-50 px-4 py-3 rounded-xl border border-amber-100">
                <span className="font-medium text-amber-800">Chưa trả lời</span>
                <span className="font-bold text-amber-700 bg-amber-200 px-3 py-1 rounded-full">{unansweredCount} câu</span>
              </div>
            </div>
          </div>

          {/* Time & Actions Card */}
          <div className="flex flex-col gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border-t-4 border-indigo-400">
              <h2 className="text-gray-500 font-bold uppercase tracking-wider mb-6">Thời gian</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-gray-600 font-medium">Thời gian làm</span>
                  <span className="text-xl font-bold text-gray-800">{m}:{s}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-gray-600 font-medium">Thời gian quy định</span>
                  <span className="text-xl font-bold text-gray-800">{allowedM}:{allowedS}</span>
                </div>
                {result.overtimeSeconds > 0 && (
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-red-600 font-bold">Quá giờ</span>
                    <span className="text-xl font-bold text-red-600 bg-red-100 px-3 py-1 rounded-lg">
                      {Math.floor(result.overtimeSeconds / 60).toString().padStart(2, '0')}:{(result.overtimeSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-3">
              <Button onClick={() => navigate(`/student/classes/${id}/reading/${readingId}/attempts/${attemptId}/review`)} className="w-full bg-brand-50 text-brand-700 hover:bg-brand-100 font-bold py-3 text-lg rounded-xl shadow-sm border border-brand-200">
                Xem lại bài làm
              </Button>
              <Button onClick={handleRetake} className="w-full bg-white text-gray-700 hover:bg-gray-50 font-bold py-3 text-lg rounded-xl shadow-sm border border-gray-300">
                Làm lại
              </Button>
              <Button onClick={() => navigate(`/student/classes/${id}`)} className="w-full bg-white text-gray-500 hover:text-gray-700 font-bold py-2 hover:bg-transparent">
                Về lớp
              </Button>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        {result.questionGroups && (
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-gray-500 font-bold uppercase tracking-wider mb-6">Chi tiết từng phần</h2>
            <div className="space-y-4">
              {result.questionGroups.map((g: any, idx: number) => {
                const groupQuestionIds = g.questions.map((q: any) => q.id);
                const groupAnswers = result.answers.filter((a: any) => groupQuestionIds.includes(a.questionId));
                const groupCorrect = groupAnswers.filter((a: any) => a.isCorrect).length;
                
                return (
                  <div key={g.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <h3 className="font-bold text-gray-800">{g.academicQuestionType?.replace(/_/g, ' ') || `Phần ${idx + 1}`}</h3>
                      <p className="text-sm text-gray-500 truncate max-w-[200px] md:max-w-md" dangerouslySetInnerHTML={{ __html: g.instruction || '' }} />
                    </div>
                    <div className="text-lg font-bold text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm border">
                      {groupCorrect} / {groupQuestionIds.length} đúng
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
