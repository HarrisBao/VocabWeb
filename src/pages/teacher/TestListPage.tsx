import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

interface TestItem {
  id: number
  title: string
  description?: string
  vocabularySetId: number
  vocabularySetTitle: string
  classId?: number
  className?: string
  enabledTypes: string[]
  totalQuestions: number
  passScore: number
  timeLimitMinutes?: number
  attemptCount: number
  createdAt: string
}

export const TestListPage: React.FC = () => {
  const [tests, setTests] = useState<TestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchTests = async () => {
    setLoading(true)
    try {
      const data = await api.get<TestItem[]>('/teacher/test')
      setTests(data)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Không thể tải danh sách bài kiểm tra.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTests()
  }, [])

  const handleDeleteTest = async (id: number, title: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bài kiểm tra "${title}"?`)) return
    try {
      await api.delete(`/teacher/test/${id}`)
      setMessage({ type: 'success', text: 'Đã xóa bài kiểm tra.' })
      setTests(tests.filter(t => t.id !== id))
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Xóa bài kiểm tra thất bại.' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Quản lý Bài kiểm tra</h1>
          <p className="text-sm text-gray-500 mt-1">
            Cấu hình đề thi trắc nghiệm & điền từ ngẫu nhiên dựa trên các bộ từ vựng đã soạn.
          </p>
        </div>
        <Link to="/teacher/tests/new">
          <Button size="md" className="font-bold shadow-sm">
            + Tạo bài kiểm tra mới
          </Button>
        </Link>
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

      {/* Test Cards */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        </div>
      ) : tests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Card key={test.id} hover className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-xs bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded-lg border border-green-200">
                    📚 {test.vocabularySetTitle}
                  </span>
                  {test.className && (
                    <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">
                      {test.className}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1">{test.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                  {test.description || 'Bài kiểm tra từ vựng IELTS ngẫu nhiên.'}
                </p>

                <div className="space-y-2 py-3 border-y border-gray-100 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Số câu hỏi:</span>
                    <span className="font-bold text-gray-900">{test.totalQuestions} câu</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Điểm đạt yêu cầu:</span>
                    <span className="font-bold text-green-700">{test.passScore}/10.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thời gian làm bài:</span>
                    <span className="font-bold text-gray-900">
                      {test.timeLimitMinutes ? `${test.timeLimitMinutes} phút` : 'Không giới hạn'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lượt làm bài:</span>
                    <span className="font-bold text-gray-900">{test.attemptCount} lượt</span>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-gray-400 block mb-1 uppercase">Các dạng câu hỏi bật:</span>
                  <div className="flex flex-wrap gap-1">
                    {test.enabledTypes.map(t => (
                      <span key={t} className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center gap-2 mt-4">
                <Link to={`/teacher/tests/${test.id}`} className="flex-1">
                  <Button variant="primary" size="sm" fullWidth>
                    Cấu hình & Đề mẫu
                  </Button>
                </Link>
                <Link to={`/teacher/tests/${test.id}/results`} className="flex-1">
                  <Button variant="outline" size="sm" fullWidth>
                    Kết quả ({test.attemptCount})
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTest(test.id, test.title)}
                  className="text-red-600 hover:bg-red-50 p-2"
                  title="Xóa bài test"
                >
                  🗑️
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
            📝
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa tạo bài kiểm tra nào</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Tạo bài kiểm tra với các dạng câu hỏi trắc nghiệm, điền từ, nghe và phát âm để học viên ôn luyện.
          </p>
          <Link to="/teacher/tests/new">
            <Button size="md">+ Tạo bài kiểm tra đầu tiên</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
