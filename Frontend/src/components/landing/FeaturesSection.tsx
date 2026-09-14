import React from 'react'
import { Card } from '../ui/Card'

const features = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'Từ vựng IELTS chuẩn',
    desc: 'Hơn 10,000 từ vựng IELTS được phân loại theo chủ đề, cấp độ và tần suất xuất hiện trong đề thi.',
    color: 'text-green-600 bg-green-100',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    ),
    title: 'Phát âm IPA chuẩn xác',
    desc: 'Mỗi từ đều có phiên âm IPA đầy đủ và audio phát âm chuẩn British/American English.',
    color: 'text-blue-600 bg-blue-100',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    title: 'Kiểm tra đa dạng',
    desc: 'Trắc nghiệm, điền từ, nối nghĩa, kiểm tra phát âm — engine tự động tạo đề từ từ vựng của bạn.',
    color: 'text-purple-600 bg-purple-100',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Spaced Repetition',
    desc: 'Thuật toán lặp lại thông minh giúp ghi nhớ từ vựng lâu dài với thời gian học tối thiểu.',
    color: 'text-orange-600 bg-orange-100',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Quản lý lớp học',
    desc: 'Giáo viên tạo lớp, giao bài, theo dõi tiến trình học viên và xuất báo cáo chi tiết.',
    color: 'text-teal-600 bg-teal-100',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Gradebook & Analytics',
    desc: 'Theo dõi điểm số, lịch sử làm bài, streak học tập và phân tích điểm yếu cần cải thiện.',
    color: 'text-rose-600 bg-rose-100',
  },
]

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-24 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 rounded-full px-4 py-2 text-sm font-semibold mb-4">
            Tính năng nổi bật
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            Tất cả những gì bạn cần để{' '}
            <span className="text-green-600">chinh phục IELTS</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Từ học từ vựng, luyện phát âm đến kiểm tra và theo dõi tiến trình — mọi thứ trong một nền tảng.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} hover padding="lg">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
