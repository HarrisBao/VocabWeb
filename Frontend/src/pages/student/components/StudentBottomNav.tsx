import React from 'react';
import { Home, BookOpen, Headphones, Edit3, MessageCircle } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

const NAV_ITEMS = [
  { id: 'overview', label: 'Trang học', icon: Home, activeColor: 'text-emerald-700' },
  { id: 'reading', label: 'Reading', icon: BookOpen, activeColor: 'text-[#1E7A57]' },
  { id: 'listening', label: 'Listening', icon: Headphones, activeColor: 'text-[#7C5CC4]' },
  { id: 'writing', label: 'Writing', icon: Edit3, activeColor: 'text-[#3B82C4]' },
  { id: 'speaking', label: 'Speaking', icon: MessageCircle, activeColor: 'text-[#C96A2E]' },
];

export const StudentBottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] z-50 px-2 pb-safe">
      <div className="flex items-center justify-between">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-full py-3 gap-1 transition-colors ${
                isActive ? item.activeColor : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
