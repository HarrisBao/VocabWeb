import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Loader2, Library } from 'lucide-react';

interface VocabularyUnit {
  id: number;
  title: string;
  description: string;
  level: string;
  wordCount: number;
  isPinned: boolean;
}

export const StudentClassVocabularyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [units, setUnits] = useState<VocabularyUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVocab = async () => {
      try {
        const data = await api.get<VocabularyUnit[]>(`/student/classes/${id}/vocabulary`);
        setUnits(data);
      } catch (e) {
        console.error("Lỗi tải từ vựng", e);
      } finally {
        setLoading(false);
      }
    };
    fetchVocab();
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
        <h1 className="text-3xl font-black text-gray-900 mb-2">Từ vựng</h1>
        <p className="text-gray-500">Các bộ từ vựng được giao cho lớp này.</p>
      </div>

      {units.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Library className="w-8 h-8 text-green-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có bộ từ vựng nào.</h3>
          <p className="text-gray-500 max-w-sm mx-auto">Giáo viên chưa giao từ vựng cho lớp học này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {units.map(u => (
            <div key={u.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex-1">
                {u.isPinned && <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-bold rounded mb-2">ĐÃ GHIM</span>}
                <h3 className="text-lg font-bold text-gray-900 mb-1">{u.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{u.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="font-semibold text-brand">{u.level}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>{u.wordCount} từ</span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <Link to={`/learn/vocabulary/${u.id}?classId=${id}`} className="block w-full bg-brand text-white text-center py-2.5 rounded-xl text-sm font-bold hover:bg-brand-dark transition-colors">
                  Học từ vựng
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
