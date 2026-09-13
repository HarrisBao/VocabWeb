import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { Card, Badge } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

interface VocabularySetItem {
  id: number
  title: string
  description?: string
  level: string
  isPublic: boolean
  wordCount: number
  createdAt: string
  updatedAt?: string
}

export const VocabularyListPage: React.FC = () => {
  const [sets, setSets] = useState<VocabularySetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('all')
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchSets()
  }, [level])

  const fetchSets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.append('search', search.trim())
      if (level !== 'all') params.append('level', level)

      const res = await api.get<VocabularySetItem[]>(`/teacher/vocabulary?${params.toString()}`)
      setSets(res)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Không thể tải danh sách bộ từ vựng.' })
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSets()
  }

  const handleDuplicate = async (id: number) => {
    setActionLoading(id)
    try {
      await api.post(`/teacher/vocabulary/${id}/duplicate`)
      setMessage({ type: 'success', text: 'Nhân bản bộ từ vựng thành công!' })
      fetchSets()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Nhân bản thất bại.' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bộ từ vựng "${title}"?`)) return

    setActionLoading(id)
    try {
      await api.delete(`/teacher/vocabulary/${id}`)
      setMessage({ type: 'success', text: 'Đã xóa bộ từ vựng.' })
      setSets(sets.filter(s => s.id !== id))
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Xóa thất bại.' })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Quản lý Bộ từ vựng</h1>
          <p className="text-sm text-gray-500 mt-1">
            Soạn thảo, import Excel/CSV và quản lý kho từ vựng ôn luyện IELTS của bạn.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/teacher/vocabulary/new">
            <Button size="md" className="font-bold shadow-sm">
              + Soạn bộ từ mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Message alert */}
      {message && (
        <div
          className={[
            'p-4 rounded-xl text-sm flex items-center justify-between border',
            message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          ].join(' ')}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={level}
              onChange={e => setLevel(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Tất cả trình độ</option>
              <option value="Beginner">Beginner (4.5 - 5.5)</option>
              <option value="Intermediate">Intermediate (6.0 - 6.5)</option>
              <option value="Advanced">Advanced (7.0+)</option>
            </select>

            <Button type="submit" variant="secondary" size="sm">
              Tìm kiếm
            </Button>
          </div>
        </form>
      </Card>

      {/* Sets Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        </div>
      ) : sets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets.map((set) => (
            <Card key={set.id} hover className="flex flex-col justify-between p-6">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="primary">{set.level}</Badge>
                  <span className="text-xs text-gray-500 font-medium">
                    {set.wordCount} từ
                  </span>
                </div>

                <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1">{set.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                  {set.description || 'Chưa có mô tả cho bộ từ vựng này.'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Link to={`/teacher/vocabulary/${set.id}`} className="flex-1">
                    <Button variant="primary" size="sm" fullWidth>
                      Chỉnh sửa & Xem từ
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(set.id)}
                    loading={actionLoading === set.id}
                    title="Nhân bản bộ từ"
                  >
                    📋
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(set.id, set.title)}
                    loading={actionLoading === set.id}
                    title="Xóa bộ từ"
                  >
                    🗑️
                  </Button>
                </div>

                <Link to={`/teacher/tests/new?setId=${set.id}`}>
                  <Button variant="ghost" size="sm" fullWidth className="text-xs text-green-700 font-bold">
                    ⚡ Tạo bài kiểm tra từ bộ này
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
            📚
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có bộ từ vựng nào</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Bắt đầu tạo bộ từ vựng IELTS đầu tiên bằng cách nhập danh sách từ thủ công hoặc tải lên file Excel (.xlsx) / CSV.
          </p>
          <Link to="/teacher/vocabulary/new">
            <Button size="md">+ Soạn bộ từ vựng đầu tiên</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
