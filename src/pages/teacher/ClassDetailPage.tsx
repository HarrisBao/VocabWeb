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
  isHidden: boolean
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

interface TestItem {
  id: number
  title: string
  description?: string
  enabledTypes: string[]
  attemptCount: number
  publicCode: string
}

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

  const [classTests, setClassTests] = useState<TestItem[]>([])
  const [togglingVisibilityId, setTogglingVisibilityId] = useState<number | null>(null)

  useEffect(() => {
    fetchClassDetails()
    fetchClassTests()
  }, [id])

  const fetchClassTests = async () => {
    try {
      const data = await api.get<TestItem[]>(`/teacher/test?classId=${id}`)
      setClassTests(data)
    } catch {
      // Ignore
    }
  }

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
      const sets = await api.get<AvailableVocabSet[]>('/teacher/vocabulary-sets')
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

  const handleToggleVisibility = async (lessonId: number, currentIsHidden: boolean) => {
    if (togglingVisibilityId === lessonId) return
    setTogglingVisibilityId(lessonId)

    // Optimistic Update
    setCls(prev => {
      if (!prev) return prev
      return {
        ...prev,
        lessons: prev.lessons.map(l =>
          l.id === lessonId ? { ...l, isHidden: !currentIsHidden } : l
        )
      }
    })

    try {
      await api.put(`/teacher/class/${id}/lessons/${lessonId}/visibility`)
    } catch (err: any) {
      // Rollback
      setCls(prev => {
        if (!prev) return prev
        return {
          ...prev,
          lessons: prev.lessons.map(l =>
            l.id === lessonId ? { ...l, isHidden: currentIsHidden } : l
          )
        }
      })
      setMessage({ type: 'error', text: err.message || 'Thay đổi trạng thái hiển thị thất bại.' })
    } finally {
      setTogglingVisibilityId(null)
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
            📝 Bài kiểm tra
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
                      <Badge variant="blue">{lesson.level}</Badge>
                      <div className="flex items-center gap-1.5">
                        {lesson.isPinned && (
                          <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded border border-amber-200">
                            📌 Đã ghim
                          </span>
                        )}
                        <button
                          onClick={() => handleToggleVisibility(lesson.id, lesson.isHidden)}
                          disabled={togglingVisibilityId === lesson.id}
                          className={[
                            'flex items-center gap-1 px-2 py-0.5 rounded font-bold text-xs transition-colors border',
                            lesson.isHidden
                              ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                              : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
                            togglingVisibilityId === lesson.id ? 'opacity-70 cursor-wait' : 'cursor-pointer'
                          ].join(' ')}
                          title={lesson.isHidden ? 'Hiện bài này cho học sinh' : 'Ẩn bài này khỏi học sinh'}
                        >
                          {togglingVisibilityId === lesson.id ? (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : lesson.isHidden ? (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                          <span>{lesson.isHidden ? 'Đang ẩn' : 'Đang hiện'}</span>
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
                      {lesson.vocabularySetTitle}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {lesson.wordCount} từ vựng
                    </p>
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
                        onClick={() => handleRemoveLesson(lesson.id, lesson.vocabularySetTitle)}
                        className="p-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-gray-200 transition-colors"
                        title="Gỡ khỏi lớp"
                      >
                        🗑️
                      </button>
                    </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-blue-600 hover:bg-blue-50"
                          onClick={() => {
                            const link = `${window.location.origin}/learn/vocabulary/${lesson.vocabularySetId}?classId=${id}`
                            navigator.clipboard.writeText(link)
                            alert('Đã copy link học từ vựng!')
                          }}
                        >
                          📋 Link Học
                        </Button>
                        <Link to={`/teacher/vocabulary/${lesson.vocabularySetId}`}>
                          <Button variant="ghost" size="sm" className="text-xs">
                            Xem chi tiết
                          </Button>
                        </Link>
                      </div>
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
                      {m.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{m.fullName}</p>
                      <p className="text-xs text-gray-500">{m.email}</p>
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

      {/* TAB 3: BÀI KIỂM TRA */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Bài kiểm tra của lớp</h2>
              <p className="text-xs text-gray-400 mt-0.5">Danh sách các bài kiểm tra được gán cho lớp này.</p>
            </div>
            <Link to="/teacher/tests/new">
              <Button size="sm" variant="secondary" className="font-bold">+ Tạo bài kiểm tra</Button>
            </Link>
          </div>

          {classTests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classTests.map((test) => (
                <Card key={test.id} className="p-5 flex flex-col justify-between border border-gray-200">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
                      {test.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-1">{test.description}</p>
                    <div className="space-y-1.5 text-xs text-gray-600 mb-4 border-y border-gray-100 py-3">
                      <div className="flex justify-between">
                        <span>Số hoạt động:</span>
                        <span className="font-bold">{test.enabledTypes.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Số lượt làm:</span>
                        <span className="font-bold text-gray-900">{test.attemptCount} lượt</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      fullWidth
                      className="text-xs text-blue-600 hover:bg-blue-50 border border-blue-100"
                      onClick={() => {
                        const link = `${window.location.origin}/test/${test.publicCode}`
                        navigator.clipboard.writeText(link)
                        alert('Đã copy link bài kiểm tra!')
                      }}
                    >
                      📋 Copy Link Kiểm Tra
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/teacher/tests/${test.id}`} className="flex-1">
                      <Button variant="outline" size="sm" fullWidth>
                        Xem bài
                      </Button>
                    </Link>
                    <Link to={`/teacher/tests/${test.id}/results`} className="flex-1">
                      <Button variant="primary" size="sm" fullWidth>
                        Kết quả
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-xl bg-white">
              <div className="text-3xl mb-3">📝</div>
              <p className="text-sm font-bold text-gray-700 mb-1">Lớp chưa có bài kiểm tra</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                Chưa có bài kiểm tra nào được gán cho lớp này.
              </p>
            </div>
          )}
        </div>
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

