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
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchResult();
  }, [id, readingId, attemptId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/learn/class/${id}/reading/${readingId}/attempts/${attemptId}`);
      setResult(res);
      
      try {
         const histRes = await api.get(`/learn/class/${id}/reading/${readingId}/attempts`);
         setHistory(Array.isArray(histRes) ? histRes : []);
      } catch (e) {
         console.error("Failed to load history", e);
      }
      
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
       navigate(`/student/classes/${id}/reading/${readingId}`);
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
            <h2 className="text-gray-600 font-bold uppercase tracking-wider mb-2">Điểm (Lần {result.attemptNumber})</h2>
            <div className="text-6xl font-black text-brand-600 mb-6">
              {score} <span className="text-2xl text-gray-500">/ 10</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-green-50 px-4 py-3 rounded-xl border border-green-100">
                <span className="font-medium text-green-900">Đúng</span>
                <span className="font-bold text-green-900 bg-green-200 px-3 py-1 rounded-full border border-green-300">{result.correctCount} câu</span>
              </div>
              <div className="flex justify-between items-center bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                <span className="font-medium text-red-900">Sai</span>
                <span className="font-bold text-red-900 bg-red-200 px-3 py-1 rounded-full border border-red-300">{incorrectCount} câu</span>
              </div>
              <div className="flex justify-between items-center bg-amber-50 px-4 py-3 rounded-xl border border-amber-100">
                <span className="font-medium text-amber-900">Chưa trả lời</span>
                <span className="font-bold text-amber-900 bg-amber-200 px-3 py-1 rounded-full border border-amber-300">{unansweredCount} câu</span>
              </div>
            </div>
            
            <div className="mt-6 border-t pt-4">
              <h2 className="text-gray-600 font-bold uppercase tracking-wider mb-4">Thời gian</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Thời gian làm</span>
                  <span className="text-lg font-bold text-gray-800">{m}:{s}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Thời gian quy định</span>
                  <span className="text-lg font-bold text-gray-800">{allowedM}:{allowedS}</span>
                </div>
                {result.overtimeSeconds > 0 && (
                  <div className="flex justify-between items-center mt-2 bg-red-50 p-3 rounded-lg border border-red-200">
                    <span className="text-red-700 font-bold">Quá giờ</span>
                    <span className="text-lg font-bold text-red-700">
                      {Math.floor(result.overtimeSeconds / 60).toString().padStart(2, '0')}:{(result.overtimeSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions & History Card */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <Button 
                variant="primary" 
                onClick={() => navigate(`/student/classes/${id}/reading/${readingId}/attempts/${attemptId}/review`)} 
                className="w-full font-bold py-3 text-lg rounded-xl shadow-md transition-all">
                Xem lại bài làm này
              </Button>
              
              <div className="border-t pt-4 flex-1 flex flex-col min-h-0">
                <h3 className="font-bold text-gray-700 mb-3 uppercase text-sm tracking-wider">Lịch sử các lần làm</h3>
                <div className="overflow-y-auto space-y-3 pr-2" style={{ maxHeight: '350px' }}>
                  {history.map(h => (
                    <div key={h.id} className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${h.id === parseInt(attemptId!) ? 'bg-brand-50 border-brand-400 ring-1 ring-brand-400 shadow-sm' : 'bg-white border-gray-200 hover:border-brand-300'}`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-bold ${h.id === parseInt(attemptId!) ? 'text-brand-800' : 'text-gray-800'}`}>Lần {h.attemptNumber}</span>
                        <span className={`text-sm font-bold px-2 py-1 rounded-md ${h.id === parseInt(attemptId!) ? 'bg-brand-200 text-brand-900' : 'bg-gray-100 text-gray-700'}`}>
                          {h.totalQuestions > 0 ? ((h.correctCount / h.totalQuestions) * 10).toFixed(2) : "0.00"} / 10
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        Nộp: {new Date(h.submittedAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        Đúng {h.correctCount} · Sai {h.incorrectCount} · Trống {h.unansweredCount}
                      </div>
                      {h.id !== parseInt(attemptId!) && (
                        <div className="mt-2 pt-2 border-t border-gray-100 border-dashed">
                          <Button 
                            variant="outline"
                            className="w-full text-sm py-2 font-bold bg-white"
                            onClick={() => {
                                navigate(`/student/classes/${id}/reading/${readingId}/attempts/${h.id}/result`);
                            }}
                          >
                            Xem kết quả
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 border-t pt-4 grid grid-cols-2 gap-3">
                 <Button onClick={handleRetake} variant="secondary" className="font-bold shadow-sm border border-brand-200 text-brand-800 hover:bg-brand-100">Làm lại</Button>
                 <Button onClick={() => navigate(`/student/classes/${id}`)} variant="outline" className="font-bold shadow-sm bg-white hover:bg-gray-50">Về lớp</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        {result.questionGroups && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-gray-600 font-bold uppercase tracking-wider mb-6">Chi tiết từng phần (Lần {result.attemptNumber})</h2>
            <div className="space-y-4">
              {result.questionGroups.map((g: any, idx: number) => {
                const groupQuestionIds = g.questions.map((q: any) => q.id);
                const groupAnswers = result.answers.filter((a: any) => groupQuestionIds.includes(a.questionId));
                const groupCorrect = groupAnswers.filter((a: any) => a.isCorrect).length;
                
                return (
                  <div key={g.id} className="flex justify-between items-center p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-brand-200 transition-colors">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg mb-1">{g.academicQuestionType?.replace(/_/g, ' ') || `Phần ${idx + 1}`}</h3>
                      <p className="text-sm text-gray-600 truncate max-w-[200px] md:max-w-md font-medium" dangerouslySetInnerHTML={{ __html: g.instruction || '' }} />
                    </div>
                    <div className="text-lg font-bold text-brand-800 bg-brand-50 px-5 py-2 rounded-lg shadow-sm border border-brand-200">
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
