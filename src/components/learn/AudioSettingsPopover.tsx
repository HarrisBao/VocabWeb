import React, { useState, useRef, useEffect } from 'react';
import { useAudioManager } from '../../hooks/useAudioManager';

export const AudioSettingsPopover: React.FC = () => {
  const { preferences, updatePreference } = useAudioManager();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700 transition-colors"
      >
        <span>{preferences.muted ? '🔇' : '🔊'}</span>
        <span>{Math.round(preferences.volume * 100)}%</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50">
          <div className="space-y-4">
            
            {/* Auto Sound */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Tự động phát âm</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={preferences.autoPlayEnabled}
                  onChange={(e) => updatePreference('autoPlayEnabled', e.target.checked)}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            {/* Mute */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Tắt tiếng (Mute)</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={preferences.muted}
                  onChange={(e) => updatePreference('muted', e.target.checked)}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>

            {/* Volume */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-gray-500">Âm lượng</span>
                <span className="text-xs font-medium text-gray-500">{Math.round(preferences.volume * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.05"
                value={preferences.volume}
                onChange={(e) => updatePreference('volume', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
            </div>

            {/* Playback Rate */}
            <div>
              <span className="text-xs font-medium text-gray-500 mb-2 block">Tốc độ đọc</span>
              <div className="flex gap-2">
                {[0.8, 1.0, 1.2].map(rate => (
                  <button
                    key={rate}
                    onClick={() => updatePreference('playbackRate', rate)}
                    className={`flex-1 py-1 text-xs font-semibold rounded ${preferences.playbackRate === rate ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'} border`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
