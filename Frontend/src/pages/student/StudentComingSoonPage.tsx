import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { SKILL_REGISTRY, SkillType } from '../../config/skills';

export const StudentComingSoonPage: React.FC = () => {
  const { skillId } = useParams<{ skillId: string }>();
  
  if (!skillId) return <Navigate to="/student" replace />;
  
  const skillKey = skillId.toUpperCase() as SkillType;
  const skill = SKILL_REGISTRY[skillKey];

  if (!skill) return <Navigate to="/student" replace />;

  return (
    <div className="max-w-4xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex items-start gap-6 border-b border-gray-200 pb-8 mb-12">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-3xl shrink-0 ${skill.accentClass}`}>
          {skill.label.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">{skill.label}</h1>
          <p className="text-gray-500 text-lg">{skill.description}</p>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center max-w-2xl mx-auto">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-6 ${skill.accentClass}`}>
          {skillKey === 'LISTENING' && '🎧'}
          {skillKey === 'WRITING' && '✍️'}
          {skillKey === 'SPEAKING' && '🗣️'}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tính năng đang phát triển</h2>
        <p className="text-gray-500 text-lg leading-relaxed">
          {skill.comingSoonMessage || 'Chúng tôi đang hoàn thiện tính năng này để mang lại trải nghiệm học tập tốt nhất cho bạn.'}
        </p>
      </div>
    </div>
  );
};
