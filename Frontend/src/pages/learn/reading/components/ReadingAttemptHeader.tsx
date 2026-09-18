import React from 'react';
import { Button } from '../../../../components/ui/Button';
import { Link } from 'react-router-dom';

interface ReadingAttemptHeaderProps {
  title: string;
  classId: string | undefined;
  answeredCount: number;
  totalQuestions: number;
  timeRemainingStr: string;
  isOvertime: boolean;
  saveStatus: 'SAVING' | 'SAVED' | 'ERROR' | 'IDLE';
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const ReadingAttemptHeader: React.FC<ReadingAttemptHeaderProps> = ({
  title,
  classId,
  answeredCount,
  totalQuestions,
  timeRemainingStr,
  isOvertime,
  saveStatus,
  onSubmit,
  isSubmitting
}) => {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4 overflow-hidden flex-1">
        <Link to={`/student/classes/${classId}`} className="text-gray-500 hover:text-gray-800 transition-colors flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-lg font-bold text-gray-800 truncate" title={title}>{title}</h1>
      </div>
      
      <div className="flex items-center space-x-6 flex-shrink-0">
        <div className="text-sm font-medium text-gray-600 hidden md:block">
          Đã trả lời {answeredCount}/{totalQuestions}
        </div>
        
        <div className={`text-sm font-bold px-3 py-1.5 rounded-md ${isOvertime ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
          {isOvertime ? 'Quá giờ ' : ''}{timeRemainingStr}
        </div>
        
        <div className="text-xs text-gray-400 hidden sm:block w-24 text-right">
          {saveStatus === 'SAVING' && <span className="text-blue-500">Đang lưu...</span>}
          {saveStatus === 'SAVED' && <span className="text-green-600">Đã lưu</span>}
          {saveStatus === 'ERROR' && <span className="text-red-500">Chưa thể đồng bộ</span>}
        </div>
        
        <Button onClick={onSubmit} disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2 shadow-sm rounded-lg transition-all active:scale-95">
          {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
        </Button>
      </div>
    </header>
  );
};
