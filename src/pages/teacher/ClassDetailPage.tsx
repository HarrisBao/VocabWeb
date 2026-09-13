import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { Card, Badge } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

interface AvailableVocabSet {
  id: number
  title: string
  level: string
  wordCount: number
}

interface ClassMember {
  id: number
  studentId: string
  fullName: string
  email: string
  joinedAt: string
}

interface ClassLesson {
  id: number
  vocabularySetId: number
  vocabularySetTitle: string
  level: string
  wordCount: number
  isPinned: boolean
  isVisible: boolean
  displayOrder: number
}

interface TestAttempt {
  id: number
  testId: number
  testTitle: string
  studentName: string
  studentEmail: string
  score: number
  correctCount: number
  totalQuestions: number
  durationSeconds: number
  submittedAt?: string
  isPassed: boolean
}

interface ClassDetails {
  id: number
  name: string
  code: string
  description?: string
  fixedLinkUrl: string
  createdAt: string
  lessons: ClassLesson[]
  members: ClassMember[]
  attempts: TestAttempt[]
}

type TabType = 'lessons' | 'members' | 'results' | 'settings'

export const ClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<TabType>('lessons')
  const [cls, setCls] = useState<ClassDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Add lesson modal
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false)
  const [availableSets, setAvailableSets] = useState<AvailableVocabSet[]>([])
  const [selectedSetId, setSelectedSetId] = useState<number | ''>('')
  const [isPinnedChecked, setIsPinnedChecked] = useState(false)
  const [addingLesson, setAddingLesson] = useState(false)

  // Settings form
  const [editName, setEditName] = useState('')
  const [editCode, setEditCode] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)

  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    fetchClassDetails()
  }, [id])

  const fetchClassDetails = async () => {
    setLoading(true)
    try {
      const data = await api.get<ClassDetails>(`/teacher/class/${id}`)
      setCls(data)
      setEditName(data.name)
      setEditCode(data.code)
      setEditDesc(data.description || '')
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Không thể tải chi tiết lớp học.' })
    } finally {
      setLoading(false)
    }
  }

  const openAddLessonModal = async () => {
    setIsAddLessonModalOpen(true)
    try {
      const sets = await api.get<AvailableVocabSet[]>('/teacher/vocabulary')
      setAvailableSets(sets)
      if (sets.length > 0) {
        setSelectedSetId(sets[0].id)
      }
    } catch {
      // Ignore
    }
  }

  const handleAddLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSetId) return

    setAddingLesson(true)
    try {
      await api.post(`/teacher/class/${id}/lessons`, {
        vocabularySetId: selectedSetId,
        isPinned: isPinnedChecked
      })
      setMessage({ type: 'success', text: 'Thêm bài học vào lớp thành công!' })
      setIsAddLessonModalOpen(false)
      fetchClassDetails()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Thêm bài học thất bại.' })
    } finally {
      setAddingLesson(false)
    }
  }

  const handleTogglePin = async (lessonId: number) => {
    try {
      await api.put(`/teacher/class/${id}/lessons/${lessonId}/pin`)
      fetchClassDetails()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Thao tác thất bại.' })
    }
  }

  const handleToggleVisibility = async (lessonId: number) => {
    try {
      await api.put(`/teacher/class/${id}/lessons/${lessonId}/visibility`)
      fetchClassDetails()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Thao tác thất bại.' })
    }
  }

  const handleRemoveLesson = async (lessonId: number, title: string) => {
    if (!window.confirm(`Gỡ bài học "${title}" khỏi lớp này?`)) return
    try {
      await api.delete(`/teacher/class/${id}/lessons/${lessonId}`)
      setMessage({ type: 'success', text: 'Đã gỡ bài học khỏi lớp.' })
      fetchClassDetails()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gỡ bài học thất bại.' })
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSettings(true)
    try {
      await api.put(`/teacher/class/${id}`, {
        name: editName.trim(),
        code: editCode.trim(),
        description: editDesc.trim()
      })
      setMessage({ type: 'success', text: 'Cập nhật thông tin lớp thành công!' })
      fetchClassDetails()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Cập nhật thất bại.' })
    } finally {
      setSavingSettings(false)
    }
  }

  const handleCopyLink = () => {
    if (!cls) return
    const full = `${window.location.origin}${cls.fixedLinkUrl}`
    navigator.clipboard.writeText(full)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!cls) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">Không tìm thấy lớp học.</p>
        <Link to="/teacher/classes">
          <Button size="sm">Quay lại danh sách</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/teacher/classes">
            <button className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">
              ←
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900">{cls.name}</h1>
              <span className="font-mono text-xs font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded">
                {cls.code}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{cls.description || 'Lớp học IELTS Thanh Lê'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <span>{copiedLink ? '✓ Đã copy link' : '📋 Copy link cố định'}</span>
          </button>

          {activeTab === 'lessons' && (
            <Button size="sm" onClick={openAddLessonModal} className="font-bold">
              + Gán bài học vào lớp
            </Button>
          )}
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

      {/* 4 Tabs: [Bài học] [Thành viên] [Kết quả] [Cài đặt] */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('lessons')}
            className={[
              'pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2',
              activeTab === 'lessons'
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ].join(' ')}
          >
            <span>📚 Bài học</span>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              {cls.lessons.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={[
              'pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2',
              activeTab === 'members'
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ].join(' ')}
          >
            <span>👥 Thành viên</span>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              {cls.members.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={[
              'pb-3 text-sm font-bold border-b-2 transition-colors',
              activeTab === 'results'
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ].join(' ')}
          >
            📊 Kết quả
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={[
              'pb-3 text-sm font-bold border-b-2 transition-colors',
              activeTab === 'settings'
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ].join(' ')}
          >
            ⚙️ Cài đặt
          </button>
        </nav>
      </div>

      {/* TAB 1: BÀI HỌC */}
      {activeTab === 'lessons' && (
        <div className="space-y-4">
          {cls.lessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cls.lessons.map((lesson) => (
                <Card key={lesson.id} className="p-5 flex flex-col justify-between border border-gray-200">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="primary">{lesson.vocabularySetLevel}</Badge>
                      <div className="flex items-center gap-1.5">
                        {lesson.isPinned && (
                          <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded border border-amber-200">
                            📌 Đã ghim
                          </span>
                        )}
                        {lesson.isHidden && (
                          <span className="text-xs bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded">
                            👁️ Đang ẩn
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-gray-900 mb-1">{lesson.vocabularySetTitle}</h3>
                    <p className="text-xs text-gray-500 mb-4">{lesson.wordCount} từ vựng</p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePin(lesson.id)}
                        className={[
                          'p-1.5 rounded-lg text-xs font-semibold border transition-colors',
                          lesson.isPinned ? 'bg-amber-50 text-amber-700 border-amber-200' : 'text-gray-500 hover:bg-gray-100 border-gray-200'
                        ].join(' ')}
                        title={lesson.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
                      >
                        📌
                      </button>

                      <button
                        onClick={() => handleToggleVisibility(lesson.id)}
                        className={[
                          'p-1.5 rounded-lg text-xs font-semibold border transition-colors',
                          lesson.isHidden ? 'bg-gray-100 text-gray-600 border-gray-200' : 'text-green-700 bg-green-50 border-green-200'
                        ].join(' ')}
                        title={lesson.isHidden ? 'Bỏ ẩn' : 'Ẩn khỏi học sinh'}
                      >
                        {lesson.isHidden ? '🙈' : '👁️'}
                      </button>

                      <button
                        onClick={() => handleRemoveLesson(lesson.id, lesson.vocabularySetTitle)}
                        className="p-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-gray-200 transition-colors"
                        title="Gỡ khỏi lớp"
                      >
                        🗑️
                      </button>
                    </div>

                    <Link to={`/teacher/vocabulary/${lesson.vocabularySetId}`}>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Xem chi tiết
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto text-xl mb-3">
                📚
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Lớp chưa có bài học nào</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
                Gán các bộ từ vựng đã soạn vào lớp này để học viên có thể vào học và luyện tập.
              </p>
              <Button size="sm" onClick={openAddLessonModal}>+ Gán bài học đầu tiên</Button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: THÀNH VIÊN */}
      {activeTab === 'members' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Danh sách học sinh</h2>
              <p className="text-xs text-gray-400 mt-0.5">Lớp học hoạt động bình thường kể cả khi chưa có danh sách học sinh.</p>
            </div>
          </div>

          {cls.members.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {cls.members.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-xs">
                      {m.studentName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{m.studentName}</p>
                      <p className="text-xs text-gray-500">{m.studentEmail}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">Tham gia: {new Date(m.joinedAt).toLocaleDateString('vi-VN')}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
              <p className="text-sm text-gray-500 mb-2">Chưa có học sinh nào tham gia lớp này</p>
              <p className="text-xs text-gray-400 max-w-md mx-auto mb-4">
                Bạn chỉ cần gửi link cố định của lớp cho học viên. Khi học viên truy cập, họ sẽ thấy đầy đủ danh mục bài học.
              </p>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors"
              >
                {copiedLink ? '✓ Đã copy link cố định' : '📋 Copy link cố định gửi học viên'}
              </button>
            </div>
          )}
        </Card>
      )}

      {/* TAB 3: KẾT QUẢ */}
      {activeTab === 'results' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Kết quả bài kiểm tra của lớp</h2>
              <p className="text-xs text-gray-400 mt-0.5">Bảng điểm và lịch sử làm bài thi của học sinh trong lớp.</p>
            </div>
          </div>

          <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-xl">
            <div className="text-3xl mb-3">📊</div>
            <p className="text-sm font-bold text-gray-700 mb-1">Chưa có dữ liệu bài làm</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
              Kết quả làm bài sẽ tự động hiển thị tại đây khi học viên hoàn thành các bài kiểm tra được gán vào lớp.
            </p>
            <Link to="/teacher/tests/new">
              <Button size="sm" variant="secondary">+ Tạo bài kiểm tra cho lớp này</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* TAB 4: CÀI ĐẶT */}
      {activeTab === 'settings' && (
        <Card className="p-6 max-w-2xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Cài đặt thông tin lớp học</h2>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <Input
              label="Tên lớp học"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              required
            />

            <Input
              label="Mã lớp"
              value={editCode}
              onChange={e => setEditCode(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả lớp học</label>
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Link truy cập cố định</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}${cls.fixedLinkUrl}`}
                  className="flex-1 px-3 py-1.5 text-xs font-mono bg-white border border-gray-200 rounded-lg text-gray-700"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {copiedLink ? '✓ Đã copy' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="pt-3">
              <Button type="submit" size="sm" loading={savingSettings}>
                Lưu thay đổi cài đặt
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Add Lesson Modal */}
      {isAddLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Gán Bài học vào lớp</h3>
            <form onSubmit={handleAddLessonSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Chọn Bộ từ vựng nguồn *
                </label>
                {availableSets.length > 0 ? (
                  <select
                    value={selectedSetId}
                    onChange={e => setSelectedSetId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {availableSets.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.wordCount} từ - {s.level})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-gray-500">
                    Bạn chưa có bộ từ vựng nào.{' '}
                    <Link to="/teacher/vocabulary/new" className="text-green-600 font-bold underline">
                      Tạo bộ từ mới ngay
                    </Link>
                  </p>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isPinnedChecked}
                  onChange={e => setIsPinnedChecked(e.target.checked)}
                  className="w-4 h-4 rounded text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Ghim bài học này lên đầu danh sách</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddLessonModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" size="sm" loading={addingLesson} disabled={availableSets.length === 0}>
                  Thêm vào lớp
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
