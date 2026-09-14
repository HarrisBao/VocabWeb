import { useState, useEffect, useCallback, useRef } from 'react';

interface AudioPreferences {
  volume: number; // 0.0 to 1.0
  muted: boolean;
  autoPlayEnabled: boolean;
  playbackRate: number;
}

const DEFAULT_PREFERENCES: AudioPreferences = {
  volume: 0.7,
  muted: false,
  autoPlayEnabled: true,
  playbackRate: 1.0,
};

export const useAudioManager = () => {
  const [preferences, setPreferences] = useState<AudioPreferences>(() => {
    const saved = localStorage.getItem('vocabweb_audio_prefs');
    if (saved) {
      try {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_PREFERENCES;
      }
    }
    return DEFAULT_PREFERENCES;
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('vocabweb_audio_prefs', JSON.stringify(preferences));
  }, [preferences]);

  const updatePreference = <K extends keyof AudioPreferences>(key: K, value: AudioPreferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const stop = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
  }, []);

  const playWord = useCallback(
    (text: string) => {
      if (preferences.muted) return;
      if (!text || text.trim() === '') return;
      
      stop();

      if (synthRef.current) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; // Adjust based on requirements
        utterance.volume = preferences.volume;
        utterance.rate = preferences.playbackRate;

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = (e) => {
          console.error("Speech synthesis error", e);
          setIsPlaying(false);
        };

        try {
          synthRef.current.speak(utterance);
        } catch (error) {
          console.error("Failed to speak", error);
        }
      }
    },
    [preferences.muted, preferences.volume, preferences.playbackRate, stop]
  );

  return {
    preferences,
    updatePreference,
    playWord,
    stop,
    isPlaying,
  };
};
