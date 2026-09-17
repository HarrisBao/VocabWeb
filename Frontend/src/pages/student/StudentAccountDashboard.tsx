import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Loader2, Users } from 'lucide-react';

interface EnrolledClass {
  id: number;
  name: string;
  code: string;
  description: string;
  joinedAt: string;
}

export const StudentAccountDashboard: React.FC = () => {
  const [classes, setClasses] = useState<EnrolledClass[]>([]);
  const [loading, setLoading] = useState(true);
  
  const stored = localStorage.getItem('student_profile');
  let profileName = 'Học viên';
  if (stored) {
    try {
      profileName = JSON.parse(stored).fullName;
    } catch {}
  }

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await api.get<EnrolledClass[]>('/student/classes');
        setClasses(data);
      } catch (e) {
        console.error("Lỗi tải danh sách lớp", e);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="bg-gradient-to-br from-brand-dark to-brand p-8 rounded-2xl shadow-md text-white">
        <h1 className="text-3xl font-black text-white mb-2">Xin chào, {profileName}</h1>
        <p className="text-brand-light opacity-90">Chào mừng bạn đến với hệ thống học tập IELTS Thanh Lê.</p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-brand" />
          Lớp học của tôi
        </h2>
        
        {loading ? (
          <div className="flex justify-center p-8 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Bạn chưa tham gia lớp học nào.</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Khi giáo viên thêm bạn vào lớp, lớp học sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classes.map(cls => (
              <Link 
                key={cls.id}
                to={`/student/classes/${cls.id}`}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-brand hover:shadow-md group flex flex-col h-full"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-brand bg-brand-light/30 px-2 py-1 rounded">LỚP HỌC</span>
                    <span className="text-xs font-semibold text-gray-400">{cls.code}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand transition-colors">{cls.name}</h3>
                  {cls.description && <p className="text-sm text-gray-500 line-clamp-2 mb-4">{cls.description}</p>}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Tham gia: {new Date(cls.joinedAt).toLocaleDateString('vi-VN')}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-brand">
                    Vào lớp
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
