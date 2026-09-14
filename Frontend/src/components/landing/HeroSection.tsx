import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/50 flex items-center overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-green-100/60 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-green-50 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Text */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 rounded-full px-4 py-2 text-sm font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Nền tảng học IELTS #1 Việt Nam
            </div>

            <h1 className="text-5xl sm:text-6xl font-black text-gray-900 leading-tight mb-6">
              Học từ vựng{' '}
              <span className="text-green-600 relative">
                IELTS
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 8C50 3 100 10 198 4"
                    stroke="#16a34a"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              {' '}thông minh hơn
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-xl">
              Hệ thống học từ vựng thông minh với <strong className="text-green-700">IPA phát âm</strong>,
              flashcard spaced repetition, kiểm tra tự động và theo dõi tiến trình chi tiết.
              Cùng <strong className="text-green-700">Cô Thanh Lê</strong> chinh phục IELTS!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/student/register">
                <Button variant="primary" size="lg">
                  Bắt đầu học miễn phí
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link to="/lessons">
                <Button variant="outline" size="lg">
                  Xem khóa học
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4">
              {/* Avatars */}
              <div className="flex -space-x-2">
                {['TH', 'MN', 'QA', 'LA'].map((initials, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white flex items-center justify-center"
                  >
                    <span className="text-white text-xs font-bold">{initials}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  <strong className="text-gray-900">5,000+</strong> học viên tin dùng
                </p>
              </div>
            </div>
          </div>

          {/* Right — Visual */}
          <div className="relative">
            {/* Main card */}
            <div className="bg-white rounded-3xl shadow-2xl border border-green-100 p-8">
              {/* Vocabulary card preview */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-green-100 rounded-full px-3 py-1 text-xs font-semibold text-green-700 mb-4">
                  IELTS Academic Vocabulary
                </div>
                <h3 className="text-4xl font-black text-gray-900 mb-1">Ambiguous</h3>
                <p className="text-green-600 font-mono text-sm mb-3">/æmˈbɪɡ.ju.əs/</p>
                <p className="text-gray-500 text-sm mb-1">Tính từ</p>
                <p className="text-gray-800 font-medium">Mơ hồ, không rõ ràng</p>
                <p className="text-gray-500 text-sm mt-2 italic">
                  "The instructions were <span className="text-green-600 not-italic font-semibold">ambiguous</span> and confusing."
                </p>
              </div>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Tiến độ hôm nay</span>
                  <span className="font-semibold text-green-600">24/30 từ</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-gradient-to-r from-green-500 to-green-600 rounded-full" />
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Khó', color: 'bg-red-50 text-red-600 border-red-100' },
                  { label: 'Ổn', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
                  { label: 'Dễ', color: 'bg-green-50 text-green-700 border-green-200' },
                ].map(btn => (
                  <button
                    key={btn.label}
                    className={`py-2 rounded-xl text-sm font-semibold border transition-all hover:shadow-sm ${btn.color}`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg border border-green-100 px-4 py-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">IELTS 7.5</p>
                <p className="text-xs text-gray-500">Nguyễn Minh Anh</p>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg border border-green-100 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs font-bold text-gray-900">Streak hôm nay</span>
              </div>
              <p className="text-2xl font-black text-green-600">🔥 7 ngày</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
