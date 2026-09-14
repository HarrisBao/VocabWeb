import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../../components/layout/Navbar'
import { Footer } from '../../components/layout/Footer'
import { Badge } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

type Level = 'all' | 'beginner' | 'intermediate' | 'advanced'

const lessons = [
  {
    id: 1,
    title: 'IELTS Academic Vocabulary — Band 6.0',
    level: 'beginner' as Level,
    levelLabel: 'Beginner',
    levelVariant: 'blue' as const,
    wordCount: 500,
    lessonCount: 10,
    topics: ['Environment', 'Health', 'Education'],
    locked: false,
    description: 'Từ vựng nền tảng IELTS. Phù hợp với người mới bắt đầu hành trình IELTS.',
    completedBy: 1240,
  },
  {
    id: 2,
    title: 'IELTS Reading Key Words',
    level: 'beginner' as Level,
    levelLabel: 'Beginner',
    levelVariant: 'blue' as const,
    wordCount: 350,
    lessonCount: 7,
    topics: ['Skimming', 'Scanning', 'Context'],
    locked: false,
    description: 'Từ vựng then chốt giúp đọc hiểu nhanh và chính xác trong IELTS Reading.',
    completedBy: 980,
  },
  {
    id: 3,
    title: 'IELTS Academic Vocabulary — Band 7.0',
    level: 'intermediate' as Level,
    levelLabel: 'Intermediate',
    levelVariant: 'yellow' as const,
    wordCount: 800,
    lessonCount: 16,
    topics: ['Science', 'Economy', 'Culture', 'Technology'],
    locked: true,
    description: 'Từ vựng học thuật nâng cao. Mục tiêu band 7.0 cho kỳ thi Academic.',
    completedBy: 720,
  },
  {
    id: 4,
    title: 'IELTS Speaking Vocabulary & Idioms',
    level: 'intermediate' as Level,
    levelLabel: 'Intermediate',
    levelVariant: 'yellow' as const,
    wordCount: 400,
    lessonCount: 8,
    topics: ['Part 1', 'Part 2', 'Part 3', 'Idioms'],
    locked: true,
    description: 'Từ vựng, idioms và cụm từ nói cho cả 3 phần thi Speaking IELTS.',
    completedBy: 650,
  },
  {
    id: 5,
    title: 'AWL — Academic Word List Sublist 1-5',
    level: 'advanced' as Level,
    levelLabel: 'Advanced',
    levelVariant: 'red' as const,
    wordCount: 570,
    lessonCount: 12,
    topics: ['AWL', 'Academic', 'Research Writing'],
    locked: true,
    description: '570 từ học thuật quan trọng nhất trong tiếng Anh học thuật theo Oxford.',
    completedBy: 420,
  },
  {
    id: 6,
    title: 'IELTS Writing Task 2 — Collocations',
    level: 'advanced' as Level,
    levelLabel: 'Advanced',
    levelVariant: 'red' as const,
    wordCount: 300,
    lessonCount: 6,
    topics: ['Collocations', 'Phrases', 'Connectors'],
    locked: true,
    description: 'Cụm từ và collocation đặc biệt giúp Writing Task 2 đạt band cao.',
    completedBy: 380,
  },
]

const filterLabels: Record<Level, string> = {
  all: 'Tất cả',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export const PublicLessonsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<Level>('all')

  const filtered = activeFilter === 'all'
    ? lessons
    : lessons.filter(l => l.level === activeFilter)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-green-700 to-green-500 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white rounded-full px-4 py-2 text-sm font-semibold mb-4">
            📚 Thư viện khóa học
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Khám phá bộ từ vựng IELTS
          </h1>
          <p className="text-green-100 text-lg max-w-xl mx-auto">
            Hơn 10,000 từ vựng IELTS được tuyển chọn và phân loại theo cấp độ, chủ đề.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {(Object.keys(filterLabels) as Level[]).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={[
                'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                activeFilter === f
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-green-300 hover:text-green-700',
              ].join(' ')}
            >
              {filterLabels[f]}
              <span className={`ml-2 text-xs ${activeFilter === f ? 'text-green-200' : 'text-gray-400'}`}>
                ({f === 'all' ? lessons.length : lessons.filter(l => l.level === f).length})
              </span>
            </button>
          ))}
        </div>

        {/* Lessons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(lesson => (
            <div
              key={lesson.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <Badge variant={lesson.levelVariant}>{lesson.levelLabel}</Badge>
                  {lesson.locked ? (
                    <div className="flex items-center gap-1 text-gray-400 text-xs shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Yêu cầu đăng nhập
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-green-600 text-xs font-semibold shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      Miễn phí
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-gray-900 mb-2">{lesson.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{lesson.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {lesson.topics.map(t => (
                    <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-green-50 rounded-xl p-2">
                    <div className="font-bold text-green-700">{lesson.wordCount}</div>
                    <div className="text-gray-500 mt-0.5">từ vựng</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-2">
                    <div className="font-bold text-green-700">{lesson.lessonCount}</div>
                    <div className="text-gray-500 mt-0.5">bài học</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-2">
                    <div className="font-bold text-green-700">{lesson.completedBy.toLocaleString()}</div>
                    <div className="text-gray-500 mt-0.5">đã học</div>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-5">
                {lesson.locked ? (
                  <Link to="/student/register">
                    <Button variant="outline" size="sm" fullWidth>
                      Đăng ký để mở khóa
                    </Button>
                  </Link>
                ) : (
                  <Link to="/student/login">
                    <Button variant="primary" size="sm" fullWidth>
                      Bắt đầu học ngay
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-12 bg-green-600 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-black text-white mb-2">
            Mở khóa toàn bộ thư viện từ vựng
          </h3>
          <p className="text-green-100 mb-6">
            Đăng ký miễn phí để truy cập tất cả {lessons.length} bộ từ vựng và tính năng học thông minh.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/student/register">
              <Button size="lg" className="bg-white text-green-700 hover:bg-green-50">
                Đăng ký miễn phí
              </Button>
            </Link>
            <Link to="/student/login">
              <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white/10">
                Đã có tài khoản
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
