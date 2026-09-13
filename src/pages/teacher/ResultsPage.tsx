import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { Card, Badge } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

interface AttemptItem {
  id: number
  testId: number
  testTitle: string
  studentId?: string
  studentName: string
  studentEmail?: string
  isGuest?: boolean
  score: number
  correctCount: number
  totalQuestions: number
  durationSeconds: number
  startedAt: string
  submittedAt: string | null
  isPassed: boolean
}

interface ResultsOverview {
  totalAttempts: number
  averageScore: number | null
  passRate: number | null
  recentAttempts: AttemptItem[]
}

export const ResultsPage: React.FC = () => {
  const { id: routeTestId } = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()
  const testId = routeTestId || searchParams.get('testId')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overview, setOverview] = useState<ResultsOverview | null>(null)
  const [attempts, setAttempts] = useState<AttemptItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'passed' | 'failed'>('all')

  useEffect(() => {
    loadResults()
  }, [testId])

  const loadResults = async () => {
    setLoading(true)
    setError(null)
    try {
      if (testId) {
        // Load specific test results
        const data = await api.get<AttemptItem[]>(`/teacher/tests/${testId}/results`)
        setAttempts(data)
        const total = data.length
        const avg = total > 0 ? Math.round((data.reduce((acc, curr) => acc + curr.score, 0) / total) * 10) / 10 : null
        const passedCount = data.filter(d => d.isPassed).length
        const passRate = total > 0 ? Math.round((passedCount / total) * 1000) / 10 : null
        setOverview({
          totalAttempts: total,
          averageScore: avg,
          passRate,
          recentAttempts: data
        })
      } else {
        // Load overall teacher results overview
        const data = await api.get<ResultsOverview>('/teacher/results')
        setOverview(data)
        setAttempts(data.recentAttempts || [])
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải kết quả kiểm tra.')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const filteredAttempts = attempts.filter(item => {
    const matchesSearch =
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.testTitle.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterStatus === 'passed') return matchesSearch && item.isPassed
    if (filterStatus === 'failed') return matchesSearch && !item.isPassed
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Đang tải kết quả học tập...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Kết quả học tập & Kiểm tra</h1>
            {testId && (
              <Badge variant="blue">Lọc theo bài #{testId}</Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi tiến độ, điểm số và lịch sử làm bài kiểm tra của học sinh
          </p>
        </div>
        <div className="flex items-center gap-3">
          {testId && (
            <Link to="/teacher/results">
              <Button variant="outline" size="sm">
                Xem tất cả bài kiểm tra
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={loadResults}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Stats KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card padding="md" className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng lượt nộp bài</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">
                {overview?.totalAttempts ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Lượt làm bài được ghi nhận từ học sinh</p>
        </Card>

        <Card padding="md" className="border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Điểm trung bình</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">
                {overview?.averageScore !== null && overview?.averageScore !== undefined
                  ? `${overview.averageScore} / 10`
                  : '—'}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Thang điểm 10 chuẩn hóa toàn hệ thống</p>
        </Card>

        <Card padding="md" className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tỷ lệ đạt chuẩn</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">
                {overview?.passRate !== null && overview?.passRate !== undefined
                  ? `${overview.passRate}%`
                  : '—'}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Đạt điểm chuẩn cấu hình của bài test</p>
        </Card>
      </div>

      {/* Main Attempts Card */}
      <Card padding="none" className="overflow-hidden">
        {/* Filters bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Tìm theo tên học sinh, email, bài test..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Tất cả ({attempts.length})
            </button>
            <button
              onClick={() => setFilterStatus('passed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === 'passed'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Đạt ({attempts.filter(a => a.isPassed).length})
            </button>
            <button
              onClick={() => setFilterStatus('failed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === 'failed'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Chưa đạt ({attempts.filter(a => !a.isPassed).length})
            </button>
          </div>
        </div>

        {/* Table / Empty State */}
        {filteredAttempts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Học sinh</th>
                  <th className="py-3 px-4">Bài kiểm tra</th>
                  <th className="py-3 px-4 text-center">Điểm số</th>
                  <th className="py-3 px-4 text-center">Số câu đúng</th>
                  <th className="py-3 px-4 text-center">Thời gian</th>
                  <th className="py-3 px-4">Ngày nộp bài</th>
                  <th className="py-3 px-4 text-center">Kết quả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAttempts.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-semibold text-gray-900 flex items-center gap-2">
                            {item.studentName || 'Học sinh'}
                            {item.isGuest && (
                              <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-bold uppercase rounded">
                                Khách
                              </span>
                            )}
                          </p>
                          {item.studentEmail && <p className="text-xs text-gray-400">{item.studentEmail}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{item.testTitle}</span>
                        <Link
                          to={`/teacher/tests/${item.testId}`}
                          className="text-xs text-green-600 hover:underline"
                        >
                          (Chi tiết đề)
                        </Link>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg font-bold text-sm ${
                          item.isPassed
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.score.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-gray-700">
                      {item.correctCount} / {item.totalQuestions}
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs text-gray-500 font-mono">
                      {formatDuration(item.durationSeconds)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">
                      {item.submittedAt
                        ? new Date(item.submittedAt).toLocaleString('vi-VN')
                        : new Date(item.startedAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.isPassed ? (
                        <Badge variant="green">ĐẠT</Badge>
                      ) : (
                        <Badge variant="red">CHƯA ĐẠT</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 px-4 text-center">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">
              {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có lượt làm bài nào'}
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              {searchTerm
                ? 'Vui lòng thử từ khóa tìm kiếm khác hoặc xóa bộ lọc để xem toàn bộ danh sách.'
                : 'Khi học sinh làm bài kiểm tra trong lớp học hoặc qua liên kết đề thi, kết quả chi tiết và điểm số sẽ được ghi nhận và hiển thị đầy đủ tại đây.'}
            </p>
            {searchTerm ? (
              <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                Xóa bộ lọc tìm kiếm
              </Button>
            ) : (
              <Link to="/teacher/tests">
                <Button variant="primary" size="sm">
                  Quản lý danh sách bài kiểm tra
                </Button>
              </Link>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
