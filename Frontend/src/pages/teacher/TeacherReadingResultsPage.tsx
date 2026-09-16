import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { Spinner } from '../../components/ui/Spinner'

import { Button } from '../../components/ui/Button'

export const TeacherReadingResultsPage: React.FC = () => {
  const { id, readingId } = useParams()
  const [loading, setLoading] = useState(true)
  const [attempts, setAttempts] = useState<any[]>([])

  useEffect(() => {
    fetchResults()
  }, [readingId])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/teacher/class/${id}/reading/${readingId}/attempts`)
      setAttempts(Array.isArray(res) ? res : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center"><Spinner /></div>

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link to={`/teacher/classes/${id}`} className="text-brand hover:underline text-sm mb-1 inline-block">&larr; Quay lại lớp học</Link>
          <h1 className="text-2xl font-bold">Kết quả bài làm</h1>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Học sinh</th>
              <th className="px-4 py-3 font-semibold text-center">Số câu đúng</th>
              <th className="px-4 py-3 font-semibold text-center">Thời gian làm</th>
              <th className="px-4 py-3 font-semibold">Ngày nộp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {attempts.map(a => (
              <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-bold text-gray-900">{a.studentName}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded font-bold ${a.correctCount >= a.totalQuestions / 2 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {a.correctCount} / {a.totalQuestions}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-center">{Math.round(a.timeSpentSeconds / 60)} phút</td>
                <td className="px-4 py-3 text-gray-500">{new Date(a.submittedAt).toLocaleString('vi-VN')}</td>
              </tr>
            ))}
            {attempts.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-8 text-gray-500">Chưa có học sinh nào nộp bài.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

