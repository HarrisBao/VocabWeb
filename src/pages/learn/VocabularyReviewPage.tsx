import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAudioManager } from '../../hooks/useAudioManager';
import { AudioSettingsPopover } from '../../components/learn/AudioSettingsPopover';
import { LearningSidebar, PracticeAvailabilityDto } from '../../components/learn/workspace/LearningSidebar';
import { VocabularyFlashcardView } from '../../components/learn/workspace/VocabularyFlashcardView';
import { VocabularyListView } from '../../components/learn/workspace/VocabularyListView';
import { PracticeActivityView } from '../../components/learn/workspace/PracticeActivityView';
import { Menu, X } from 'lucide-react';

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
  const [availabilities, setAvailabilities] = useState<PracticeAvailabilityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<string>('flashcard');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { stop } = useAudioManager();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = classId ? `/learn/vocabulary/${id}?classId=${classId}` : `/learn/vocabulary/${id}`;
        
        const [reviewRes, availRes] = await Promise.all([
          api.get<VocabularyReviewDto>(url),
          api.get<PracticeAvailabilityDto[]>(`/learn/vocabulary/${id}/practice/availability`)
        ]);

        setData(reviewRes);
        setAvailabilities(availRes);
      } catch (err: any) {
        setError(err.message || 'Không thể tải bộ từ vựng.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, classId]);

  const handleSelectMode = (mode: string) => {
    // Stop any playing audio before switching context
    stop();
    setViewMode(mode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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

  const renderMainContent = () => {
    if (viewMode === 'flashcard') {
      return <VocabularyFlashcardView items={data.items} />;
    }
    if (viewMode === 'list') {
      return <VocabularyListView items={data.items} />;
    }
    
    // Otherwise it's a practice activity
    const activityInfo = availabilities.find(a => a.type === viewMode);
    if (!activityInfo) return <div className="text-center p-8 text-gray-500">Hoạt động không tồn tại.</div>;

    return (
      <PracticeActivityView 
        vocabularySetId={Number(id)} 
        activityType={viewMode} 
        activityName={activityInfo.name} 
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.history.back()} 
              className="text-gray-500 hover:text-gray-900 transition-colors p-1"
              aria-label="Quay lại"
            >
              ←
            </button>
            <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
            <h1 className="text-sm font-bold text-gray-900 truncate max-w-[150px] sm:max-w-xs md:max-w-md lg:max-w-lg">
              {data.title}
            </h1>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full hidden sm:inline-block">
              {data.items.length} từ
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200"
            >
              <Menu size={16} />
              <span className="hidden sm:inline">Hoạt động</span>
            </button>
            <AudioSettingsPopover />
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start px-4 py-6 gap-6 relative">
        
        {/* Desktop Sidebar (Left side, roughly 25%) */}
        <div className="hidden md:block w-64 lg:w-72 shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-8 custom-scrollbar">
          <LearningSidebar 
            currentMode={viewMode} 
            onSelectMode={handleSelectMode} 
            availabilities={availabilities} 
          />
        </div>

        {/* Main Content Area (Right side, roughly 75%) */}
        <div className="flex-1 w-full min-w-0">
          {renderMainContent()}
        </div>
      </div>

      {/* Mobile Drawer (Right-side Sheet) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)}></div>
          <div className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-white shadow-xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Hoạt động</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <LearningSidebar 
                currentMode={viewMode} 
                onSelectMode={handleSelectMode} 
                availabilities={availabilities}
                onMobileClose={() => setDrawerOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
