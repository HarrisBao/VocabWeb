import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, BookOpen, Headphones, Edit3, MessageCircle } from 'lucide-react';
import { api } from '../../services/api';
import { BilingualText } from '../../components/ui/BilingualText';
import { vocabularyLabels } from '../../i18n/labels';

interface VocabularyUnit {
  id: number;
  title: string;
  wordCount: number;
}

export const StudentVocabularyHubPage: React.FC = () => {
  const { id, skill } = useParams<{ id: string; skill: string }>();
  const navigate = useNavigate();
  
  const [vocabUnits, setVocabUnits] = useState<VocabularyUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVocab = async () => {
      try {
        setLoading(true);
        // 1. Resolve effective host class for this skill
        const contexts = await api.get<any[]>(`/student/classes/${id}/skill-context`).catch(() => []);
        const skillUpper = (skill || '').toUpperCase().replace('-VOCABULARY', '');
        const ctx = contexts.find(c => c.skill === skillUpper);
        const targetClassId = ctx?.hostClassId || id;
        
        // 2. Fetch vocabulary from the host class
        const data = await api.get<VocabularyUnit[]>(`/student/classes/${targetClassId}/vocabulary`);
        setVocabUnits(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchVocab();
  }, [id, skill]);

  // Determine styles and labels based on skill
  const isListening = skill === 'listening';
  
  const accentColor = isListening ? '#7C5CC4' : '#1E7A57';
  const titleColor = isListening ? '#5A3D99' : '#135C40';
  const bgGradient = isListening ? ['#EEE7FB', '#DED1F7'] : ['#DDF4EA', '#CDEEE2'];
  const Icon = isListening ? Headphones : BookOpen;

  const enTitle = isListening ? vocabularyLabels.listeningVocabulary.en : vocabularyLabels.readingVocabulary.en;
  const viTitle = isListening ? vocabularyLabels.listeningVocabulary.vi : vocabularyLabels.readingVocabulary.vi;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      
      {/* Header NavBar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <BilingualText 
            primary={enTitle}
            secondary={viTitle}
            primaryClass="font-black text-gray-900"
            secondaryClass="text-xs font-medium text-gray-500"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Banner */}
        <div 
          className="rounded-3xl p-8 relative overflow-hidden shadow-sm mb-8"
          style={{ background: `linear-gradient(135deg, ${bgGradient[0]} 0%, ${bgGradient[1]} 100%)` }}
        >
          <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-[0.15] pointer-events-none">
            <Icon className="w-48 h-48" style={{ color: accentColor }} />
          </div>
          <div className="relative z-10 max-w-[80%]">
            <BilingualText 
              primary={enTitle}
              secondary={viTitle}
              primaryClass="text-3xl font-black mb-1 block"
              secondaryClass="text-lg font-bold opacity-90 block"
              containerClass="mb-2"
            />
            <p className="font-medium opacity-80" style={{ color: titleColor }}>
              {vocabularyLabels.teacherPreparedSets.en}
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : vocabUnits.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6" style={{ background: bgGradient[0] }}>
              <Icon className="w-10 h-10" style={{ color: accentColor }} />
            </div>
            <BilingualText 
              primary={vocabularyLabels.emptyStateTitle.en}
              secondary={vocabularyLabels.emptyStateTitle.vi}
              primaryClass="text-xl font-bold text-gray-900 mb-1 block"
              secondaryClass="text-gray-500 font-medium block"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vocabUnits.map(unit => (
              <div key={unit.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all h-full">
                
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{unit.title}</h3>
                  <div className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider" style={{ background: bgGradient[0], color: titleColor }}>
                    <span>{unit.wordCount} {vocabularyLabels.words.en}</span>
                    <span className="opacity-60 px-1">•</span>
                    <span>{unit.wordCount} {vocabularyLabels.words.vi}</span>
                  </div>
                </div>

                <Link 
                  to={`/learn/vocabulary/${unit.id}?classId=${id}`}
                  className="w-full py-3 rounded-xl font-bold flex items-center justify-center transition-colors gap-2"
                  style={{ background: bgGradient[0], color: titleColor }}
                >
                  <BilingualText 
                    primary={vocabularyLabels.review.en}
                    secondary={vocabularyLabels.review.vi}
                    primaryClass=""
                    secondaryClass="font-normal opacity-80 ml-1"
                    containerClass="flex items-baseline"
                  />
                  <ChevronRight className="w-4 h-4 ml-1 opacity-70" />
                </Link>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);
