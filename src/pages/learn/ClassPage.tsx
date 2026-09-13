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

export const ClassPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [classData, setClassData] = useState<StudentClassDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        setLoading(true);
        const data = await api.get<StudentClassDto>(`/learn/classes/${slug}`);
        setClassData(data);
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
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-bold text-green-700">IELTS Thanh Lê</Link>
            <span className="text-gray-300">/</span>
            <span className="font-medium text-gray-600">Lớp: {classData.code.toUpperCase()}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">{classData.name}</h1>
          {classData.description && (
            <p className="text-gray-600">{classData.description}</p>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">Bài học ({classData.lessons.length})</h2>
          
          {classData.lessons.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
              <p className="text-gray-500">Giáo viên chưa thêm bài học nào vào lớp.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classData.lessons.map(lesson => (
                <div key={lesson.vocabularySetId} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-green-300 transition-colors flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    {lesson.isPinned && (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold uppercase rounded-md mb-2">
                        📌 Đã ghim
                      </span>
                    )}
                    <span className="text-xs font-semibold text-gray-400 uppercase">{lesson.wordCount} từ</span>
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
