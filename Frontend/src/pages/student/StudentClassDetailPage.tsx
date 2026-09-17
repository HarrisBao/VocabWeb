import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { SKILLS_LIST } from '../../config/skills';
import { Loader2 } from 'lucide-react';

interface ClassDetail {
  id: number;
  name: string;
  code: string;
  description: string;
  vocabularyCount: number;
  readingCount: number;
  writingCount: number;
}

export const StudentClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const data = await api.get<ClassDetail>(`/student/classes/${id}`);
        setCls(data);
      } catch (e) {
        console.error("Lỗi tải lớp học", e);
      } finally {
        setLoading(false);
      }
    };
    fetchClass();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-brand" /></div>;
  }

  if (!cls) {
    return <div className="text-center p-12 text-gray-500">Không tìm thấy lớp học.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="bg-gradient-to-br from-brand-dark to-brand p-8 rounded-2xl shadow-md text-white">
        <Link to="/student" className="inline-flex items-center text-brand-light hover:text-white mb-4 text-sm font-medium transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại Lớp học
        </Link>
        <h1 className="text-3xl font-black text-white mb-2">{cls.name}</h1>
        <p className="text-brand-light opacity-90">{cls.description || `Lớp học ${cls.code}`}</p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          HỌC KỸ NĂNG
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SKILLS_LIST.map(skill => {
            const isActive = skill.status === 'ACTIVE';
            let statText = '';
            
            if (skill.id === 'vocabulary') statText = `${cls.vocabularyCount} bộ từ vựng`;
            if (skill.id === 'reading') statText = `${cls.readingCount} bài Reading`;
            if (skill.id === 'writing') statText = `${cls.writingCount} bài Writing`;
            
            return (
              <Link 
                key={skill.id}
                to={isActive ? `/student/classes/${cls.id}/${skill.id}` : '#'}
                className={`p-6 rounded-2xl border-2 transition-all block relative overflow-hidden group ${
                  isActive 
                    ? 'border-brand-light bg-surface hover:border-brand hover:shadow-md' 
                    : 'border-surface-hover bg-surface-muted hover:bg-gray-50 opacity-80 cursor-default'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl mb-4 ${skill.accentClass}`}>
                  {skill.label.charAt(0)}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">{skill.label}</h3>
                <p className="text-sm text-gray-600 mb-4">{skill.description}</p>
                
                {isActive ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {statText}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-gray-700 group-hover:text-gray-900 group-hover:translate-x-1 transition-transform">
                      Vào học
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400">
                    Sắp ra mắt
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
