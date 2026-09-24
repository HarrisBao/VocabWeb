import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, LogOut, ShieldCheck, GraduationCap, Settings, UserSquare2 } from 'lucide-react';
import { api } from '../../services/api';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navGroups = [
  {
    title: 'TỔNG QUAN',
    items: [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Bảng điều khiển' },
    ]
  },
  {
    title: 'QUẢN LÝ HỌC TẬP',
    items: [
      { to: '/admin/dashboard', icon: Building2, label: 'Lớp học & Phân công' }, // Reusing dashboard for now since it lists classes
      { to: '#', icon: UserSquare2, label: 'Giáo viên (Sắp ra mắt)' },
      { to: '#', icon: GraduationCap, label: 'Học sinh (Sắp ra mắt)' },
      { to: '#', icon: Users, label: 'Trợ giảng (Sắp ra mắt)' },
    ]
  },
  {
    title: 'VẬN HÀNH',
    items: [
      { to: '/admin/feedback',  icon: Settings, label: 'Chu kỳ phản hồi' },
    ]
  }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    api.clearAdminTokens();
    navigate('/admin/login');
  };

  const adminProfile = (() => {
    try {
      const raw = localStorage.getItem('admin_user_profile');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm tracking-wide">ADMIN PANEL</span>
          </div>
          <div className="text-[10px] text-gray-400 mt-1 uppercase">Trung tâm Anh ngữ Thanh Lê</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx} className="mb-6 px-3">
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to || (item.to !== '/admin/dashboard' && location.pathname.startsWith(item.to) && item.to !== '#');
                  const isDisabled = item.to === '#';
                  
                  return isDisabled ? (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-500 cursor-not-allowed"
                    >
                      <Icon className="w-4 h-4 opacity-50" />
                      {item.label}
                    </div>
                  ) : (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-gray-800">
          {adminProfile && (
            <div className="mb-3 px-2">
              <p className="text-sm font-medium text-white truncate">{adminProfile.fullName}</p>
              <p className="text-xs text-gray-400 truncate">{adminProfile.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-2 py-2 w-full text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
