import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { SKILLS_LIST } from '../../config/skills';

export const StudentLayout: React.FC = () => {
  const location = useLocation();
  const { classSlug } = useParams<{ classSlug?: string }>();
  const basePath = classSlug ? `/class/${classSlug}/portal` : `/student`;
  const [profileName, setProfileName] = useState<string>('HV');

  useEffect(() => {
    if (classSlug) {
      const stored = localStorage.getItem('student_profile');
      if (stored) {
        try {
          const p = JSON.parse(stored);
          setProfileName(p.fullName.slice(0, 2).toUpperCase());
        } catch {}
      }
    }
  }, [classSlug]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to={basePath} className="font-black text-xl text-green-600 tracking-tight">
              IELTS Thanh Lê
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to={basePath}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                  location.pathname === basePath 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Trang chủ
              </Link>
              {SKILLS_LIST.map(skill => (
                <Link
                  key={skill.id}
                  to={`${basePath}/${skill.id}`}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                    location.pathname.startsWith(`${basePath}/${skill.id}`)
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {skill.label}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {classSlug && (
              <button
                onClick={() => {
                  localStorage.removeItem('student_access_token');
                  localStorage.removeItem('student_profile');
                  window.location.href = `/class/${classSlug}/portal`;
                }}
                className="text-sm font-bold text-gray-500 hover:text-gray-900"
              >
                Đổi học sinh
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
              {profileName}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-30">
        <div className="flex items-center justify-around h-16 px-2">
          <Link
            to={basePath}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              location.pathname === basePath ? 'text-green-600' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
          </Link>
          {SKILLS_LIST.map(skill => (
            <Link
              key={skill.id}
              to={`${basePath}/${skill.id}`}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                location.pathname.startsWith(`${basePath}/${skill.id}`) ? 'text-green-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="text-[11px] font-black">{skill.label.charAt(0)}</div>
              <span className="text-[10px] font-bold uppercase tracking-wider">{skill.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};
