import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SkillBannerProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  bgGradient: [string, string];
  titleColor: string;
  subtitleColor: string;
  iconColor: string;
}

export const SkillBanner: React.FC<SkillBannerProps> = ({
  title,
  subtitle,
  icon: Icon,
  bgGradient,
  titleColor,
  subtitleColor,
  iconColor
}) => {
  return (
    <div 
      className="rounded-3xl p-8 relative overflow-hidden shadow-sm"
      style={{ background: `linear-gradient(135deg, ${bgGradient[0]} 0%, ${bgGradient[1]} 100%)` }}
    >
      <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-[0.15] pointer-events-none">
        <Icon className="w-48 h-48" style={{ color: iconColor }} />
      </div>
      <div className="relative z-10 max-w-[80%]">
        <h1 className="text-3xl font-black mb-2" style={{ color: titleColor }}>{title}</h1>
        <p className="font-bold text-lg opacity-90" style={{ color: subtitleColor }}>{subtitle}</p>
      </div>
    </div>
  );
};
