import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { SKILLS_LIST } from '../../config/skills';

export const StudentHomePage: React.FC = () => {
  const { classSlug } = useParams<{ classSlug?: string }>();
  const basePath = classSlug ? `/class/${classSlug}/portal` : '/student';

  let profileName = 'Học viên ✌️';
  let className = '';
  if (classSlug) {
    const stored = localStorage.getItem('student_profile');
    if (stored) {
      try {
        const p = JSON.parse(stored);
        profileName = p.fullName;
        className = `Lớp ${p.className || classSlug}`;
      } catch {}
    }
  }
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-dark to-brand p-8 rounded-2xl shadow-md text-white">
        <h1 className="text-3xl font-black text-white mb-2">Xin chào, {profileName}</h1>
        {className ? (
          <p className="text-brand-light opacity-90">{className}</p>
        ) : (
          <p className="text-brand-light opacity-90">Chào mừng bạn đến với hệ thống học tập IELTS Thanh Lê.</p>
        )}
      </div>

      {/* Skills Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          HỌC KỸ NĂNG
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SKILLS_LIST.map(skill => {
            const isActive = skill.status === 'ACTIVE';
            
            return (
              <Link 
                key={skill.id}
                to={`${basePath}/${skill.id}`}
                className={`p-6 rounded-2xl border-2 transition-all block relative overflow-hidden group ${
                  isActive 
                    ? 'border-brand-light bg-surface hover:border-brand hover:shadow-md' 
                    : 'border-surface-hover bg-surface-muted hover:bg-gray-50 opacity-80'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl mb-4 ${skill.accentClass}`}>
                  {skill.label.charAt(0)}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">{skill.label}</h3>
                <p className="text-sm text-gray-600 mb-6">{skill.description}</p>
                
                {isActive ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-700 group-hover:text-gray-900 group-hover:translate-x-1 transition-transform">
                    Vào học
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-400">
                    Sắp ra mắt
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
