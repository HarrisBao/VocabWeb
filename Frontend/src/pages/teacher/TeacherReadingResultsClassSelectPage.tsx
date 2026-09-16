import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

interface ClassResultSummary {
  classId: number
  className: string
  totalStudents: number
  completedCount: number
  notCompletedCount: number
  isActive: boolean
}

export const TeacherReadingResultsClassSelectPage: React.FC = () => {
  const { readingId } = useParams<{ readingId: string }>()
  const [summaries, setSummaries] = useState<ClassResultSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummaries()
  }, [readingId])

  const fetchSummaries = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/teacher/reading/${readingId}/results-by-class`)
      setSummaries(Array.isArray(res) ? res : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kết quả theo lớp</h1>
          <p className="text-gray-500 mt-1">Chọn một lớp để xem chi tiết kết quả bài làm.</p>
        </div>
        <Link to="/teacher/reading">
          <Button variant="outline">Quay lại danh sách</Button>
        </Link>
      </div>

      {summaries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500 mb-6">Bài Reading này chưa được giao cho lớp nào hoặc không có dữ liệu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summaries.map(s => (
            <div key={s.classId} className={`bg-white rounded-2xl border ${!s.isActive ? 'border-gray-200 opacity-75' : 'border-gray-200'} p-6 shadow-sm flex flex-col`}>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{s.className}</h3>
              {!s.isActive && <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded mb-3">Đã ngừng giao</span>}
              <div className="space-y-2 mb-6 flex-grow">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tổng học sinh</span>
                  <span className="font-medium text-gray-900">{s.totalStudents}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Đã làm</span>
                  <span className="font-medium text-green-600">{s.completedCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Chưa làm</span>
                  <span className="font-medium text-red-500">{s.notCompletedCount}</span>
                </div>
              </div>
              <Link to={`/teacher/classes/${s.classId}/reading/${readingId}/results`} className="block w-full">
                <Button variant="outline" className="w-full">Xem kết quả</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
