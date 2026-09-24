import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

interface ClassItem {
  id: number
  name: string
  code: string
  description?: string
  lessonCount: number
  memberCount: number
  skills: string[]
}

const SKILL_LABELS: Record<string, string> = {
  'READING': 'Đọc hiểu',
  'LISTENING': 'Nghe',
  'WRITING': 'Viết',
  'SPEAKING': 'Nói'
}

const SKILL_COLORS: Record<string, string> = {
  'READING': 'bg-teal-50 text-teal-700 border-teal-200',
  'LISTENING': 'bg-purple-50 text-purple-700 border-purple-200',
  'WRITING': 'bg-sky-50 text-sky-700 border-sky-200',
  'SPEAKING': 'bg-rose-50 text-rose-700 border-rose-200'
}

export const ClassListPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    try {
      const data = await api.get<ClassItem[]>('/teacher/classes')
      setClasses(data)
    } catch (err: any) {
      setError('Không thể tải danh sách lớp học.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Lớp đang phụ trách</h1>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách các lớp và kỹ năng bạn được phân công giảng dạy.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-2xl h-48" />
          ))}
        </div>
      ) : classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls, idx) => (
            <div 
              key={cls.id}
              className="transition-all"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <Card 
                className="flex flex-col h-full bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand/30 border border-gray-200"
              >
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-black bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
                      {cls.code || `L${cls.id}`}
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      👥 {cls.memberCount} học sinh
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-3">
                    {cls.name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {cls.skills.length > 0 ? (
                      cls.skills.map(skill => (
                        <span 
                          key={skill}
                          className={`px-2 py-1 text-[11px] font-bold rounded border uppercase tracking-wide ${SKILL_COLORS[skill] || 'bg-gray-50 text-gray-600 border-gray-200'}`}
                        >
                          {SKILL_LABELS[skill] || skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">Chưa phân công kỹ năng</span>
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-gray-50 bg-gray-50/50 rounded-b-2xl flex items-center justify-end">
                  <Link to={`/teacher/classes/${cls.id}`}>
                    <Button variant="primary" size="sm" className="px-5 shadow-sm">
                      Vào lớp
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto text-2xl mb-4 border border-gray-100">
            🏫
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Bạn chưa được phân công lớp học hoặc kỹ năng nào.</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Vui lòng liên hệ quản trị viên để được phân công.
          </p>
        </div>
      )}
    </div>
  )
}
