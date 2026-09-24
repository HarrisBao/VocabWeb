import { BilingualText } from '../../../components/ui/BilingualText';
import { vocabularyLabels } from '../../../i18n/labels';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2, ChevronRight, Clock } from 'lucide-react';
import { SkillBanner } from './SkillBanner';

interface ReadingHomeProps {
  classId: string;
  readings: any[];
  vocabUnits: any[];
}

export const StudentReadingHome: React.FC<ReadingHomeProps> = ({ classId, readings, vocabUnits }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      <SkillBanner
        title="Đọc hiểu"
        subtitle="Luyện tập kỹ năng Đọc hiểu"
        icon={BookOpen}
        bgGradient={['#DDF4EA', '#CDEEE2']}
        titleColor="#135C40"
        subtitleColor="#1E7A57"
        iconColor="#1E7A57"
      />

      {/* VOCABULARY OVERVIEW CARD */}
      <section className="space-y-4">
        <span className="text-lg font-black text-gray-900 px-2">{vocabularyLabels.vocabulary.vi}</span>
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-[#1D7A61]/30 hover:shadow-md transition-all">
          <div>
            <span className="font-bold text-gray-900 text-lg block mb-1">{vocabularyLabels.vocabularyForReading.vi}</span>
            <div className="flex items-center gap-3 mt-3 text-sm font-bold text-emerald-700 bg-emerald-50 w-fit px-3 py-1 rounded-xl">
              <span>{vocabUnits.length} {vocabularyLabels.vocabularySets.vi}</span>
            </div>
          </div>
          
          <Link 
            to={`/student/classes/${classId}/reading-vocabulary`}
            className="w-full md:w-auto px-6 py-3 bg-gray-50 hover:bg-emerald-50 text-emerald-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-transparent hover:border-emerald-100"
          >
            <span className="font-bold">{vocabularyLabels.viewVocabulary.vi}</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </section>

      {/* BÀI TẬP READING */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-gray-900 px-2">Bài tập Đọc hiểu</h2>
        {readings.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center shadow-sm">
            <p className="text-gray-500 font-medium">Hiện chưa có bài tập nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {readings.map(r => (
              <div key={r.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-emerald-200 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#DDF4EA] text-[#1E7A57] flex items-center justify-center shrink-0 mt-1 md:mt-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{r.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {r.durationMinutes} phút</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> {r.questionCount} câu hỏi</span>
                      {r.attemptCount > 0 && (
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                          Đã làm {r.attemptCount} lần
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 mt-4 md:mt-0 shrink-0">
                  {r.latestSubmittedAttemptId && (
                    <button 
                      onClick={() => navigate(`/student/classes/${classId}/reading/${r.id}/attempts/${r.latestSubmittedAttemptId}/result`)}
                      className="px-5 py-2.5 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors text-sm text-center"
                    >
                      Xem kết quả
                    </button>
                  )}
                  {r.activeAttemptId ? (
                    <Link 
                      to={`/student/classes/${classId}/reading/${r.id}`}
                      className="px-5 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors text-sm text-center shadow-sm"
                    >
                      Tiếp tục làm bài
                    </Link>
                  ) : (
                    <Link 
                      to={`/student/classes/${classId}/reading/${r.id}`}
                      className="px-5 py-2.5 bg-[#1E7A57] text-white font-bold rounded-xl hover:bg-[#166044] transition-colors text-sm text-center shadow-sm"
                    >
                      {r.attemptCount > 0 ? 'Làm lại' : 'Làm bài'}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
