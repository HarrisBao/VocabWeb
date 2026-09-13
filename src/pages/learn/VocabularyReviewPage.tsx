import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAudioManager } from '../../hooks/useAudioManager';
import { AudioSettingsPopover } from '../../components/learn/AudioSettingsPopover';

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

interface VocabularyReviewDto {
  id: number;
  title: string;
  description?: string;
  level: string;
  items: VocabularyReviewItemDto[];
}

export const VocabularyReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');
  
  const [data, setData] = useState<VocabularyReviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRandom, setIsRandom] = useState(false);
  const [viewMode, setViewMode] = useState<'flashcard' | 'list'>('flashcard');
  const [direction, setDirection] = useState<'forward'|'backward'|'none'>('none');

  const { preferences, playWord, stop } = useAudioManager();

  // For tracking which items we've visited in random mode
  const [randomSequence, setRandomSequence] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = classId ? `/learn/vocabulary/${id}?classId=${classId}` : `/learn/vocabulary/${id}`;
        const result = await api.get<VocabularyReviewDto>(url);
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Không thể tải bộ từ vựng.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, classId]);

  // Handle auto-play when active index changes
  useEffect(() => {
    if (data && data.items.length > 0 && preferences.autoPlayEnabled) {
      // Small timeout to allow transition
      const timer = setTimeout(() => {
        playWord(data.items[activeIndex].word);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeIndex, data, preferences.autoPlayEnabled, playWord]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleNext = () => {
    if (!data || data.items.length === 0) return;
    setDirection('forward');
    
    if (isRandom) {
      let nextIdx = Math.floor(Math.random() * data.items.length);
      // Avoid immediate repeat
      if (nextIdx === activeIndex && data.items.length > 1) {
        nextIdx = (nextIdx + 1) % data.items.length;
      }
      setActiveIndex(nextIdx);
    } else {
      if (activeIndex < data.items.length - 1) {
        setActiveIndex(activeIndex + 1);
      }
    }
  };

  const handlePrev = () => {
    if (!data || data.items.length === 0) return;
    setDirection('backward');
    if (!isRandom && activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleChipClick = (index: number) => {
    setDirection('none');
    setActiveIndex(index);
    const el = document.getElementById(`chip-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center pt-32">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang tải bài học...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lỗi truy cập</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button onClick={() => window.history.back()} className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-semibold hover:bg-gray-200 transition-colors w-full">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (data.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Hiện bài học này chưa có từ vựng.</p>
          <button onClick={() => window.history.back()} className="text-green-600 font-semibold hover:underline">
            Quay lại lớp
          </button>
        </div>
      </div>
    );
  }

  const currentItem = data.items[activeIndex];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.history.back()} 
              className="text-gray-500 hover:text-gray-900 transition-colors p-1"
              aria-label="Quay lại"
            >
              ←
            </button>
            <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
            <h1 className="text-sm font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md">
              {data.title}
            </h1>
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full hidden sm:inline-block">
              {data.items.length} từ
            </span>
          </div>

          <div className="flex items-center gap-2">
            <AudioSettingsPopover />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-8">
        
        {/* View Switcher */}
        <div className="flex justify-center">
          <div className="bg-gray-200/60 p-1 rounded-xl inline-flex">
            <button 
              onClick={() => setViewMode('flashcard')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'flashcard' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Học từ
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'list' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Danh sách
            </button>
          </div>
        </div>

        {viewMode === 'flashcard' ? (
          <>
            {/* Flashcard Area */}
            <div className="max-w-3xl mx-auto flex flex-col items-center">
              
              <div className="w-full flex justify-between items-center mb-3 px-2">
                <span className="text-sm font-bold text-gray-400">{activeIndex + 1} / {data.items.length}</span>
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

              {/* Progress */}
              <div className="w-full h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-300 ease-out" 
                  style={{ width: `${((activeIndex + 1) / data.items.length) * 100}%` }}
                />
              </div>

              {/* Card Container */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[400px] flex items-center justify-center">
                
                {/* Navigation Buttons */}
                <button 
                  onClick={handlePrev}
                  disabled={!isRandom && activeIndex === 0}
                  className="absolute left-0 sm:-left-16 z-10 p-3 sm:p-4 bg-white/80 backdrop-blur border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-green-600 hover:border-green-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ←
                </button>
                <button 
                  onClick={handleNext}
                  disabled={!isRandom && activeIndex === data.items.length - 1}
                  className="absolute right-0 sm:-right-16 z-10 p-3 sm:p-4 bg-white/80 backdrop-blur border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-green-600 hover:border-green-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  →
                </button>

                {/* Main Card */}
                <div 
                  key={currentItem.id} // Forces re-render/animation on change
                  className={`w-full h-full bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-200 ${direction === 'forward' ? 'slide-in-from-right-4' : direction === 'backward' ? 'slide-in-from-left-4' : ''}`}
                >
                  <button 
                    onClick={() => playWord(currentItem.word)}
                    className="group relative flex flex-col items-center gap-2 mb-6"
                    aria-label={`Nghe phát âm ${currentItem.word}`}
                  >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 group-hover:text-green-700 transition-colors">
                      {currentItem.word}
                    </h2>
                    
                    <div className="flex items-center gap-2 text-gray-400 group-hover:text-green-600 transition-colors">
                      <span className="text-xl">🔊</span>
                      {currentItem.ipa && (
                        <span className="text-lg sm:text-xl font-mono text-gray-500">{currentItem.ipa}</span>
                      )}
                    </div>
                  </button>

                  <div className="w-16 h-1 bg-green-100 rounded-full mb-6"></div>

                  <p className="text-xl sm:text-2xl font-bold text-gray-700">
                    {currentItem.meaning}
                  </p>
                  
                  {currentItem.partOfSpeech && (
                    <span className="mt-2 text-sm font-semibold text-gray-400 uppercase tracking-widest">
                      {currentItem.partOfSpeech}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Chips List */}
            <div className="mt-12 max-w-4xl mx-auto">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Tất cả từ trong bài</h3>
              <div className="flex flex-wrap gap-2">
                {data.items.map((item, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      id={`chip-${idx}`}
                      onClick={() => handleChipClick(idx)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
                        isActive 
                          ? 'bg-green-50 border-green-300 text-green-800 shadow-sm' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-green-200 hover:bg-green-50/30'
                      }`}
                    >
                      {item.word}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* List View Area */
          <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-gray-100">
              {data.items.map((item, idx) => (
                <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{item.word}</h3>
                      <button 
                        onClick={() => playWord(item.word)}
                        className="text-gray-400 hover:text-green-600 bg-gray-100 hover:bg-green-50 rounded-full p-1 transition-colors"
                        aria-label={`Nghe phát âm ${item.word}`}
                      >
                        🔊
                      </button>
                    </div>
                    {item.ipa && <p className="text-sm font-mono text-gray-500 mb-1">{item.ipa}</p>}
                    <p className="text-sm font-semibold text-gray-700">{item.meaning}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
