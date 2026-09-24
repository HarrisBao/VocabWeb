import React, { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { TeacherReadingTab } from './TeacherReadingTab'

// Suppose other skill tabs exist or will exist:
// import { TeacherListeningTab } from './TeacherListeningTab'
// import { TeacherWritingTab } from './TeacherWritingTab'
// import { TeacherSpeakingTab } from './TeacherSpeakingTab'

const SKILL_LABELS: Record<string, string> = {
  'READING': 'Đọc hiểu',
  'LISTENING': 'Nghe',
  'WRITING': 'Viết',
  'SPEAKING': 'Nói'
}

const SKILL_COLORS: Record<string, { bg: string, text: string, border: string, hoverBg: string, activeBg: string }> = {
  'READING': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', hoverBg: 'hover:bg-teal-100', activeBg: 'bg-teal-100 border-teal-300 shadow-sm' },
  'LISTENING': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', hoverBg: 'hover:bg-purple-100', activeBg: 'bg-purple-100 border-purple-300 shadow-sm' },
  'WRITING': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', hoverBg: 'hover:bg-sky-100', activeBg: 'bg-sky-100 border-sky-300 shadow-sm' },
  'SPEAKING': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', hoverBg: 'hover:bg-rose-100', activeBg: 'bg-rose-100 border-rose-300 shadow-sm' }
}

interface ClassDetails {
  id: number
  name: string
  code: string
  memberCount: number
  skills: string[]
}

export const ClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [cls, setCls] = useState<ClassDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const activeSkill = searchParams.get('skill') || ''

  useEffect(() => {
    fetchClassDetails()
  }, [id])

  const fetchClassDetails = async () => {
    setLoading(true)
    try {
      // Instead of relying on a dedicated endpoint that might not exist yet,
      // we can fetch from /teacher/classes and find the current class.
      const classes = await api.get<ClassDetails[]>('/teacher/classes')
      const target = classes.find(c => c.id === Number(id))
      
      if (!target) {
        throw new Error('Không tìm thấy lớp học hoặc bạn không có quyền truy cập.')
      }

      setCls(target)

      // Auto select first skill if not provided or invalid
      if (!target.skills.includes(activeSkill)) {
        if (target.skills.length > 0) {
          setSearchParams({ skill: target.skills[0] }, { replace: true })
        } else {
          setSearchParams({}, { replace: true })
        }
      }

    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu lớp học.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkillChange = (skill: string) => {
    setSearchParams({ skill }, { replace: true })
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-white border border-gray-100 rounded-2xl" />
        <div className="h-64 bg-white border border-gray-100 rounded-2xl" />
      </div>
    )
  }

  if (error || !cls) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
        <p className="text-gray-500 mb-4">{error}</p>
        <Link to="/teacher/classes">
          <Button size="sm">Quay lại danh sách</Button>
        </Link>
      </div>
    )
  }

  const colorProfile = SKILL_COLORS[activeSkill] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', hoverBg: 'hover:bg-gray-100', activeBg: 'bg-gray-100' }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <Link to="/teacher/classes">
          <button className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
            {cls.name}
            <span className="font-mono text-sm font-black bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg border border-gray-200">
              {cls.code || `L${cls.id}`}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kỹ năng đang phụ trách
          </p>
        </div>
      </div>

      {cls.skills.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-500">Chưa phân công kỹ năng nào.</p>
        </div>
      ) : (
        <>
          {cls.skills.length > 1 && (
            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {cls.skills.map(skill => {
                const colors = SKILL_COLORS[skill] || SKILL_COLORS['READING']
                const isActive = activeSkill === skill
                return (
                  <button
                    key={skill}
                    onClick={() => handleSkillChange(skill)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all duration-200 uppercase tracking-wide ${isActive ? colors.activeBg + ' ' + colors.text : colors.bg + ' ' + colors.border + ' text-gray-600 ' + colors.hoverBg}`}
                  >
                    {SKILL_LABELS[skill] || skill}
                  </button>
                )
              })}
            </div>
          )}

          {/* Dynamic Workspace Container */}
          <div className={`transition-colors duration-500 bg-white border rounded-2xl shadow-sm ${colorProfile.border} animate-in fade-in slide-in-from-bottom-4`}>
            <div className="p-6">
              {activeSkill === 'READING' && (
                <TeacherReadingTab classId={id!} />
              )}
              {activeSkill === 'LISTENING' && (
                <div className="py-12 text-center text-gray-500 animate-in fade-in zoom-in-95 duration-200">
                  <div className="text-4xl mb-3">🎧</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Không gian Nghe</h3>
                  <p className="text-sm">Tính năng chưa có sẵn.</p>
                </div>
              )}
              {activeSkill === 'WRITING' && (
                <div className="py-12 text-center text-gray-500 animate-in fade-in zoom-in-95 duration-200">
                  <div className="text-4xl mb-3">✍️</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Không gian Viết</h3>
                  <p className="text-sm">Tính năng chưa có sẵn.</p>
                </div>
              )}
              {activeSkill === 'SPEAKING' && (
                <div className="py-12 text-center text-gray-500 animate-in fade-in zoom-in-95 duration-200">
                  <div className="text-4xl mb-3">🎤</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Không gian Nói</h3>
                  <p className="text-sm">Tính năng chưa có sẵn.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
