import React, { useState, useEffect } from 'react';
import { useAudioManager } from '../../../hooks/useAudioManager';

interface VocabularyReviewItemDto {
  id: number;
  word: string;
  ipa?: string;
  meaning: string;
  partOfSpeech?: string;
  exampleSentence?: string;
  note?: string;
  sortOrder: number;
}

interface VocabularyFlashcardViewProps {
  items: VocabularyReviewItemDto[];
}

const flashcardThemes = [
  { key: "blue", front: "bg-[#EFF6FF]", back: "bg-[#DBEAFE]", border: "border-[#BFDBFE]" },
  { key: "purple", front: "bg-[#F5F3FF]", back: "bg-[#EDE9FE]", border: "border-[#DDD6FE]" },
  { key: "yellow", front: "bg-[#FFFBEB]", back: "bg-[#FEF3C7]", border: "border-[#FDE68A]" },
  { key: "pink", front: "bg-[#FDF2F8]", back: "bg-[#FCE7F3]", border: "border-[#FBCFE8]" },
  { key: "cyan", front: "bg-[#ECFEFF]", back: "bg-[#CFFAFE]", border: "border-[#A5F3FC]" },
  { key: "orange", front: "bg-[#FFF7ED]", back: "bg-[#FFEDD5]", border: "border-[#FED7AA]" },
  { key: "green", front: "bg-[#F0FDF4]", back: "bg-[#DCFCE7]", border: "border-[#BBF7D0]" }
];

export const VocabularyFlashcardView: React.FC<VocabularyFlashcardViewProps> = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRandom, setIsRandom] = useState(false);
  const [direction, setDirection] = useState<'forward'|'backward'|'none'>('none');
  const [isFlipped, setIsFlipped] = useState(false);

  const { preferences, playWord } = useAudioManager();

  useEffect(() => {
    if (items.length > 0 && preferences.autoPlayEnabled) {
      const timer = setTimeout(() => {
        playWord(items[activeIndex].word);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeIndex, items, preferences.autoPlayEnabled, playWord]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleNext = () => {
    if (items.length === 0) return;
    setDirection('forward');
    setIsFlipped(false);
    
    if (isRandom) {
      let nextIdx = Math.floor(Math.random() * items.length);
      if (nextIdx === activeIndex && items.length > 1) {
        nextIdx = (nextIdx + 1) % items.length;
      }
      setActiveIndex(nextIdx);
    } else {
      if (activeIndex < items.length - 1) setActiveIndex(activeIndex + 1);
    }
  };

  const handlePrev = () => {
    if (items.length === 0) return;
    setDirection('backward');
    setIsFlipped(false);
    if (!isRandom && activeIndex > 0) setActiveIndex(activeIndex - 1);
  };

  if (items.length === 0) return null;

  const currentItem = items[activeIndex];
  const progressPercent = ((activeIndex + 1) / items.length) * 100;
  const theme = flashcardThemes[currentItem.id % flashcardThemes.length];

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-full flex justify-between items-center mb-3 px-2">
        <span className="text-sm font-bold text-gray-400">{activeIndex + 1} / {items.length}</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Trộn từ</span>
          <input 
            type="checkbox" 
            checked={isRandom}
            onChange={(e) => setIsRandom(e.target.checked)}
            className="w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300"
          />
        </label>
      </div>

      <div className="w-full h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-green-500 transition-all duration-300 ease-out" style={{ width: `${progressPercent}%` }}></div>
      </div>

      <div className="w-full relative h-[360px] sm:h-[400px] [perspective:1000px]">
        <div 
          tabIndex={0}
          onClick={() => setIsFlipped(!isFlipped)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsFlipped(!isFlipped);
            }
          }}
          aria-label={`Flashcard ${currentItem.word}. Nhấn Enter để xem ${isFlipped ? 'từ' : 'nghĩa'}.`}
          className={`w-full h-full cursor-pointer relative [transform-style:preserve-3d] transition-transform duration-[350ms] focus:outline-none focus-visible:ring-4 focus-visible:ring-green-200 rounded-3xl ${isFlipped ? '[transform:rotateY(180deg)]' : ''} hover:shadow-lg active:scale-[0.99]`}
        >
          {/* Front */}
          <div className={`absolute inset-0 [backface-visibility:hidden] ${theme.front} ${theme.border} border-2 rounded-3xl shadow-sm flex flex-col items-center justify-center p-8 transition-shadow`}>
            <span className="text-[32px] sm:text-[42px] font-extrabold text-[#111827] text-center mb-4">{currentItem.word}</span>
            {currentItem.ipa && (
              <span className="text-[18px] sm:text-[22px] text-[#475569] font-medium mb-8">
                {currentItem.ipa.startsWith('/') ? currentItem.ipa : `/${currentItem.ipa}/`}
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); playWord(currentItem.word); }}
              tabIndex={0}
              aria-label="Phát âm"
              className="w-14 h-14 bg-white/70 text-gray-800 rounded-full flex items-center justify-center hover:bg-white shadow-sm transition-colors mb-6 text-xl"
            >
              🔊
            </button>
            <div className="absolute bottom-6 text-[#475569]/70 text-sm font-medium">Chạm để lật</div>
          </div>

          {/* Back */}
          <div className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] ${theme.back} ${theme.border} border-2 rounded-3xl shadow-sm flex flex-col items-center justify-center p-8 transition-shadow`}>
            {currentItem.meaning ? (
              <span className="text-[28px] sm:text-[36px] font-bold text-[#111827] text-center">{currentItem.meaning}</span>
            ) : (
              <span className="text-[28px] sm:text-[36px] font-bold text-gray-400 text-center italic">Chưa có nghĩa</span>
            )}
            
            <div className="absolute bottom-6 text-[#475569]/70 text-sm font-medium">Chạm để quay lại</div>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-between items-center mt-8 px-4">
        <button 
          onClick={handlePrev}
          disabled={!isRandom && activeIndex === 0}
          className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
            (!isRandom && activeIndex === 0) 
              ? 'border-gray-200 text-gray-300 bg-gray-50' 
              : 'border-green-100 text-green-600 bg-white hover:bg-green-50 hover:scale-105 active:scale-95'
          }`}
        >
          ←
        </button>
        <button 
          onClick={handleNext}
          className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-green-100 text-green-600 bg-white hover:bg-green-50 hover:scale-105 active:scale-95 transition-all shadow-sm"
        >
          →
        </button>
      </div>

      <div className="w-full mt-12 bg-white rounded-2xl border border-gray-200 p-6 overflow-hidden">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 px-2">Tất cả từ trong bài</h3>
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => { setActiveIndex(idx); setIsFlipped(false); setIsRandom(false); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                idx === activeIndex 
                  ? 'bg-green-600 text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {item.word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
