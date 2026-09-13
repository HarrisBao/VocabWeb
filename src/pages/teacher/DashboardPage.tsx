import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { Card, Badge } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../contexts/AuthContext'

interface DashboardStats {
  totalVocabularySets: number
  totalClasses: number
  totalTests: number
  totalWords: number
  recentVocabularySets: Array<{
    id: number
    title: string
    description?: string
    level: string
    wordCount: number
    createdAt: string
  }>
  recentClasses: Array<{
    id: number
    name: string
    code: string
    lessonCount: number
    memberCount: number
    fixedLinkUrl: string
  }>
  recentTests: Array<{
    id: number
    title: string
    vocabularySetTitle: string
    className?: string
    totalQuestions: number
    attemptCount: number
    createdAt: string
  }>
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<DashboardStats>('/teacher/dashboard')
      setStats(data)
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu bảng điều khiển.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Đang tải dữ liệu thực tế...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700">
        <h3 className="text-lg font-bold mb-2">Lỗi tải dữ liệu</h3>
        <p className="text-sm mb-4">{error}</p>
        <Button onClick={fetchStats} size="sm">Thử lại</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider mb-3">
            IELTS Thanh Lê Teacher Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mb-2">
            Xin chào, {user?.fullName || 'Thầy/Cô'}!
          </h1>
          <p className="text-green-100 text-sm leading-relaxed mb-6">
            Hệ thống quản lý từ vựng và tạo bài kiểm tra tự động đã sẵn sàng. Bạn có thể soạn bộ từ, gán vào lớp và phát đề thi chỉ với vài bước.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/teacher/vocabulary/new">
              <Button variant="secondary" size="sm" className="font-bold">
                + Soạn bộ từ mới
              </Button>
            </Link>
            <Link to="/teacher/classes">
              <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                Quản lý lớp học
              </Button>
            </Link>
          </div>
        </div>
        {/* Background decorative circles */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bộ từ vựng</span>
            <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
              📚
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-gray-900">{stats?.totalVocabularySets ?? 0}</div>
            <p className="text-xs text-gray-500 mt-1">Đang hoạt động</p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lớp học</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              🏫
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-gray-900">{stats?.totalClasses ?? 0}</div>
            <p className="text-xs text-gray-500 mt-1">Lớp được quản lý</p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bài kiểm tra</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              📝
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-gray-900">{stats?.totalTests ?? 0}</div>
            <p className="text-xs text-gray-500 mt-1">Đã cấu hình</p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng số từ</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              🔤
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-gray-900">{stats?.totalWords ?? 0}</div>
            <p className="text-xs text-gray-500 mt-1">Từ vựng & định nghĩa</p>
          </div>
        </Card>
      </div>

      {/* Two columns: Recent Vocab Sets & Recent Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Vocabulary Sets */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-900">Bộ từ vựng gần đây</h2>
              <p className="text-xs text-gray-500">Các bộ từ bạn tạo gần nhất</p>
            </div>
            <Link to="/teacher/vocabulary" className="text-xs font-bold text-green-700 hover:text-green-800">
              Xem tất cả →
            </Link>
          </div>

          {stats?.recentVocabularySets && stats.recentVocabularySets.length > 0 ? (
            <div className="space-y-3">
              {stats.recentVocabularySets.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900 truncate">{s.title}</span>
                      <Badge variant="blue">{s.level}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{s.wordCount} từ vựng</p>
                  </div>
                  <Link to={`/teacher/vocabulary/${s.id}`}>
                    <Button variant="ghost" size="sm">Chỉnh sửa</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-xl">
              <p className="text-sm text-gray-500 mb-3">Chưa có bộ từ vựng nào</p>
              <Link to="/teacher/vocabulary/new">
                <Button size="sm">+ Tạo bộ từ vựng đầu tiên</Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Recent Classes */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-900">Lớp học gần đây</h2>
              <p className="text-xs text-gray-500">Các lớp học đang quản lý</p>
            </div>
            <Link to="/teacher/classes" className="text-xs font-bold text-green-700 hover:text-green-800">
              Xem tất cả →
            </Link>
          </div>

          {stats?.recentClasses && stats.recentClasses.length > 0 ? (
            <div className="space-y-3">
              {stats.recentClasses.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900 truncate">{c.name}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono font-bold">
                        {c.code}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {c.lessonCount} bài học • {c.memberCount} học sinh
                    </p>
                  </div>
                  <Link to={`/teacher/classes/${c.id}`}>
                    <Button variant="ghost" size="sm">Vào lớp</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-xl">
              <p className="text-sm text-gray-500 mb-3">Chưa tạo lớp học nào</p>
              <Link to="/teacher/classes">
                <Button size="sm">+ Tạo lớp học mới</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Tests Strip */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">Bài kiểm tra đã tạo</h2>
            <p className="text-xs text-gray-500">Cấu hình bài test ngẫu nhiên theo bộ từ</p>
          </div>
          <Link to="/teacher/tests/new">
            <Button size="sm">+ Tạo bài kiểm tra</Button>
          </Link>
        </div>

        {stats?.recentTests && stats.recentTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.recentTests.map((t) => (
              <div key={t.id} className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition-all">
                <h3 className="font-bold text-sm text-gray-900 mb-1">{t.title}</h3>
                <p className="text-xs text-gray-500 mb-3">Nguồn: {t.vocabularySetTitle}</p>
                <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
                  <span>{t.totalQuestions} câu hỏi</span>
                  <span>{t.attemptCount} lượt làm</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link to={`/teacher/tests/${t.id}`} className="flex-1">
                    <Button variant="outline" size="sm" fullWidth>Chi tiết</Button>
                  </Link>
                  <Link to={`/teacher/tests/${t.id}/results`} className="flex-1">
                    <Button variant="ghost" size="sm" fullWidth>Kết quả</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-gray-400">
            Chưa có bài kiểm tra nào được tạo. Nhấn "Tạo bài kiểm tra" để bắt đầu cấu hình đề thi từ bộ từ vựng.
          </div>
        )}
      </Card>
    </div>
  )
}
