import React from 'react'
import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  role: 'teacher' | 'student'
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  role,
}) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-green-700 via-green-600 to-green-500 relative overflow-hidden flex-col justify-between p-12">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-white/5 rounded-full" />
        </div>

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-3 group">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow shrink-0">
            <span className="text-green-700 font-black text-lg">MLC</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-white text-base">Magical Linguistic Center</span>
            <span className="text-green-200 text-sm font-medium">TRUNG TÂM ANH NGỮ THANH LÊ</span>
          </div>
        </Link>

        {/* Center content */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
            <span className="text-green-100 text-sm font-medium">
              {role === 'teacher' ? 'Cổng giáo viên' : 'Cổng học viên'}
            </span>
          </div>

          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Chinh phục<br />
            <span className="text-green-200">IELTS</span> cùng<br />
            Thanh Lê
          </h2>
          <p className="text-green-100 text-base leading-relaxed max-w-sm">
            Hệ thống học từ vựng thông minh với IPA, flashcard, kiểm tra tự động
            và theo dõi tiến trình chi tiết.
          </p>

          {/* Stats */}
          <div className="flex gap-6 mt-8">
            {[
              { value: '5,000+', label: 'Học viên' },
              { value: '200+', label: 'Bài học' },
              { value: '95%', label: 'Hài lòng' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-green-300 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-5">
          <svg className="w-6 h-6 text-green-300 mb-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <p className="text-green-100 text-sm italic leading-relaxed">
            "Học từ vựng IELTS không chỉ là ghi nhớ — đó là hiểu cách từ ngữ sống trong ngữ cảnh."
          </p>
          <div className="flex items-center gap-2.5 mt-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">TL</span>
            </div>
            <span className="text-green-200 text-xs font-medium">Cô Thanh Lê — Giáo viên IELTS</span>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-white">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white font-black text-sm">MLC</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-green-900">Magical Linguistic Center</span>
              <span className="text-green-700 text-xs">TRUNG TÂM ANH NGỮ THANH LÊ</span>
            </div>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">{title}</h1>
            {subtitle && (
              <p className="text-gray-500 text-sm leading-relaxed">{subtitle}</p>
            )}
          </div>

          {/* Form content */}
          {children}
        </div>

        {/* Back to home */}
        <div className="max-w-md w-full mx-auto mt-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-700 transition-colors group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}
