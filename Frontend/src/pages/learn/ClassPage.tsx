import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';

interface StudentLessonDto {
  vocabularySetId: number;
  title: string;
  description?: string;
  level: string;
  wordCount: number;
  isPinned: boolean;
  displayOrder: number;
}

interface StudentClassDto {
  id: number;
  name: string;
  code: string;
  description?: string;
  allowGuestAccess: boolean;
  requireLogin: boolean;
  lessons: StudentLessonDto[];
}

interface ReadingAssignmentDto {
  id: number;
  title: string;
  durationMinutes: number;
  attemptCount: number;
    latestSubmittedAttemptId?: number | null;
    activeAttemptId?: number | null;
}

export const ClassPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [classData, setClassData] = useState<StudentClassDto | null>(null);
  const [readingData, setReadingData] = useState<ReadingAssignmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        setLoading(true);
        const data = await api.get<StudentClassDto>(`/learn/classes/${slug}`);
        setClassData(data);
        
        try {
          const readingRes = await api.get<ReadingAssignmentDto[]>(`/learn/class/${data.id}/reading`);
          setReadingData(Array.isArray(readingRes) ? readingRes : []);
        } catch(e) {
          console.error("No reading data", e);
        }

        // Save to recent classes for Student Home / Reading Page
        try {
          const recentKey = 'student_recent_classes';
          const existing = JSON.parse(localStorage.getItem(recentKey) || '[]');
          const updated = existing.filter((c: any) => c.slug !== slug);
          updated.unshift({ slug, name: data.name, code: data.code, timestamp: Date.now() });
          localStorage.setItem(recentKey, JSON.stringify(updated.slice(0, 5)));
        } catch (e) {
          // Ignore local storage errors
        }
        
      } catch (err: any) {
        setError(err.message || 'Lỗi tải thông tin lớp học.');
      } finally {
        setLoading(false);
      }
    };
    fetchClass();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand border-t-brand-light rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Không thể truy cập lớp học</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <Link to="/">
            <Button className="w-full">Trở về trang chủ</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shrink-0">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-bold text-brand hover:underline">IELTS VocabWeb</Link>
            <span className="text-gray-300">/</span>
            <span className="font-medium text-gray-600">Lớp: {classData.code.toUpperCase()}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full space-y-12">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">{classData.name}</h1>
          {classData.description && (
            <p className="text-gray-600">{classData.description}</p>
          )}
        </div>

        {/* READING SECTION */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 flex items-center gap-2">
            📖 Reading <span className="text-sm font-normal text-gray-500">({readingData.length})</span>
          </h2>
          
          {readingData.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-sm">
              <p className="text-gray-500">Giáo viên chưa thêm bài tập Reading nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readingData.map(r => (
                <div key={r.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-brand-light transition-colors flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-gray-500">{r.durationMinutes} phút</span>
                    {r.attemptCount > 0 && <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded">Đã làm ({r.attemptCount})</span>}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{r.title}</h3>
                  <div className="mt-auto">
                      {(() => {
                        const hasSubmittedAttempt = r.attemptCount > 0 && r.latestSubmittedAttemptId != null;
                        const hasActiveAttempt = r.activeAttemptId != null;

                        if (hasSubmittedAttempt && !hasActiveAttempt) {
                          return (
                            <div className="flex items-center gap-2">
                              <Link to={`/learn/classes/${classData.id}/reading/${r.id}/attempts/${r.latestSubmittedAttemptId}/result`} className="flex-1">
                                <Button variant="outline" className="w-full">Xem kết quả</Button>
                              </Link>
                              <Link to={`/learn/classes/${classData.id}/reading/${r.id}`} className="flex-1">
                                <Button className="w-full">Làm lại</Button>
                              </Link>
                            </div>
                          );
                        }

                        if (hasSubmittedAttempt && hasActiveAttempt) {
                          return (
                            <div className="flex items-center gap-2">
                              <Link to={`/learn/classes/${classData.id}/reading/${r.id}/attempts/${r.latestSubmittedAttemptId}/result`} className="flex-1">
                                <Button variant="outline" className="w-full">Xem kết quả</Button>
                              </Link>
                              <Link to={`/learn/classes/${classData.id}/reading/${r.id}`} className="flex-1">
                                <Button className="w-full">Tiếp tục</Button>
                              </Link>
                            </div>
                          );
                        }

                        if (!hasSubmittedAttempt && hasActiveAttempt) {
                          return (
                            <Link to={`/learn/classes/${classData.id}/reading/${r.id}`}>
                              <Button className="w-full">Tiếp tục</Button>
                            </Link>
                          );
                        }

                        return (
                          <Link to={`/learn/classes/${classData.id}/reading/${r.id}`}>
                            <Button className="w-full">Làm bài</Button>
                          </Link>
                        );
                      })()}
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* VOCABULARY SECTION */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 flex items-center gap-2">
            📚 Từ vựng <span className="text-sm font-normal text-gray-500">({classData.lessons.length})</span>
          </h2>
          
          {classData.lessons.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
              <p className="text-gray-500">Giáo viên chưa thêm bài học nào vào lớp.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classData.lessons.map(lesson => (
                <div key={lesson.vocabularySetId} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-brand-light transition-colors flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    {lesson.isPinned && (
                      <span className="inline-block px-2 py-1 bg-brand-light text-brand text-[10px] font-bold uppercase rounded-md mb-2">
                        📌 Đã ghim
                      </span>
                    )}
                    <span className="text-xs font-semibold text-gray-400 uppercase ml-auto">{lesson.wordCount} từ</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-1">
                    {lesson.title}
                  </h3>
                  
                  {lesson.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
                      {lesson.description}
                    </p>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 mt-auto">
                    <Link to={`/learn/vocabulary/${lesson.vocabularySetId}?classId=${classData.id}`}>
                      <Button className="w-full">Ôn từ</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
