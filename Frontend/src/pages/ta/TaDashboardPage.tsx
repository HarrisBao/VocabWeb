import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { api } from '../../services/api'
import { ClassDto } from '../../types'

export const TaDashboardPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassDto[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const res = await api.get<ClassDto[]>('/teacher/classes')
      setClasses(res)
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyFixedLink = (cls: ClassDto) => {
    const fullUrl = `${window.location.origin}/class/${cls.fixedLinkToken}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(cls.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Danh sách Lớp phụ trách</h1>
          <p className="text-sm text-gray-500 mt-1">
            Các lớp học bạn được phân công làm Trợ giảng (TA).
          </p>
        </div>
      </div>

      {/* Class Cards */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        </div>
      ) : classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Card key={cls.id} hover className="flex flex-col justify-between p-6">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-black bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg">
                    {cls.code}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <span>👥 {cls.memberCount} học sinh</span>
                  </div>
                </div>

                <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1">{cls.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                  {cls.description || 'Lớp học luyện thi từ vựng IELTS Thanh Lê.'}
                </p>

                <p className="text-xs text-gray-600 mb-4 font-semibold">
                  Giáo viên: {cls.teacherName || 'Không xác định'}
                </p>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-2 mb-4">
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-gray-400 block uppercase">Link lớp học cố định</span>
                    <span className="text-xs font-mono text-gray-700 truncate block">
                      /class/{cls.fixedLinkToken.slice(0, 10)}...
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyFixedLink(cls)}
                    className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-xs font-bold text-green-700 whitespace-nowrap shadow-2xs transition-colors"
                  >
                    {copiedId === cls.id ? '✓ Đã copy' : '📋 Copy'}
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500 font-medium">
                  📚 {cls.lessonCount} bài học
                </span>
                <div className="flex items-center gap-2">
                  <Link to={`/ta/classes/${cls.id}`}>
                    <Button variant="primary" size="sm">
                      Vào lớp học
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
            🎓
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có lớp phụ trách</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Bạn chưa được phân công làm Trợ giảng cho bất kỳ lớp học nào.
          </p>
        </div>
      )}
    </div>
  )
}
