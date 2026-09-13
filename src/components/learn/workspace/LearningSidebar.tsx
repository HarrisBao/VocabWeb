import React from 'react';
import { BookOpen, List, CheckCircle, Volume2, Keyboard, Type, Shuffle, ArrowLeftRight, Mic, Info } from 'lucide-react';

export interface PracticeAvailabilityDto {
  type: string;
  name: string;
  isAvailable: boolean;
  reason: string;
}

interface LearningSidebarProps {
  currentMode: string;
  onSelectMode: (mode: string) => void;
  availabilities: PracticeAvailabilityDto[];
  className?: string;
  onMobileClose?: () => void;
}

const GROUPS = [
  {
    id: 'REVIEW',
    title: 'ÔN TỪ',
    items: [
      { id: 'flashcard', name: 'Học từ', icon: <BookOpen size={16} /> },
      { id: 'list', name: 'Danh sách', icon: <List size={16} /> }
    ]
  },
  {
    id: 'RECOGNITION',
    title: 'NHẬN BIẾT',
    types: ['WORD_TO_MEANING', 'MEANING_TO_WORD'],
    icon: <CheckCircle size={16} />
  },
  {
    id: 'LISTENING',
    title: 'NGHE',
    types: ['LISTEN_TO_WORD', 'LISTEN_TO_MEANING', 'LISTEN_TO_TYPE_WORD'],
    icon: <Volume2 size={16} />
  },
  {
    id: 'TYPING_SPELLING',
    title: 'GÕ & CHÍNH TẢ',
    types: ['MEANING_TO_TYPE_WORD', 'WORD_TO_TYPE_MEANING', 'MISSING_LETTERS', 'UNSCRAMBLE_WORD'],
    icon: <Keyboard size={16} />
  },
  {
    id: 'MATCHING',
    title: 'LIÊN KẾT',
    types: ['MATCH_WORD_MEANING'],
    icon: <ArrowLeftRight size={16} />
  },
  {
    id: 'SPEAKING',
    title: 'PHÁT ÂM',
    types: ['PRONUNCIATION'],
    icon: <Mic size={16} />
  }
];

export const LearningSidebar: React.FC<LearningSidebarProps> = ({ currentMode, onSelectMode, availabilities, className = '', onMobileClose }) => {
  const handleSelect = (id: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    onSelectMode(id);
    if (onMobileClose) onMobileClose();
  };

  return (
    <div className={`w-full flex flex-col gap-6 ${className}`}>
      {GROUPS.map(group => {
        // Special case for non-practice items
        if (group.id === 'REVIEW') {
          return (
            <div key={group.id} className="space-y-1">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">{group.title}</h3>
              {group.items?.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id, true)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    currentMode === item.id 
                      ? 'bg-green-50 text-green-700 border-l-4 border-green-600' 
                      : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <span className={currentMode === item.id ? 'text-green-600' : 'text-gray-400'}>{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>
          );
        }

        // Practice activities
        const groupAvailabilities = group.types?.map(type => availabilities.find(a => a.type === type)).filter(Boolean) as PracticeAvailabilityDto[];
        if (!groupAvailabilities || groupAvailabilities.length === 0) return null;

        return (
          <div key={group.id} className="space-y-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">{group.title}</h3>
            {groupAvailabilities.map(av => {
              const isActive = currentMode === av.type;
              return (
                <div key={av.type} className="group relative">
                  <button
                    onClick={() => handleSelect(av.type, av.isAvailable)}
                    disabled={!av.isAvailable}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-sm transition-colors text-left ${
                      !av.isAvailable 
                        ? 'opacity-50 cursor-not-allowed text-gray-500 border-l-4 border-transparent' 
                        : isActive
                          ? 'bg-green-50 text-green-700 border-l-4 border-green-600 font-bold'
                          : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-green-600' : 'text-gray-400'}>{group.icon}</span>
                      <span>{av.name}</span>
                    </div>
                    {!av.isAvailable && (
                      <Info size={14} className="text-gray-400" />
                    )}
                  </button>
                  {!av.isAvailable && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                      {av.reason}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-gray-900"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
