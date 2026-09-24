import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

export const CTASection: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-green-700 via-green-600 to-green-500 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white rounded-full px-4 py-2 text-sm font-semibold mb-6">
          🚀 Bắt đầu ngay hôm nay — Miễn phí
        </div>

        <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
          Sẵn sàng chinh phục<br />
          <span className="text-green-200">IELTS cùng MLC?</span>
        </h2>

        <p className="text-green-100 text-lg mb-10 max-w-xl mx-auto">
          Tham gia cùng hơn 5,000 học viên đang học từ vựng IELTS thông minh hơn
          mỗi ngày với hệ thống của chúng tôi.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/student/register">
            <Button
              size="lg"
              className="bg-white text-green-700 hover:bg-green-50 shadow-xl"
            >
              Học viên — Đăng ký miễn phí
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
          <Link to="/teacher/register">
            <Button
              size="lg"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10"
            >
              Giáo viên — Tạo lớp học
            </Button>
          </Link>
        </div>

        <p className="text-green-200 text-sm mt-6">
          Không cần thẻ tín dụng · Đăng ký trong 30 giây · Bắt đầu học ngay
        </p>
      </div>
    </section>
  )
}
