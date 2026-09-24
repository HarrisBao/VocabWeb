import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../ui/Button'

const navLinks = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Khóa học', href: '/lessons' },
  { label: 'Về chúng tôi', href: '/#about' },
  { label: 'Liên hệ', href: '/#contact' },
]

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [prevPath, setPrevPath] = useState('')
  const location = useLocation()

  // Close mobile menu on route change
  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname)
    if (isMobileOpen) {
      setIsMobileOpen(false)
    }
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-green-100'
          : 'bg-white/80 backdrop-blur-sm',
      ].join(' ')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-green-700 transition-colors">
              <span className="text-white font-black text-[13px] tracking-wide">MLC</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-green-900 text-sm hidden sm:block">TRUNG TÂM ANH NGỮ THANH LÊ</span><span className="font-bold text-green-900 text-sm sm:hidden">MLC</span>
              <span className="text-green-600 text-[10px] sm:text-xs font-bold tracking-wide hidden sm:block">MLC - Magical Linguistic Center</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === link.href
                    ? 'bg-green-100 text-green-800'
                    : 'text-gray-700 hover:text-green-700 hover:bg-green-50',
                ].join(' ')}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/student/login">
              <Button variant="outline" size="sm">
                Học viên
              </Button>
            </Link>
            <Link to="/teacher/login">
              <Button variant="primary" size="sm">
                Giáo viên
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-green-700 hover:bg-green-50 transition-colors"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden bg-white border-t border-green-100 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-800 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <Link to="/student/login">
                <Button variant="outline" size="md" fullWidth>
                  Đăng nhập — Học viên
                </Button>
              </Link>
              <Link to="/teacher/login">
                <Button variant="primary" size="md" fullWidth>
                  Đăng nhập — Giáo viên
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
