import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SKILLS_LIST } from '../../config/skills';
import { NotificationBell } from '../shared/NotificationBell';
import { api } from '../../services/api';
import { ChevronDown, Menu, X, BookOpen, Headphones, PenLine, Mic, User, LogOut, ArrowLeftRight } from 'lucide-react';

export function StudentNavbar({ classSlug, basePath }: { classSlug?: string, basePath: string }) {
  const location = useLocation();
  const [token, setToken] = useState<string | null>(localStorage.getItem('student_access_token'));
  const [profile, setProfile] = useState<any>(null);
  
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const skillsRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (skillsRef.current && !skillsRef.current.contains(e.target as Node)) setIsSkillsOpen(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setIsAvatarOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('student_profile');
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const handleLogout = () => {
    api.clearTokens();
    window.location.href = classSlug ? `/class/${classSlug}/portal/login` : '/';
  };

  const getInitials = (name: string) => {
    if (!name) return 'HV';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const activeSkill = SKILLS_LIST.find(s => location.pathname.startsWith(`${basePath}/${s.id}`));
  const isHomeActive = location.pathname === basePath;

  const getIcon = (id: string) => {
    switch (id) {
      case 'reading': return <BookOpen className="w-4 h-4" />;
      case 'listening': return <Headphones className="w-4 h-4" />;
      case 'writing': return <PenLine className="w-4 h-4" />;
      case 'speaking': return <Mic className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <header className="bg-surface border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* LEFT CLUSTER */}
        <div className="flex items-center gap-6 h-full">
          <Link to={basePath} className="font-black text-xl text-brand tracking-tight flex-shrink-0">
            IELTS Thanh Lê
          </Link>
          
          <nav className="hidden md:flex items-center gap-2 h-full">
            <Link
              to={basePath}
              className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                isHomeActive ? 'bg-brand-light text-brand' : 'text-gray-600 hover:bg-surface-hover hover:text-gray-900'
              }`}
            >
              Trang chủ
            </Link>

            {/* Skills Dropdown */}
            <div className="relative h-full flex items-center" ref={skillsRef}>
              <button
                onClick={() => setIsSkillsOpen(!isSkillsOpen)}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1 ${
                  activeSkill || isSkillsOpen ? 'bg-brand-light text-brand' : 'text-gray-600 hover:bg-surface-hover hover:text-gray-900'
                }`}
              >
                Kỹ năng <ChevronDown className="w-4 h-4" />
              </button>

              {isSkillsOpen && (
                <div className="absolute top-[calc(100%-8px)] left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                  {SKILLS_LIST.map(skill => {
                    const isAvailable = skill.status === 'ACTIVE';
                    const isActive = location.pathname.startsWith(`${basePath}/${skill.id}`);
                    
                    return (
                      <Link
                        key={skill.id}
                        to={isAvailable ? `${basePath}/${skill.id}` : '#'}
                        onClick={() => setIsSkillsOpen(false)}
                        className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
                          isAvailable ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-60 cursor-default'
                        } ${isActive ? 'bg-brand-light/30 text-brand' : 'text-gray-700'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`p-1.5 rounded-md ${isActive ? 'bg-brand-light text-brand' : 'bg-gray-100 text-gray-500'}`}>
                            {getIcon(skill.id)}
                          </span>
                          <span className="font-semibold text-sm">{skill.label}</span>
                        </div>
                        {!isAvailable && (
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wider">
                            Soon
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* RIGHT CLUSTER */}
        <div className="flex items-center gap-2 md:gap-4 h-full">
          {token ? (
            <>
              <NotificationBell classSlug={classSlug} />
              
              {/* Avatar Dropdown */}
              <div className="relative h-full flex items-center ml-2" ref={avatarRef}>
                <button
                  onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                  className="w-9 h-9 rounded-full bg-brand-light text-brand flex items-center justify-center font-bold text-sm border-2 border-transparent hover:border-brand transition-all"
                >
                  {getInitials(profile?.fullName)}
                </button>

                {isAvatarOpen && (
                  <div className="absolute top-[calc(100%-8px)] right-0 w-60 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 mb-2">
                      <p className="font-bold text-sm text-gray-900 truncate">{profile?.fullName || 'Học viên'}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {classSlug ? 'Học viên lớp ' + classSlug.toUpperCase() : 'Học viên'}
                      </p>
                    </div>

                    {!classSlug && (
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 font-medium cursor-not-allowed opacity-50">
                        <User className="w-4 h-4 text-gray-400" /> Hồ sơ (Soon)
                      </button>
                    )}
                    
                    {classSlug && (
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 font-medium transition-colors"
                      >
                        <ArrowLeftRight className="w-4 h-4 text-gray-400" /> Đổi học sinh
                      </button>
                    )}

                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-500" /> {classSlug ? 'Thoát' : 'Đăng xuất'}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/student/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 px-3 py-2">
                Đăng nhập
              </Link>
              <Link to="/student/register" className="text-sm font-bold bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors">
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* MOBILE SHEET */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-black/20 flex justify-end">
          <div className="w-72 bg-white h-full shadow-2xl flex flex-col">
            <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100">
              <span className="font-black text-lg text-brand">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <div className="px-4 space-y-1 mb-6">
                <Link
                  to={basePath}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-bold ${isHomeActive ? 'bg-brand-light text-brand' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Trang chủ
                </Link>
              </div>

              <div className="px-4 mb-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-4">Kỹ năng</h4>
                <div className="space-y-1">
                  {SKILLS_LIST.map(skill => {
                    const isAvailable = skill.status === 'ACTIVE';
                    const isActive = location.pathname.startsWith(`${basePath}/${skill.id}`);
                    return (
                      <Link
                        key={skill.id}
                        to={isAvailable ? `${basePath}/${skill.id}` : '#'}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                          isAvailable ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-60'
                        } ${isActive ? 'bg-brand-light text-brand font-bold' : 'text-gray-700 font-medium'}`}
                      >
                        <span className={`p-1.5 rounded-md ${isActive ? 'bg-brand-light text-brand' : 'bg-gray-100 text-gray-500'}`}>
                          {getIcon(skill.id)}
                        </span>
                        {skill.label}
                        {!isAvailable && (
                          <span className="ml-auto text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wider">
                            Soon
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {!token && (
              <div className="p-4 border-t border-gray-100 space-y-2">
                <Link to="/student/login" className="flex items-center justify-center w-full py-2.5 text-sm font-bold text-gray-700 bg-gray-100 rounded-lg">
                  Đăng nhập
                </Link>
                <Link to="/student/register" className="flex items-center justify-center w-full py-2.5 text-sm font-bold text-white bg-brand rounded-lg">
                  Đăng ký
                </Link>
              </div>
            )}
            
            {token && (
              <div className="p-4 border-t border-gray-100">
                <button 
                  onClick={handleLogout}
                  className="flex items-center justify-center w-full py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors gap-2"
                >
                  <LogOut className="w-4 h-4" /> {classSlug ? 'Thoát' : 'Đăng xuất'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
