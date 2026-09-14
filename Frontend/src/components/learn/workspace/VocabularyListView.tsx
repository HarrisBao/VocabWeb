import React from 'react';
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

interface VocabularyListViewProps {
  items: VocabularyReviewItemDto[];
}

export const VocabularyListView: React.FC<VocabularyListViewProps> = ({ items }) => {
  const { playWord } = useAudioManager();

  return (
    <div className="w-full max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="divide-y divide-gray-100">
        {items.map((item, idx) => (
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
  );
};
