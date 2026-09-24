import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { BilingualText } from '../../../components/ui/BilingualText';
import { vocabularyLabels } from '../../../i18n/labels';
import React from 'react';
import { useParams } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { SkillBanner } from './SkillBanner';

interface EmptySkillHomeProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  bgGradient: [string, string];
  titleColor: string;
  subtitleColor: string;
  iconColor: string;
  message?: string;
  vocabUnits?: any[];
}

export const StudentEmptySkillHome: React.FC<EmptySkillHomeProps> = ({
  title, subtitle, icon: Icon, bgGradient, titleColor, subtitleColor, iconColor,
  message = "Chưa có nội dung học trong kỹ năng này.",
  vocabUnits = [] 
}) => {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      <SkillBanner
        title={title}
        subtitle={subtitle}
        icon={Icon}
        bgGradient={bgGradient}
        titleColor={titleColor}
        subtitleColor={subtitleColor}
        iconColor={iconColor}
      />

      {vocabUnits.length > 0 && (
        <section className="space-y-4">
          <span className="text-lg font-black text-gray-900 px-2">{vocabularyLabels.vocabulary.vi}</span>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:shadow-md transition-all">
            <div>
              <span className="font-bold text-gray-900 text-lg block mb-1">{title.toLowerCase() === 'listening' ? vocabularyLabels.vocabularyForListening.vi : vocabularyLabels.vocabularyForReading.vi}</span>
              <div className="flex items-center gap-3 mt-3 text-sm font-bold w-fit px-3 py-1 rounded-xl" style={{ background: bgGradient[0], color: titleColor }}>
                <span>{vocabUnits.length} {vocabularyLabels.vocabularySets.vi}</span>
              </div>
            </div>
            
            <Link 
              to={`/student/classes/${id}/${title.toLowerCase()}-vocabulary`}
              className="w-full md:w-auto px-6 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-transparent"
              style={{ background: bgGradient[0], color: titleColor }}
            >
              <span className="font-bold">{vocabularyLabels.viewVocabulary.vi}</span>
              <ChevronRight className="w-4 h-4 ml-1 opacity-70" />
            </Link>
          </div>
        </section>
      )}

      {/* Empty State */}
      <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: bgGradient[0] }}>
          <Icon className="w-10 h-10" style={{ color: iconColor }} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Đang cập nhật</h3>
        <p className="text-gray-500 font-medium">{message}</p>
      </div>

    </div>
  );
};
