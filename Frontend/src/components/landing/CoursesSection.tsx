import React from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../ui/Card'
import { Button } from '../ui/Button'

const courses = [
  {
    title: 'IELTS Academic Vocabulary — Band 6.0',
    level: 'Beginner',
    levelVariant: 'blue' as const,
    wordCount: 500,
    topics: ['Environment', 'Health', 'Education'],
    locked: false,
    description: 'Từ vựng nền tảng IELTS dành cho học viên mục tiêu band 6.0.',
  },
  {
    title: 'IELTS Academic Vocabulary — Band 7.0',
    level: 'Intermediate',
    levelVariant: 'yellow' as const,
    wordCount: 800,
    topics: ['Science', 'Economy', 'Culture'],
    locked: true,
    description: 'Từ vựng học thuật nâng cao giúp chinh phục band 7.0.',
  },
  {
    title: 'IELTS Writing Task 2 Collocations',
    level: 'Advanced',
    levelVariant: 'red' as const,
    wordCount: 300,
    topics: ['Collocations', 'Phrases', 'Connectors'],
    locked: true,
    description: 'Cụm từ và collocation đặc biệt cho Writing Task 2.',
  },
  {
    title: 'IELTS Speaking Vocabulary',
    level: 'Intermediate',
    levelVariant: 'yellow' as const,
    wordCount: 400,
    topics: ['Part 1', 'Part 2', 'Part 3'],
    locked: true,
    description: 'Từ vựng và idioms cho phần thi Speaking IELTS.',
  },
  {
    title: 'AWL — Academic Word List',
    level: 'Advanced',
    levelVariant: 'red' as const,
    wordCount: 570,
    topics: ['AWL Sublist 1-5', 'Academic'],
    locked: true,
    description: 'Danh sách 570 từ học thuật quan trọng nhất trong tiếng Anh.',
  },
  {
    title: 'IELTS Reading Key Words',
    level: 'Beginner',
    levelVariant: 'blue' as const,
    wordCount: 350,
    topics: ['Skimming', 'Scanning', 'Context'],
    locked: false,
    description: 'Từ vựng then chốt giúp đọc hiểu nhanh và chính xác trong IELTS.',
  },
]

export const CoursesSection: React.FC = () => {
  return (
    <section className="py-24 bg-green-50" id="courses">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 rounded-full px-4 py-2 text-sm font-semibold mb-4">
            Khóa học từ vựng
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            Bộ từ vựng được{' '}
            <span className="text-green-600">tuyển chọn kỹ càng</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Mỗi bộ từ vựng được biên soạn dựa trên phân tích đề thi IELTS thực tế từ 2018–2025.
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
            >
              {/* Card Header */}
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <Badge variant={course.levelVariant}>{course.level}</Badge>
                  {course.locked ? (
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Yêu cầu đăng nhập
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      Miễn phí
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-gray-900 mb-2 leading-tight">{course.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{course.description}</p>

                {/* Topics */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {course.topics.map(t => (
                    <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Word count */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span><strong className="text-green-700">{course.wordCount}</strong> từ vựng</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 pb-5">
                {course.locked ? (
                  <Link to="/student/register">
                    <Button variant="outline" size="sm" fullWidth>
                      Đăng ký để học
                    </Button>
                  </Link>
                ) : (
                  <Link to="/lessons">
                    <Button variant="primary" size="sm" fullWidth>
                      Bắt đầu học ngay
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/lessons">
            <Button variant="secondary" size="lg">
              Xem tất cả khóa học
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
