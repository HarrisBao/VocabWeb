import React from 'react';
import { Home, BookOpen, Headphones, Edit3, MessageCircle } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  skillContexts: any[];
}

const NAV_ITEMS = [
  { id: 'overview', label: 'Trang học', icon: Home, colorClass: 'text-emerald-700', bgActive: 'bg-emerald-50' },
  { id: 'reading', label: 'Reading', icon: BookOpen, colorClass: 'text-[#1E7A57]', bgActive: 'bg-[#DDF4EA]' },
  { id: 'listening', label: 'Listening', icon: Headphones, colorClass: 'text-[#7C5CC4]', bgActive: 'bg-[#EEE7FB]' },
  { id: 'writing', label: 'Writing', icon: Edit3, colorClass: 'text-[#3B82C4]', bgActive: 'bg-[#E6F0FB]' },
  { id: 'speaking', label: 'Speaking', icon: MessageCircle, colorClass: 'text-[#C96A2E]', bgActive: 'bg-[#FBEEDC]' },
];

export const StudentSidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, skillContexts }) => {
  return (
    <div className="hidden md:flex flex-col w-64 bg-white rounded-3xl p-4 gap-2 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-fit sticky top-6">
      <div className="mb-6 px-4 pt-4">
        <h2 className="text-xl font-black text-gray-900">Không gian học</h2>
      </div>
      
      <div className="flex flex-col gap-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          // Legacy support for 'vocabulary' activeTab which shouldn't show a highlighted nav item
          // but we map it so it doesn't break
          
          const skillCtx = item.id !== 'overview' 
            ? skillContexts.find(c => c.skill === item.id.toUpperCase())
            : null;
            
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                isActive 
                  ? `${item.bgActive} ${item.colorClass}` 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              
              {skillCtx?.isHosted && (
                <span className="ml-auto text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/60 border border-black/5 font-black">
                  {skillCtx.hostClassName}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
