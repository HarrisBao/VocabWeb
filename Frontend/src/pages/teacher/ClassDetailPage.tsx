import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { Card, Badge } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { TaUser } from '../../types'

interface AvailableVocabSet {
  id: number
  title: string
  level: string
  wordCount: number
}

interface ClassMember {
  id: number
  studentProfileId: number
  fullName: string
  phone: string | null
  userId: string | null
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

type TabType = 'lessons' | 'members' | 'tas' | 'results' | 'settings' | 'attendance'

interface ClassSession {
  id: number
  classId: number
  sessionDate: string
  title?: string
  attendanceRecords: AttendanceRecord[]
  activities: SessionActivityStats[]
}

interface AttendanceRecord {
  id: number
  classEnrollmentId: number
  status: string
}

interface SessionActivityStats {
  testId: number
  title: string
  totalStudents: number
  completedCount: number
  notCompletedCount: number
  completedEnrollmentIds: number[]
}

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

  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentPhone, setNewStudentPhone] = useState('')
  const [isAddingStudent, setIsAddingStudent] = useState(false)

  // TA logic
  const [tas, setTas] = useState<TaUser[]>([])
  const [newTaEmail, setNewTaEmail] = useState('')
  const [isAddingTa, setIsAddingTa] = useState(false)

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
  const [classSessions, setClassSessions] = useState<ClassSession[]>([])
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [newSessionDate, setNewSessionDate] = useState('')
  const [newSessionTitle, setNewSessionTitle] = useState('')
  const [newSessionTestId, setNewSessionTestId] = useState<number | ''>('')
  const [togglingVisibilityId, setTogglingVisibilityId] = useState<number | null>(null)

  useEffect(() => {
    fetchClassDetails()
    fetchClassTests()
    fetchClassSessions()
    fetchTas()
  }, [id])

  const fetchClassTests = async () => {
    try {
      const data = await api.get<TestItem[]>(`/teacher/test?classId=${id}`)
      setClassTests(data)
    } catch {
      // Ignore
    }
  }

  const fetchClassSessions = async () => {
    try {
      const data = await api.get<ClassSession[]>(`/teacher/class/${id}/sessions`)
      setClassSessions(data)
    } catch {}
  }

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSessionDate) return
    setIsCreatingSession(true)
    try {
      await api.post(`/teacher/class/${id}/sessions`, {
        sessionDate: newSessionDate,
        title: newSessionTitle,
        testId: newSessionTestId ? Number(newSessionTestId) : null
      })
      setMessage({ type: 'success', text: 'TÃ¡ÂºÂ¡o buÃ¡Â»â€¢i hÃ¡Â»Âc thÃƒÂ nh cÃƒÂ´ng!' })
      setNewSessionDate('')
      setNewSessionTitle('')
      setNewSessionTestId('')
      fetchClassSessions()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'TÃ¡ÂºÂ¡o buÃ¡Â»â€¢i hÃ¡Â»Âc thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i.' })
    } finally {
      setIsCreatingSession(false)
    }
  }

  const handleUpdateAttendance = async (sessionId: number, enrollmentId: number, status: string) => {
    try {
      await api.put(`/teacher/class/${id}/sessions/${sessionId}/attendance`, {
        classEnrollmentId: enrollmentId,
        status: status
      })
      
      // Optimistic update
      setClassSessions(prev => prev.map(s => {
        if (s.id !== sessionId) return s
        const records = [...s.attendanceRecords]
        const idx = records.findIndex(r => r.classEnrollmentId === enrollmentId)
        if (idx >= 0) {
          records[idx].status = status
        } else {
          records.push({ id: 0, classEnrollmentId: enrollmentId, status })
        }
        return { ...s, attendanceRecords: records }
      }))
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t Ã„â€˜iÃ¡Â»Æ’m danh thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i.' })
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
      setMessage({ type: 'error', text: err.message || 'KhÃƒÂ´ng thÃ¡Â»Æ’ tÃ¡ÂºÂ£i chi tiÃ¡ÂºÂ¿t lÃ¡Â»â€ºp hÃ¡Â»Âc.' })
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
      setMessage({ type: 'success', text: 'ThÃƒÂªm bÃƒÂ i hÃ¡Â»Âc vÃƒÂ o lÃ¡Â»â€ºp thÃƒÂ nh cÃƒÂ´ng!' })
      setIsAddLessonModalOpen(false)
      fetchClassDetails()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'ThÃƒÂªm bÃƒÂ i hÃ¡Â»Âc thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i.' })
    } finally {
      setAddingLesson(false)
    }
  }

  const handleTogglePin = async (lessonId: number) => {
    try {
      await api.put(`/teacher/class/${id}/lessons/${lessonId}/pin`)
      fetchClassDetails()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Thao tÃƒÂ¡c thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i.' })
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
      setMessage({ type: 'error', text: err.message || 'Thay Ã„â€˜Ã¡Â»â€¢i trÃ¡ÂºÂ¡ng thÃƒÂ¡i hiÃ¡Â»Æ’n thÃ¡Â»â€¹ thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i.' })
    } finally {
      setTogglingVisibilityId(null)
    }
  }

  const handleRemoveLesson = async (lessonId: number, title: string) => {
    if (!window.confirm(`GÃ¡Â»Â¡ bÃƒÂ i hÃ¡Â»Âc "${title}" khÃ¡Â»Âi lÃ¡Â»â€ºp nÃƒÂ y?`)) return
    try {
      await api.delete(`/teacher/class/${id}/lessons/${lessonId}`)
      setMessage({ type: 'success', text: 'Ã„ÂÃƒÂ£ gÃ¡Â»Â¡ bÃƒÂ i hÃ¡Â»Âc khÃ¡Â»Âi lÃ¡Â»â€ºp.' })
      fetchClassDetails()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'GÃ¡Â»Â¡ bÃƒÂ i hÃ¡Â»Âc thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i.' })
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
      setMessage({ type: 'success', text: 'CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t thÃƒÂ´ng tin lÃ¡Â»â€ºp thÃƒÂ nh cÃƒÂ´ng!' })
      fetchClassDetails()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i.' })
    } finally {
      setSavingSettings(false)
    }
  }

    const handleSelectExistingStudent = async (studentProfileId: number) => {
    setIsAddingStudent(true)
    try {
      const res = await api.post(`/teacher/class/${id}/enrollments/${studentProfileId}`)
      if (res.id && cls) {
        setCls({
          ...cls,
          memberCount: cls.memberCount + 1,
          members: [...cls.members, res]
        })
        setMessage({ type: 'success', text: 'ÄÃ£ thÃªm há»c sinh vÃ o lá»›p.' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Lá»—i khi thÃªm há»c sinh.' })
    } finally {
      setIsAddingStudent(false)
    }
  }

  const handleAddNoAccountStudent = async (name: string, phone: string) => {
    setIsAddingStudent(true)
    try {
      const res = await api.post(`/teacher/class/${id}/students/no-account`, {
        fullName: name,
        phone: phone
      })
      if (res.id && cls) {
        setCls({
          ...cls,
          memberCount: cls.memberCount + 1,
          members: [...cls.members, res]
        })
        setMessage({ type: 'success', text: 'ÄÃ£ thÃªm há»c sinh vÃ o lá»›p.' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Lá»—i khi thÃªm há»c sinh.' })
    } finally {
      setIsAddingStudent(false)
    }
  }

  const handleRemoveStudent = async (studentProfileId: number, studentName: string) => {
    if (!window.confirm(`Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a ${studentName} khá»i lá»›p ${cls?.name}?\n\nLá»‹ch sá»­ há»c táº­p vÃ  káº¿t quáº£ trÆ°á»›c Ä‘Ã¢y váº«n Ä‘Æ°á»£c giá»¯ láº¡i.`)) return
    
    try {
      await api.delete(`/teacher/class/${id}/enrollments/${studentProfileId}`)
      if (cls) {
        // Refetch or update local state
        setCls({
          ...cls,
          memberCount: cls.memberCount - 1,
          members: cls.members.filter(m => m.studentProfileId !== studentProfileId)
        })
        setMessage({ type: 'success', text: 'ÄÃ£ xÃ³a há»c sinh khá»i lá»›p.' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Lá»—i khi xÃ³a há»c sinh.' })
    }
  }

  const fetchTas = async () => {
    try {
      const data = await api.get<TaUser[]>(`/teacher/class/${id}/tas`)
      setTas(data)
    } catch {
      // Ignore
    }
  }

  const handleAddTa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaEmail.trim()) return
    setIsAddingTa(true)
    try {
      await api.post(`/teacher/class/${id}/tas`, { email: newTaEmail })
      setMessage({ type: 'success', text: 'Ã„ÂÃƒÂ£ thÃƒÂªm TrÃ¡Â»Â£ giÃ¡ÂºÂ£ng thÃƒÂ nh cÃƒÂ´ng!' })
      setNewTaEmail('')
      fetchTas()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'ThÃƒÂªm TrÃ¡Â»Â£ giÃ¡ÂºÂ£ng thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i.' })
    } finally {
      setIsAddingTa(false)
    }
  }

  const handleRemoveTa = async (userId: string) => {
    if (!window.confirm('BÃ¡ÂºÂ¡n cÃƒÂ³ chÃ¡ÂºÂ¯c chÃ¡ÂºÂ¯n muÃ¡Â»â€˜n gÃ¡Â»Â¡ TrÃ¡Â»Â£ giÃ¡ÂºÂ£ng nÃƒÂ y khÃ¡Â»Âi lÃ¡Â»â€ºp?')) return
    try {
      await api.delete(`/teacher/class/${id}/tas/${userId}`)
      setMessage({ type: 'success', text: 'Ã„ÂÃƒÂ£ gÃ¡Â»Â¡ TrÃ¡Â»Â£ giÃ¡ÂºÂ£ng khÃ¡Â»Âi lÃ¡Â»â€ºp.' })
      fetchTas()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'GÃ¡Â»Â¡ TrÃ¡Â»Â£ giÃ¡ÂºÂ£ng thÃ¡ÂºÂ¥t bÃ¡ÂºÂ¡i.' })
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
        <p className="text-gray-500 mb-4">KhÃƒÂ´ng tÃƒÂ¬m thÃ¡ÂºÂ¥y lÃ¡Â»â€ºp hÃ¡Â»Âc.</p>
        <Link to="/teacher/classes">
          <Button size="sm">Quay lÃ¡ÂºÂ¡i danh sÃƒÂ¡ch</Button>
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
            <button className="p-2 rounded-xl bg-surface border border-surface-hover text-gray-600 hover:bg-surface-muted">
              Ã¢â€ Â
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900">{cls.name}</h1>
              <span className="font-mono text-xs font-bold bg-brand-light text-brand-text border border-green-200 px-2 py-0.5 rounded">
                {cls.code}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{cls.description || 'LÃ¡Â»â€ºp hÃ¡Â»Âc IELTS Thanh LÃƒÂª'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl border border-surface-hover bg-surface hover:bg-surface-muted text-xs font-bold text-gray-700 shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <span>{copiedLink ? 'Ã¢Å“â€œ Ã„ÂÃƒÂ£ copy link' : 'Ã°Å¸â€œâ€¹ Copy link cÃ¡Â»â€˜ Ã„â€˜Ã¡Â»â€¹nh'}</span>
          </button>

          {activeTab === 'lessons' && (
            <Button size="sm" onClick={openAddLessonModal} className="font-bold">
              + GÃƒÂ¡n bÃƒÂ i hÃ¡Â»Âc vÃƒÂ o lÃ¡Â»â€ºp
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
          <button onClick={() => setMessage(null)} className="font-bold text-xs opacity-60 hover:opacity-100">Ã¢Å“â€¢</button>
        </div>
      )}

      {/* 4 Tabs: [BÃƒÂ i hÃ¡Â»Âc] [ThÃƒÂ nh viÃƒÂªn] [KÃ¡ÂºÂ¿t quÃ¡ÂºÂ£] [CÃƒÂ i Ã„â€˜Ã¡ÂºÂ·t] */}
      <div className="border-b border-surface-hover">
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
            <span>Ã°Å¸â€œÅ¡ BÃƒÂ i hÃ¡Â»Âc</span>
            <span className="bg-surface-hover text-gray-600 text-xs px-2 py-0.5 rounded-full">
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
            <span>Ã°Å¸â€˜Â¥ ThÃƒÂ nh viÃƒÂªn</span>
            <span className="bg-surface-hover text-gray-600 text-xs px-2 py-0.5 rounded-full">
              {cls.members.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tas')}
            className={[
              'pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2',
              activeTab === 'tas'
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ].join(' ')}
          >
            <span>Ã°Å¸â€˜Â¨Ã¢â‚¬ÂÃ°Å¸ÂÂ« TrÃ¡Â»Â£ giÃ¡ÂºÂ£ng</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={[
              'pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2',
              activeTab === 'attendance'
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ].join(' ')}
          >
            <span>Ã°Å¸â€œÂ Ã„ÂiÃ¡Â»Æ’m danh</span>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={[
              'pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2',
              activeTab === 'results'
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ].join(' ')}
          >
            <span>Ã°Å¸Ââ€  BÃƒÂ i kiÃ¡Â»Æ’m tra</span>
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
            Ã¢Å¡â„¢Ã¯Â¸Â CÃƒÂ i Ã„â€˜Ã¡ÂºÂ·t
          </button>
        </nav>
      </div>

      {/* TAB 1: BÃƒâ‚¬I HÃ¡Â»Å’C */}
      {activeTab === 'lessons' && (
        <div className="space-y-4">
          {cls.lessons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cls.lessons.map((lesson) => (
                <Card key={lesson.id} className="p-5 flex flex-col justify-between border border-surface-hover">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="blue">{lesson.level}</Badge>
                      <div className="flex items-center gap-1.5">
                        {lesson.isPinned && (
                          <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded border border-amber-200">
                            Ã°Å¸â€œÅ’ Ã„ÂÃƒÂ£ ghim
                          </span>
                        )}
                        <button
                          onClick={() => handleToggleVisibility(lesson.id, lesson.isHidden)}
                          disabled={togglingVisibilityId === lesson.id}
                          className={[
                            'flex items-center gap-1 px-2 py-0.5 rounded font-bold text-xs transition-colors border',
                            lesson.isHidden
                              ? 'bg-surface-hover text-gray-600 border-surface-hover hover:bg-gray-200'
                              : 'bg-brand-light text-brand-text border-green-200 hover:bg-green-100',
                            togglingVisibilityId === lesson.id ? 'opacity-70 cursor-wait' : 'cursor-pointer'
                          ].join(' ')}
                          title={lesson.isHidden ? 'HiÃ¡Â»â€¡n bÃƒÂ i nÃƒÂ y cho hÃ¡Â»Âc sinh' : 'Ã¡ÂºÂ¨n bÃƒÂ i nÃƒÂ y khÃ¡Â»Âi hÃ¡Â»Âc sinh'}
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
                          <span>{lesson.isHidden ? 'Ã„Âang Ã¡ÂºÂ©n' : 'Ã„Âang hiÃ¡Â»â€¡n'}</span>
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
                      {lesson.vocabularySetTitle}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {lesson.wordCount} tÃ¡Â»Â« vÃ¡Â»Â±ng
                    </p>
                  </div>

                  <div className="pt-3 border-t border-surface-hover flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePin(lesson.id)}
                        className={[
                          'p-1.5 rounded-lg text-xs font-semibold border transition-colors',
                          lesson.isPinned ? 'bg-amber-50 text-amber-700 border-amber-200' : 'text-gray-500 hover:bg-surface-hover border-surface-hover'
                        ].join(' ')}
                        title={lesson.isPinned ? 'BÃ¡Â»Â ghim' : 'Ghim lÃƒÂªn Ã„â€˜Ã¡ÂºÂ§u'}
                      >
                        Ã°Å¸â€œÅ’
                      </button>

                      <button
                        onClick={() => handleRemoveLesson(lesson.id, lesson.vocabularySetTitle)}
                        className="p-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-surface-hover transition-colors"
                        title="GÃ¡Â»Â¡ khÃ¡Â»Âi lÃ¡Â»â€ºp"
                      >
                        Ã°Å¸â€”â€˜Ã¯Â¸Â
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
                            alert('Ã„ÂÃƒÂ£ copy link hÃ¡Â»Âc tÃ¡Â»Â« vÃ¡Â»Â±ng!')
                          }}
                        >
                          Ã°Å¸â€œâ€¹ Link HÃ¡Â»Âc
                        </Button>
                        <Link to={`/teacher/vocabulary/${lesson.vocabularySetId}`}>
                          <Button variant="ghost" size="sm" className="text-xs">
                            Xem chi tiÃ¡ÂºÂ¿t
                          </Button>
                        </Link>
                      </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface rounded-2xl border border-surface-hover p-8">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto text-xl mb-3">
                Ã°Å¸â€œÅ¡
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">LÃ¡Â»â€ºp chÃ†Â°a cÃƒÂ³ bÃƒÂ i hÃ¡Â»Âc nÃƒÂ o</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
                GÃƒÂ¡n cÃƒÂ¡c bÃ¡Â»â„¢ tÃ¡Â»Â« vÃ¡Â»Â±ng Ã„â€˜ÃƒÂ£ soÃ¡ÂºÂ¡n vÃƒÂ o lÃ¡Â»â€ºp nÃƒÂ y Ã„â€˜Ã¡Â»Æ’ hÃ¡Â»Âc viÃƒÂªn cÃƒÂ³ thÃ¡Â»Æ’ vÃƒÂ o hÃ¡Â»Âc vÃƒÂ  luyÃ¡Â»â€¡n tÃ¡ÂºÂ­p.
              </p>
              <Button size="sm" onClick={openAddLessonModal}>+ GÃƒÂ¡n bÃƒÂ i hÃ¡Â»Âc Ã„â€˜Ã¡ÂºÂ§u tiÃƒÂªn</Button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: THÃƒâ‚¬NH VIÃƒÅ N */}
      {activeTab === 'members' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Danh sÃƒÂ¡ch hÃ¡Â»Âc sinh</h2>
              <p className="text-xs text-gray-400 mt-0.5">ThÃƒÂªm hÃ¡Â»Âc sinh khÃƒÂ´ng cÃ¡ÂºÂ§n tÃƒÂ i khoÃ¡ÂºÂ£n bÃ¡ÂºÂ±ng sÃ¡Â»â€˜ Ã„â€˜iÃ¡Â»â€¡n thoÃ¡ÂºÂ¡i.</p>
            </div>
          </div>
          
          <StudentSearchDropdown classId={parseInt(id!)} onSelect={handleSelectExistingStudent} onAddNoAccount={handleAddNoAccountStudent} isAdding={isAddingStudent} />

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
                      <p className="text-xs text-gray-500">{m.phone || 'ChÃ†Â°a cÃƒÂ³ SDT'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
  <span className="text-xs text-gray-400">Tham gia: {new Date(m.joinedAt).toLocaleDateString('vi-VN')}</span>
  <button 
    onClick={() => handleRemoveStudent(m.studentProfileId, m.fullName)}
    className="text-xs text-red-600 hover:text-red-700 font-medium"
  >
    XÃ³a khá»i lá»›p
  </button>
</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-surface-hover rounded-xl">
              <p className="text-sm text-gray-500 mb-2">ChÃ†Â°a cÃƒÂ³ hÃ¡Â»Âc sinh nÃƒÂ o tham gia lÃ¡Â»â€ºp nÃƒÂ y</p>
              <p className="text-xs text-gray-400 max-w-md mx-auto mb-4">
                BÃ¡ÂºÂ¡n chÃ¡Â»â€° cÃ¡ÂºÂ§n gÃ¡Â»Â­i link cÃ¡Â»â€˜ Ã„â€˜Ã¡Â»â€¹nh cÃ¡Â»Â§a lÃ¡Â»â€ºp cho hÃ¡Â»Âc viÃƒÂªn. Khi hÃ¡Â»Âc viÃƒÂªn truy cÃ¡ÂºÂ­p, hÃ¡Â»Â sÃ¡ÂºÂ½ thÃ¡ÂºÂ¥y Ã„â€˜Ã¡ÂºÂ§y Ã„â€˜Ã¡Â»Â§ danh mÃ¡Â»Â¥c bÃƒÂ i hÃ¡Â»Âc.
              </p>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-brand-light text-brand-text border border-green-200 rounded-xl text-xs font-bold hover:bg-green-100 transition-colors"
              >
                {copiedLink ? 'Ã¢Å“â€œ Ã„ÂÃƒÂ£ copy link cÃ¡Â»â€˜ Ã„â€˜Ã¡Â»â€¹nh' : 'Ã°Å¸â€œâ€¹ Copy link cÃ¡Â»â€˜ Ã„â€˜Ã¡Â»â€¹nh gÃ¡Â»Â­i hÃ¡Â»Âc viÃƒÂªn'}
              </button>
            </div>
          )}
        </Card>
      )}

      {/* TAB ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">TÃ¡ÂºÂ¡o buÃ¡Â»â€¢i hÃ¡Â»Âc mÃ¡Â»â€ºi</h2>
            </div>
            <form onSubmit={handleCreateSession} className="flex flex-col sm:flex-row gap-3">
              <Input type="date" value={newSessionDate} onChange={e => setNewSessionDate(e.target.value)} required />
              <Input placeholder="TiÃƒÂªu Ã„â€˜Ã¡Â»Â (VD: Lesson 1)" value={newSessionTitle} onChange={e => setNewSessionTitle(e.target.value)} />
              <select 
                className="flex h-10 w-full rounded-md border border-gray-300 bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={newSessionTestId} 
                onChange={e => setNewSessionTestId(e.target.value)}
              >
                <option value="">-- KhÃƒÂ´ng giao bÃƒÂ i tÃ¡ÂºÂ­p --</option>
                {classTests.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
              <Button type="submit" loading={isCreatingSession}>TÃ¡ÂºÂ¡o</Button>
            </form>
          </Card>

          {classSessions.map(session => (
            <Card key={session.id} className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{session.title || 'BuÃ¡Â»â€¢i hÃ¡Â»Âc'}</h3>
                  <p className="text-sm text-gray-500">{new Date(session.sessionDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-surface-hover">
                      <th className="py-2 text-sm text-gray-500 font-bold">HÃ¡Â»Âc sinh</th>
                      <th className="py-2 text-sm text-gray-500 font-bold">Ã„ÂiÃ¡Â»Æ’m danh</th>
                      <th className="py-2 text-sm text-gray-500 font-bold text-right">BÃƒÂ i tÃ¡ÂºÂ­p Ã„ÂÃƒÂ£ lÃƒÂ m</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cls?.members.map(member => {
                      const record = session.attendanceRecords.find(r => r.classEnrollmentId === member.id)
                      const status = record?.status || ''
                      
                      return (
                        <tr key={member.id} className="hover:bg-surface-muted transition-colors">
                          <td className="py-3">
                            <div className="font-bold text-gray-900">{member.fullName}</div>
                            <div className="text-xs text-gray-500">{member.phone || 'ChÃ†Â°a cÃƒÂ³ SÃ„ÂT'}</div>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateAttendance(session.id, member.id, 'PRESENT')}
                                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${status === 'PRESENT' ? 'bg-brand-light text-brand-text border border-brand-light' : 'bg-surface border border-surface-hover text-gray-500 hover:bg-surface-muted'}`}
                              >
                                CÃƒÂ³ mÃ¡ÂºÂ·t
                              </button>
                              <button
                                onClick={() => handleUpdateAttendance(session.id, member.id, 'ABSENT')}
                                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${status === 'ABSENT' ? 'bg-incorrect-bg text-incorrect-text border border-incorrect-bg' : 'bg-surface border border-surface-hover text-gray-500 hover:bg-surface-muted'}`}
                              >
                                VÃ¡ÂºÂ¯ng
                              </button>
                              <button
                                onClick={() => handleUpdateAttendance(session.id, member.id, 'ONLINE')}
                                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${status === 'ONLINE' ? 'bg-writing-bg text-writing-text border border-writing-bg' : 'bg-surface border border-surface-hover text-gray-500 hover:bg-surface-muted'}`}
                              >
                                HÃ¡Â»Âc online
                              </button>
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            {session.activities.length === 0 && <span className="text-xs text-gray-400">KhÃƒÂ´ng cÃƒÂ³</span>}
                            {session.activities.map(act => {
                              const isCompleted = act.completedEnrollmentIds.includes(member.id);
                              return (
                                <div key={act.testId} className="text-xs flex flex-col items-end gap-1 mb-2">
                                  <span className="font-medium text-gray-700">{act.title}</span>
                                  {isCompleted ? (
                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Ã„ ÃƒÂ£ lÃƒÂ m</span>
                                  ) : (
                                    <span className="bg-surface-hover text-gray-500 px-2 py-0.5 rounded">ChÃ†Â°a lÃƒÂ m</span>
                                  )}
                                </div>
                              )
                            })}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB TA */}
      {activeTab === 'tas' && (
        <Card className="p-6 max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Danh sÃƒÂ¡ch TrÃ¡Â»Â£ giÃ¡ÂºÂ£ng</h2>
              <p className="text-xs text-gray-400 mt-0.5">ThÃƒÂªm TrÃ¡Â»Â£ giÃ¡ÂºÂ£ng (TA) Ã„â€˜Ã¡Â»Æ’ hÃ¡Â»â€” trÃ¡Â»Â£ quÃ¡ÂºÂ£n lÃƒÂ½ lÃ¡Â»â€ºp hÃ¡Â»Âc vÃƒÂ  Ã„â€˜iÃ¡Â»Æ’m danh.</p>
            </div>
          </div>
          
          <form onSubmit={handleAddTa} className="flex flex-col sm:flex-row gap-2 mb-6">
            <Input 
              placeholder="Email cÃ¡Â»Â§a TrÃ¡Â»Â£ giÃ¡ÂºÂ£ng" 
              type="email"
              value={newTaEmail} 
              onChange={e => setNewTaEmail(e.target.value)} 
              required 
            />
            <Button type="submit" loading={isAddingTa}>ThÃƒÂªm TrÃ¡Â»Â£ giÃ¡ÂºÂ£ng</Button>
          </form>

          {tas.length > 0 ? (
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
              {tas.map((ta) => (
                <div key={ta.userId} className="p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    {ta.avatarUrl ? (
                      <img src={ta.avatarUrl} alt={ta.fullName} className="w-10 h-10 rounded-full object-cover border border-green-200" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm">
                        {ta.fullName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-gray-900">{ta.fullName}</p>
                      <p className="text-xs text-gray-500">{ta.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 font-medium px-3 py-1.5 h-auto"
                    onClick={() => handleRemoveTa(ta.userId)}
                  >
                    GÃ¡Â»Â¡
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <p className="text-sm font-medium text-gray-600 mb-1">ChÃ†Â°a cÃƒÂ³ TrÃ¡Â»Â£ giÃ¡ÂºÂ£ng nÃƒÂ o</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                NhÃ¡ÂºÂ­p email cÃ¡Â»Â§a ngÃ†Â°Ã¡Â»Âi dÃƒÂ¹ng cÃƒÂ³ quyÃ¡Â»Ân TA Ã„â€˜Ã¡Â»Æ’ thÃƒÂªm vÃƒÂ o lÃ¡Â»â€ºp hÃ¡Â»Âc nÃƒÂ y.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* TAB 3: BÃƒâ‚¬I KIÃ¡Â»â€šM TRA */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">BÃƒÂ i kiÃ¡Â»Æ’m tra cÃ¡Â»Â§a lÃ¡Â»â€ºp</h2>
              <p className="text-xs text-gray-400 mt-0.5">Danh sÃƒÂ¡ch cÃƒÂ¡c bÃƒÂ i kiÃ¡Â»Æ’m tra Ã„â€˜Ã†Â°Ã¡Â»Â£c gÃƒÂ¡n cho lÃ¡Â»â€ºp nÃƒÂ y.</p>
            </div>
            <Link to="/teacher/tests/new">
              <Button size="sm" variant="secondary" className="font-bold">+ TÃ¡ÂºÂ¡o bÃƒÂ i kiÃ¡Â»Æ’m tra</Button>
            </Link>
          </div>

          {classTests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classTests.map((test) => (
                <Card key={test.id} className="p-5 flex flex-col justify-between border border-surface-hover">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
                      {test.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-1">{test.description}</p>
                    <div className="space-y-1.5 text-xs text-gray-600 mb-4 border-y border-surface-hover py-3">
                      <div className="flex justify-between">
                        <span>SÃ¡Â»â€˜ hoÃ¡ÂºÂ¡t Ã„â€˜Ã¡Â»â„¢ng:</span>
                        <span className="font-bold">{test.enabledTypes.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SÃ¡Â»â€˜ lÃ†Â°Ã¡Â»Â£t lÃƒÂ m:</span>
                        <span className="font-bold text-gray-900">{test.attemptCount} lÃ†Â°Ã¡Â»Â£t</span>
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
                        alert('Ã„ÂÃƒÂ£ copy link bÃƒÂ i kiÃ¡Â»Æ’m tra!')
                      }}
                    >
                      Ã°Å¸â€œâ€¹ Copy Link KiÃ¡Â»Æ’m Tra
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/teacher/tests/${test.id}`} className="flex-1">
                      <Button variant="outline" size="sm" fullWidth>
                        Xem bÃƒÂ i
                      </Button>
                    </Link>
                    <Link to={`/teacher/tests/${test.id}/results`} className="flex-1">
                      <Button variant="primary" size="sm" fullWidth>
                        KÃ¡ÂºÂ¿t quÃ¡ÂºÂ£
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-surface-hover rounded-xl bg-surface">
              <div className="text-3xl mb-3">Ã°Å¸â€œÂ</div>
              <p className="text-sm font-bold text-gray-700 mb-1">LÃ¡Â»â€ºp chÃ†Â°a cÃƒÂ³ bÃƒÂ i kiÃ¡Â»Æ’m tra</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                ChÃ†Â°a cÃƒÂ³ bÃƒÂ i kiÃ¡Â»Æ’m tra nÃƒÂ o Ã„â€˜Ã†Â°Ã¡Â»Â£c gÃƒÂ¡n cho lÃ¡Â»â€ºp nÃƒÂ y.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CÃƒâ‚¬I Ã„ÂÃ¡ÂºÂ¶T */}
      {activeTab === 'settings' && (
        <Card className="p-6 max-w-2xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">CÃƒÂ i Ã„â€˜Ã¡ÂºÂ·t thÃƒÂ´ng tin lÃ¡Â»â€ºp hÃ¡Â»Âc</h2>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <Input
              label="TÃƒÂªn lÃ¡Â»â€ºp hÃ¡Â»Âc"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              required
            />

            <Input
              label="MÃƒÂ£ lÃ¡Â»â€ºp"
              value={editCode}
              onChange={e => setEditCode(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">MÃƒÂ´ tÃ¡ÂºÂ£ lÃ¡Â»â€ºp hÃ¡Â»Âc</label>
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="p-3 bg-surface-muted rounded-xl border border-surface-hover">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Link truy cÃ¡ÂºÂ­p cÃ¡Â»â€˜ Ã„â€˜Ã¡Â»â€¹nh</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}${cls.fixedLinkUrl}`}
                  className="flex-1 px-3 py-1.5 text-xs font-mono bg-surface border border-surface-hover rounded-lg text-gray-700"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {copiedLink ? 'Ã¢Å“â€œ Ã„ÂÃƒÂ£ copy' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="pt-3">
              <Button type="submit" size="sm" loading={savingSettings}>
                LÃ†Â°u thay Ã„â€˜Ã¡Â»â€¢i cÃƒÂ i Ã„â€˜Ã¡ÂºÂ·t
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Add Lesson Modal */}
      {isAddLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-surface rounded-2xl p-6 max-w-md w-full shadow-2xl border border-surface-hover">
            <h3 className="text-lg font-bold text-gray-900 mb-4">GÃƒÂ¡n BÃƒÂ i hÃ¡Â»Âc vÃƒÂ o lÃ¡Â»â€ºp</h3>
            <form onSubmit={handleAddLessonSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ChÃ¡Â»Ân BÃ¡Â»â„¢ tÃ¡Â»Â« vÃ¡Â»Â±ng nguÃ¡Â»â€œn *
                </label>
                {availableSets.length > 0 ? (
                  <select
                    value={selectedSetId}
                    onChange={e => setSelectedSetId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {availableSets.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.wordCount} tÃ¡Â»Â« - {s.level})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-gray-500">
                    BÃ¡ÂºÂ¡n chÃ†Â°a cÃƒÂ³ bÃ¡Â»â„¢ tÃ¡Â»Â« vÃ¡Â»Â±ng nÃƒÂ o.{' '}
                    <Link to="/teacher/vocabulary/new" className="text-green-600 font-bold underline">
                      TÃ¡ÂºÂ¡o bÃ¡Â»â„¢ tÃ¡Â»Â« mÃ¡Â»â€ºi ngay
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
                <span className="text-sm text-gray-700">Ghim bÃƒÂ i hÃ¡Â»Âc nÃƒÂ y lÃƒÂªn Ã„â€˜Ã¡ÂºÂ§u danh sÃƒÂ¡ch</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddLessonModalOpen(false)}
                >
                  HÃ¡Â»Â§y
                </Button>
                <Button type="submit" size="sm" loading={addingLesson} disabled={availableSets.length === 0}>
                  ThÃƒÂªm vÃƒÂ o lÃ¡Â»â€ºp
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}




