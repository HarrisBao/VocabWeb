import React from 'react'
import { Link } from 'react-router-dom'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-green-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
                <span className="text-green-700 font-black text-sm">ITL</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-white text-sm">IELTS Thanh Lê</span>
                <span className="text-green-300 text-xs">Learning Platform</span>
              </div>
            </div>
            <p className="text-green-200 text-sm leading-relaxed max-w-xs">
              Nền tảng học IELTS từ vựng toàn diện — từ flashcard thông minh đến
              kiểm tra phát âm IPA, giúp bạn tự tin chinh phục IELTS.
            </p>
            <div className="flex gap-3 mt-5">
              {/* Facebook */}
              <a
                href="#"
                className="w-9 h-9 bg-green-800 hover:bg-green-700 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="#"
                className="w-9 h-9 bg-green-800 hover:bg-green-700 rounded-lg flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Trang chủ', to: '/' },
                { label: 'Khóa học', to: '/lessons' },
                { label: 'Về chúng tôi', to: '/#about' },
                { label: 'Liên hệ', to: '/#contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-green-200 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4">Liên hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-green-200">
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Hà Nội, Việt Nam
              </li>
              <li className="flex items-center gap-2 text-sm text-green-200">
                <svg className="w-4 h-4 shrink-0 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@ieltsthanhle.vn
              </li>
              <li className="flex items-center gap-2 text-sm text-green-200">
                <svg className="w-4 h-4 shrink-0 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                0901 234 567
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-green-400 text-sm">
            © 2025 IELTS Thanh Lê Learning. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex gap-4 text-sm">
            <a href="#" className="text-green-400 hover:text-white transition-colors">
              Điều khoản sử dụng
            </a>
            <a href="#" className="text-green-400 hover:text-white transition-colors">
              Chính sách bảo mật
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
