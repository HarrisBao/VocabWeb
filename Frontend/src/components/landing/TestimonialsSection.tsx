import React from 'react'

const testimonials = [
  {
    name: 'Nguyễn Minh Anh',
    score: 'IELTS 7.5',
    avatar: 'MA',
    text: 'Nhờ hệ thống từ vựng của IELTS Thanh Lê, mình đã tăng từ 6.0 lên 7.5 chỉ trong 3 tháng. Cách học flashcard kết hợp IPA giúp mình nhớ từ rất lâu.',
    date: 'Tháng 6, 2025',
  },
  {
    name: 'Trần Quốc Bảo',
    score: 'IELTS 7.0',
    avatar: 'QB',
    text: 'Test engine của hệ thống rất đa dạng — từ trắc nghiệm đến kiểm tra phát âm. Giáo viên có thể giao bài và theo dõi điểm số của cả lớp rất tiện.',
    date: 'Tháng 5, 2025',
  },
  {
    name: 'Lê Thu Hà',
    score: 'IELTS 6.5',
    avatar: 'TH',
    text: 'Mình thích nhất phần spaced repetition — hệ thống tự nhắc lại những từ mình hay quên đúng lúc. Streak 30 ngày làm mình rất motivated!',
    date: 'Tháng 4, 2025',
  },
]

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-24 bg-white" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 rounded-full px-4 py-2 text-sm font-semibold mb-4">
            Học viên nói gì
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            Câu chuyện thành công{' '}
            <span className="text-green-600">từ học viên thực tế</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-green-50 rounded-2xl p-7 border border-green-100 flex flex-col gap-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-green-600 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">{t.avatar}</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    🎯 {t.score}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed italic">"{t.text}"</p>
              </div>

              <p className="text-gray-400 text-xs mt-auto">{t.date}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
