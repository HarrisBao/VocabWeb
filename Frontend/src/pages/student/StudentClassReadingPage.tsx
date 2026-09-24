import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Loader2, BookOpen, Clock } from 'lucide-react';

interface ReadingAssignment {
  id: number;
  title: string;
  durationMinutes: number;
  questionCount: number;
  attemptCount: number;
}

export const StudentClassReadingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [readings, setReadings] = useState<ReadingAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReadings = async () => {
      try {
        const data = await api.get<ReadingAssignment[]>(`/student/classes/${id}/reading`);
        setReadings(data);
      } catch (e) {
        console.error("Lỗi tải bài tập reading", e);
      } finally {
        setLoading(false);
      }
    };
    fetchReadings();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <Link to={`/student/classes/${id}`} className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6 font-medium text-sm transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại Lớp học
        </Link>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Đọc hiểu</h1>
        <p className="text-gray-500">Các bài tập Đọc hiểu được giao cho lớp này.</p>
      </div>

      {readings.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-green-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có bài Reading nào.</h3>
          <p className="text-gray-500 max-w-sm mx-auto">Giáo viên chưa giao bài tập Reading cho lớp học này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {readings.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{r.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-gray-400" /> {r.questionCount} câu</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-gray-400" /> {r.durationMinutes} phút</span>
                </div>
                {r.attemptCount > 0 && (
                  <span className="inline-block px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded mb-4">Đã làm: {r.attemptCount} lần</span>
                )}
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                {/* Note: In real app, we need to link to the global test access / reading access URL. 
                    Assuming `/class/XXX/portal/reading?assignmentId=X` or we use a common component */}
                <Link to={`/student/classes/${id}/reading/${r.id}/attempt`} className="flex-1 bg-brand text-white text-center py-2.5 rounded-xl text-sm font-bold hover:bg-brand-dark transition-colors">
                  Làm bài
                </Link>
                {r.attemptCount > 0 && (
                  <Link to={`/student/classes/${id}/reading/${r.id}/history`} className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors">
                    Lịch sử
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
