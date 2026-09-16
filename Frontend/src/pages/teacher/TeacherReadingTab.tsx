import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

interface ReadingAssignment {
  id: number
  title: string
  durationMinutes: number
  status: string
  createdAt: string
}

export const TeacherReadingTab: React.FC<{ classId: string }> = ({ classId }) => {
  const [assignments, setAssignments] = useState<ReadingAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAssignments()
  }, [classId])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/teacher/class/${classId}/reading`)
      setAssignments(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const res = await api.post(`/teacher/class/${classId}/reading`, {
        title: 'New Reading Assignment',
        durationMinutes: 60
      })
      navigate(`/teacher/classes/${classId}/reading/${res.data.id}/edit`)
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <div className="py-12 flex justify-center"><Spinner /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Bài tập Reading (DOCX)</h3>
          <p className="text-sm text-gray-500 mt-1">Quản lý bài luyện Reading của lớp. Tạo tự động từ file Word DOCX.</p>
        </div>
        <Button onClick={handleCreate} className="whitespace-nowrap">
          + Tạo bài Reading
        </Button>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center">
          <span className="text-5xl mb-4">📄</span>
          <h4 className="text-lg font-bold text-gray-700 mb-2">Chưa có bài Reading nào.</h4>
          <p className="text-gray-500 mb-6 max-w-md text-sm">Bạn có thể tạo bài tập Reading mới bằng cách upload file Word (.docx) chứa bài đọc và câu hỏi.</p>
          <Button onClick={handleCreate}>+ Tạo bài Reading</Button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Tên bài</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Trạng thái</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Ngày tạo</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assignments.map(a => (
                <tr key={a.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 text-base">{a.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{a.durationMinutes} phút</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${a.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {a.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(a.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                    <Link to={`/teacher/classes/${classId}/reading/${a.id}/edit`}>
                      <Button size="sm" variant="outline">{a.status === 'PUBLISHED' ? 'Xem / Chỉnh sửa' : 'Chỉnh sửa'}</Button>
                    </Link>
                    <Link to={`/teacher/classes/${classId}/reading/${a.id}/results`}>
                      <Button size="sm" variant="outline" className="bg-gray-100 hover:bg-gray-200 border-transparent">Kết quả</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
