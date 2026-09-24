import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

interface ClassItem {
  id: number
  name: string
  code: string
  description?: string
  fixedLinkToken: string
  fixedLinkUrl: string
  lessonCount: number
  memberCount: number
  createdAt: string
}

export const ClassListPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)
  
  const [newClassName, setNewClassName] = useState('')
  const [newClassCode, setNewClassCode] = useState('')
  const [newClassDesc, setNewClassDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const data = await api.get<ClassItem[]>('/teacher/class')
      setClasses(data)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Không thể tải danh sách lớp học.' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClassName.trim()) return

    setCreating(true)
    try {
      await api.post('/teacher/class', {
        name: newClassName.trim(),
        code: newClassCode.trim() || undefined,
        description: newClassDesc.trim() || undefined
      })
      setMessage({ type: 'success', text: 'Tạo lớp học thành công!' })
      setIsCreateModalOpen(false)
      setNewClassName('')
      setNewClassCode('')
      setNewClassDesc('')
      fetchClasses()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Tạo lớp học thất bại.' })
    } finally {
      setCreating(false)
    }
  }

  const handleCopyFixedLink = (cls: ClassItem) => {
    const fullUrl = `${window.location.origin}${cls.fixedLinkUrl}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(cls.id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  const handleDeleteClass = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa lớp "${name}"?`)) return

    try {
      await api.delete(`/teacher/class/${id}`)
      setMessage({ type: 'success', text: 'Đã xóa lớp học.' })
      setClasses(classes.filter(c => c.id !== id))
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Xóa lớp thất bại.' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Quản lý Lớp học</h1>
          <p className="text-sm text-gray-500 mt-1">
            Mỗi lớp sở hữu 1 đường link cố định. Gửi link 1 lần, học viên có thể truy cập toàn bộ bài học được giao.
          </p>
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
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                  {cls.description || 'Lớp học luyện thi từ vựng tại MLC.'}
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
                  <Link to={`/teacher/classes/${cls.id}`}>
                    <Button variant="primary" size="sm">
                      Vào lớp học
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClass(cls.id, cls.name)}
                    className="text-red-600 hover:bg-red-50 p-2"
                    title="Xóa lớp"
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
            🏫
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa tạo lớp học nào</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Tạo lớp học để tập hợp các bài học từ vựng và bài kiểm tra cho học viên.
          </p>
          
        </div>
      )}

      {/* Create Class Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tạo Lớp học mới</h3>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <Input
                label="Tên lớp học *"
                placeholder="VD: IELTS Intensive Band 6.5 - Ca Tối"
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                required
              />

              <Input
                label="Mã lớp (tùy chọn)"
                placeholder="Để trống để hệ thống tự tạo mã ngẫu nhiên"
                value={newClassCode}
                onChange={e => setNewClassCode(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả lớp học</label>
                <textarea
                  placeholder="Lịch học, ghi chú hoặc đối tượng mục tiêu..."
                  value={newClassDesc}
                  onChange={e => setNewClassDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" size="sm" loading={creating}>
                  Tạo lớp học
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
