import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

interface ReadingAssignment {
  id: number
  classId?: number
  title: string
  durationMinutes: number
  status: string
  createdAt: string
  questionCount: number
  assignedClassesCount: number
}

interface ClassItem {
  id: number
  name: string
  code: string
}

export const TeacherReadingListPage: React.FC = () => {
  const [assignments, setAssignments] = useState<ReadingAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  // Assign modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [assignTargetId, setAssignTargetId] = useState<number | null>(null)
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([])
  const [assigningLoading, setAssigningLoading] = useState(false)

  const navigate = useNavigate()
  
  // Create form state
  const [newTitle, setNewTitle] = useState('')
  const [newDuration, setNewDuration] = useState(60)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchAssignments()
    fetchClasses()
  }, [])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const res = await api.get('/teacher/reading')
      setAssignments(Array.isArray(res) ? res : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const res = await api.get('/teacher/class')
      setClasses(Array.isArray(res) ? res : [])
    } catch (e) {
      console.error(e)
    }
  }

  const handleOpenCreate = () => {
    setNewTitle('Bài luyện Reading mới')
    setNewDuration(60)
    setIsCreateModalOpen(true)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsCreating(true)
      const classId = classes.length > 0 ? classes[0].id : 0;
      const res = await api.post(`/teacher/class/${classId}/reading`, {
        title: newTitle,
        durationMinutes: newDuration
      })
      navigate(`/teacher/classes/${classId}/reading/${res.id}/edit`)
    } catch (err) {
      console.error(err)
      alert('Lỗi khi tạo bài Reading.')
      setIsCreating(false)
    }
  }

  const handleOpenAssign = async (id: number) => {
    try {
      setAssignTargetId(id)
      setIsAssignModalOpen(true)
      const res = await api.get(`/teacher/reading/${id}/classes`)
      if (res && res.assignedClassIds) {
        setSelectedClassIds(res.assignedClassIds)
      }
    } catch (e) {
      console.error(e)
      alert("Lỗi khi lưu thiết lập lớp")
    }
  }

  const handleToggleClass = (classId: number) => {
    setSelectedClassIds(prev => 
      prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]
    )
  }

  const handleAssignSubmit = async () => {
    if (!assignTargetId) return
    try {
      setAssigningLoading(true)
      await api.post(`/teacher/reading/${assignTargetId}/assign`, selectedClassIds)
      setIsAssignModalOpen(false)
      fetchAssignments()
    } catch (e) {
      console.error(e)
      alert("Lỗi khi lưu thiết lập lớp")
    } finally {
      setAssigningLoading(false)
    }
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reading</h1>
          <p className="text-gray-500 mt-1">Quản lý và giao bài luyện Reading cho nhiều lớp học.</p>
        </div>
        <Button onClick={handleOpenCreate}>+ Tạo bài Reading</Button>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center flex flex-col items-center">
          <span className="text-5xl mb-4">📖</span>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có bài Reading nào.</h3>
          <p className="text-gray-500 mb-6 text-sm max-w-sm">Tạo bài tập Reading mới để giao cho học sinh. Hệ thống sẽ tự động chấm điểm dựa trên cấu hình của bạn.</p>
          <Button onClick={handleOpenCreate}>+ Tạo bài Reading</Button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Tên bài Reading</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Trạng thái</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Cấu trúc</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Lớp được giao</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Ngày tạo</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assignments.map(a => {
                const editClassContext = a.classId || (classes.length > 0 ? classes[0].id : 0)
                
                return (
                <tr key={a.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 text-base">{a.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${a.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {a.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="font-medium">{a.questionCount} câu</div>
                    <div className="text-xs text-gray-400">{a.durationMinutes} phút</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                      {a.assignedClassesCount > 0 ? `${a.assignedClassesCount} lớp` : 'Chưa giao'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(a.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                    <Link to={`/teacher/classes/${editClassContext}/reading/${a.id}/edit`}>
                      <Button size="sm" variant="outline">{a.status === 'PUBLISHED' ? 'Xem / Chỉnh sửa' : 'Chỉnh sửa'}</Button>
                    </Link>
                    
                    {a.status === 'PUBLISHED' && (
                      <Button size="sm" variant="outline" onClick={() => handleOpenAssign(a.id)}>Giao cho lớp</Button>
                    )}

                    {a.status === 'PUBLISHED' && (
                      <Link to={`/teacher/classes/${editClassContext}/reading/${a.id}/results`}>
                        <Button size="sm" variant="outline" className="bg-gray-100 hover:bg-gray-200 border-transparent">Kết quả</Button>
                      </Link>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Tạo bài Reading</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Tên bài Reading</label>
                <input
                  required
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-brand focus:border-brand"
                  placeholder="Ví dụ: Reading Practice 01"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Thời gian (phút)</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={newDuration}
                  onChange={e => setNewDuration(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-brand focus:border-brand"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Hủy</Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Đang tạo...' : 'Tiếp tục'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Giao bài cho lớp</h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Chọn lớp:</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {classes.map(c => (
                  <label key={c.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedClassIds.includes(c.id)}
                      onChange={() => handleToggleClass(c.id)}
                      className="w-5 h-5 text-brand rounded border-gray-300 focus:ring-brand"
                    />
                    <span className="text-sm font-medium">{c.name} - {c.code}</span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-500">Đã chọn: {selectedClassIds.length} lớp</p>
              <div className="pt-4 flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>Hủy</Button>
                <Button onClick={handleAssignSubmit} disabled={assigningLoading}>
                  {assigningLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
