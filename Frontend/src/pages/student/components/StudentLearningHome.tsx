import React from 'react';
import { BookOpen, Headphones, Edit3, MessageCircle, ChevronRight, Sparkles } from 'lucide-react';
import { StudentProgressWidget } from '../../../components/progress/StudentProgressWidget';

interface LearningHomeProps {
  cls: any;
  skillContexts: any[];
  setActiveTab: (tab: string) => void;
  classId: string;
}

const SKILL_CARDS = [
  { id: 'reading', label: 'Reading', icon: BookOpen, color: 'text-[#1E7A57]', bg: 'bg-[#DDF4EA]', border: 'border-[#1E7A57]/20', hover: 'hover:border-[#1E7A57]/40 hover:shadow-[#1E7A57]/10' },
  { id: 'listening', label: 'Listening', icon: Headphones, color: 'text-[#7C5CC4]', bg: 'bg-[#EEE7FB]', border: 'border-[#7C5CC4]/20', hover: 'hover:border-[#7C5CC4]/40 hover:shadow-[#7C5CC4]/10' },
  { id: 'writing', label: 'Writing', icon: Edit3, color: 'text-[#3B82C4]', bg: 'bg-[#E6F0FB]', border: 'border-[#3B82C4]/20', hover: 'hover:border-[#3B82C4]/40 hover:shadow-[#3B82C4]/10' },
  { id: 'speaking', label: 'Speaking', icon: MessageCircle, color: 'text-[#C96A2E]', bg: 'bg-[#FBEEDC]', border: 'border-[#C96A2E]/20', hover: 'hover:border-[#C96A2E]/40 hover:shadow-[#C96A2E]/10' },
];

export const StudentLearningHome: React.FC<LearningHomeProps> = ({ cls, skillContexts, setActiveTab, classId }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50/30 border border-emerald-100/50 rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none text-emerald-600">
          <Sparkles className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-emerald-950 mb-3">
            Chào bạn 👋
          </h1>
          <p className="text-emerald-800/80 font-medium text-lg max-w-xl">
            Hôm nay mình học gì nào? Lựa chọn một kỹ năng bên dưới để tiếp tục hành trình của bạn nhé.
          </p>
        </div>
      </div>

      {/* Progress Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-gray-900 px-2">Lộ trình hiện tại</h2>
        <StudentProgressWidget classId={classId} />
      </section>

      {/* Skill Cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-gray-900 px-2">Các kỹ năng</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SKILL_CARDS.map(skill => {
            const Icon = skill.icon;
            const ctx = skillContexts.find(c => c.skill === skill.id.toUpperCase());
            
            return (
              <button
                key={skill.id}
                onClick={() => setActiveTab(skill.id)}
                className={`text-left bg-white rounded-3xl p-6 border ${skill.border} shadow-sm transition-all duration-200 ${skill.hover} hover:-translate-y-0.5 group relative overflow-hidden`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${skill.bg} rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110`} />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <div className={`w-12 h-12 rounded-2xl ${skill.bg} ${skill.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {ctx?.isHosted && (
                      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-lg">
                        Học tại {ctx.hostClassName}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-auto">
                    <h3 className="text-xl font-black text-gray-900 mb-1">{skill.label}</h3>
                    <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors mt-4">
                      <span>Tiếp tục học</span>
                      <ChevronRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Vocabulary Quick Access */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-black text-gray-900">Từ vựng cần ôn</h2>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Vocabulary</p>
              <p className="text-sm font-medium text-gray-500">Truy cập qua các kỹ năng Reading hoặc Listening</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button onClick={() => setActiveTab('reading')} className="flex-1 md:flex-none px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors text-sm">
              Ôn Reading
            </button>
            <button onClick={() => setActiveTab('listening')} className="flex-1 md:flex-none px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors text-sm">
              Ôn Listening
            </button>
          </div>
        </div>
      </section>
      
    </div>
  );
};
