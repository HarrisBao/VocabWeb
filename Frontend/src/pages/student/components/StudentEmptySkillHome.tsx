import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptySkillHomeProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  message?: string;
  vocabUnits?: any[];
}

export const StudentEmptySkillHome: React.FC<EmptySkillHomeProps> = ({ 
  title, subtitle, icon: Icon, colorClass, bgClass, 
  message = "Chưa có nội dung học trong kỹ năng này.",
  vocabUnits = [] 
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header */}
      <div className={`${colorClass.replace('text-', 'bg-').replace('[', 'bg-[')} rounded-3xl p-8 relative overflow-hidden shadow-sm`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Icon className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10 text-white">
          <h1 className="text-3xl font-black mb-2">{title}</h1>
          <p className="opacity-90 font-medium">{subtitle}</p>
        </div>
      </div>

      {vocabUnits.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-gray-900 px-2">Từ vựng cần ôn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vocabUnits.map(unit => (
              <div key={unit.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <h3 className="font-bold text-gray-900 mb-1">{unit.title}</h3>
                  <span className="text-sm text-gray-500 font-medium">{unit.wordCount} từ vựng</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center">
        <div className={`w-20 h-20 rounded-full ${bgClass} ${colorClass} flex items-center justify-center mb-6`}>
          <Icon className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Đang cập nhật</h3>
        <p className="text-gray-500 font-medium">{message}</p>
      </div>

    </div>
  );
};
