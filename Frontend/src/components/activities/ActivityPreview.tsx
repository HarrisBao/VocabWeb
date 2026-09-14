import { useState, useRef, useEffect } from 'react';

// DTOs matching the backend
export const ActivityType = {
  WORD_TO_MEANING: 0,
  MEANING_TO_WORD: 1,
  LISTEN_TO_WORD: 2,
  LISTEN_TO_MEANING: 3,
  MEANING_TO_TYPE_WORD: 4,
  LISTEN_TO_TYPE_WORD: 5,
  WORD_TO_TYPE_MEANING: 6,
  MISSING_LETTERS: 7,
  UNSCRAMBLE_WORD: 8,
  MATCH_WORD_MEANING: 9,
  PRONUNCIATION: 10,
} as const;

export type ActivityType = typeof ActivityType[keyof typeof ActivityType];

export const AudioBehavior = {
  NO_AUDIO: 0,
  AUTO_PLAY_TARGET: 1,
  PLAY_ON_CLICK_ONLY: 2,
  AUTO_PLAY_OPTIONS: 3,
} as const;

export type AudioBehavior = typeof AudioBehavior[keyof typeof AudioBehavior];

export interface QuestionOption {
  vocabularyItemId: number;
  text: string;
}

export interface GeneratedQuestion {
  questionId: string;
  type: ActivityType;
  targetVocabularyItemId: number;
  questionPrompt: string;
  options: QuestionOption[];
  audioBehavior: AudioBehavior;
}

interface ActivityPreviewProps {
  question: GeneratedQuestion;
  onAnswer: (answerValue: string, technicalFailure?: boolean) => void;
}

export function ActivityPreview({ question, onAnswer }: ActivityPreviewProps) {
  const [inputValue, setInputValue] = useState('');
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset state when question changes
  useEffect(() => {
    setInputValue('');
    setAudioError(false);
  }, [question.questionId]);

  const handleAudioPlay = async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
      setAudioError(false);
    } catch (err) {
      console.warn('Autoplay blocked or audio failed:', err);
      setAudioError(true);
    }
  };

  // Attempt autoplay if required
  useEffect(() => {
    if (question.audioBehavior === AudioBehavior.AUTO_PLAY_TARGET) {
      handleAudioPlay();
    }
  }, [question.questionId, question.audioBehavior]);

  const isListenActivity =
    question.type === ActivityType.LISTEN_TO_WORD ||
    question.type === ActivityType.LISTEN_TO_MEANING ||
    question.type === ActivityType.LISTEN_TO_TYPE_WORD;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Audio Element placeholder. In real app, src would come from backend or TTS */}
      {question.audioBehavior !== AudioBehavior.NO_AUDIO && (
        <audio
          ref={audioRef}
          src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" // Fake audio for preview
          preload="auto"
        />
      )}

      {/* Audio Controls Fallback */}
      {question.audioBehavior !== AudioBehavior.NO_AUDIO && (
        <div className="mb-6 flex flex-col items-center">
          <button
            onClick={handleAudioPlay}
            className="flex items-center justify-center w-16 h-16 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
          >
            <span className="text-2xl">🔊</span>
          </button>
          {audioError && (
            <p className="mt-2 text-sm text-amber-600 font-medium">
              Trình duyệt chặn tự động phát. Nhấn để nghe.
            </p>
          )}
        </div>
      )}

      {/* Prompt Area */}
      <div className="text-center mb-8">
        {!isListenActivity && (
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {question.questionPrompt}
          </h3>
        )}
        {isListenActivity && (
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            {question.questionPrompt || 'Nghe và trả lời'}
          </h3>
        )}
      </div>

      {/* Input Area */}
      <div className="space-y-4">
        {/* Multiple Choice Types */}
        {(question.type === ActivityType.WORD_TO_MEANING ||
          question.type === ActivityType.MEANING_TO_WORD ||
          question.type === ActivityType.LISTEN_TO_WORD ||
          question.type === ActivityType.LISTEN_TO_MEANING) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((opt) => (
              <button
                key={opt.vocabularyItemId}
                onClick={() => onAnswer(opt.vocabularyItemId.toString())}
                className="p-4 text-center border-2 border-gray-100 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all font-medium text-gray-700"
              >
                {opt.text}
              </button>
            ))}
          </div>
        )}

        {/* Typing Types */}
        {(question.type === ActivityType.MEANING_TO_TYPE_WORD ||
          question.type === ActivityType.LISTEN_TO_TYPE_WORD ||
          question.type === ActivityType.WORD_TO_TYPE_MEANING ||
          question.type === ActivityType.MISSING_LETTERS ||
          question.type === ActivityType.UNSCRAMBLE_WORD) && (
          <div className="flex flex-col items-center space-y-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputValue.trim()) {
                  onAnswer(inputValue);
                }
              }}
              className="w-full max-w-md p-4 text-center text-xl font-medium border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-0 outline-none"
              placeholder="Nhập câu trả lời..."
              autoFocus
            />
            <button
              onClick={() => inputValue.trim() && onAnswer(inputValue)}
              disabled={!inputValue.trim()}
              className="w-full max-w-md py-3 px-6 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Gửi trả lời
            </button>
          </div>
        )}

        {/* Pronunciation Type */}
        {question.type === ActivityType.PRONUNCIATION && (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-8 bg-gray-50 rounded-full border-4 border-gray-200 flex items-center justify-center">
              <span className="text-4xl">🎤</span>
            </div>
            <p className="text-gray-500 text-sm text-center max-w-sm">
              Đây là bản xem trước. Trong thực tế, hệ thống sẽ ghi âm và chấm điểm.
            </p>
            <div className="flex space-x-3 w-full max-w-md">
              <button
                onClick={() => onAnswer(question.questionPrompt)} // Fake correct
                className="flex-1 py-3 px-4 bg-green-100 text-green-700 font-bold rounded-lg hover:bg-green-200"
              >
                Giả lập đúng
              </button>
              <button
                onClick={() => onAnswer("wrong")} // Fake wrong
                className="flex-1 py-3 px-4 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200"
              >
                Giả lập sai
              </button>
              <button
                onClick={() => onAnswer("", true)} // Fake technical failure
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 text-xs"
              >
                Lỗi Mic
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
