import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PenTool } from 'lucide-react';

export const StudentClassWritingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <Link to={`/student/classes/${id}`} className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6 font-medium text-sm transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại Lớp học
        </Link>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Writing</h1>
        <p className="text-gray-500">Các bài tập Writing được giao cho lớp này.</p>
      </div>

      <div className="bg-[#E6F0FB] border border-[#cce0f5] rounded-2xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <PenTool className="w-8 h-8 text-[#3B82C4]" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có bài Writing nào được giao cho lớp này.</h3>
        <p className="text-gray-500 max-w-sm mx-auto">Giáo viên sẽ thêm bài tập Writing trong thời gian tới.</p>
      </div>
    </div>
  );
};
