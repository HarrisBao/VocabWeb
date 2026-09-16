import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../../services/api'
import { Button } from '../../../components/ui/Button'
import { Spinner } from '../../../components/ui/Spinner'


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
      window.location.href = `/teacher/classes/${classId}/reading/${res.data.id}/edit`
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">BÃ i táº­p Reading (DOCX)</h3>
          <p className="text-sm text-gray-500">Táº¡o bÃ i táº­p tá»± Ä‘á»™ng cháº¥m Ä‘iá»ƒm tá»« file Word DOCX.</p>
        </div>
        <Button onClick={handleCreate}>+ Táº¡o bÃ i Reading</Button>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <span className="text-gray-500">ChÆ°a cÃ³ bÃ i táº­p Reading nÃ o.</span>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-semibold">TÃªn bÃ i</th>
                <th className="px-4 py-3 font-semibold">Tráº¡ng thÃ¡i</th>
                <th className="px-4 py-3 font-semibold">NgÃ y táº¡o</th>
                <th className="px-4 py-3 font-semibold text-right">Thao tÃ¡c</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assignments.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.title}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${a.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(a.createdAt).toLocaleString('vi-VN')}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link to={`/teacher/classes/${classId}/reading/${a.id}/edit`}>
                      <Button size="sm" variant="outline">Sá»­a</Button>
                    </Link>
                    <Link to={`/teacher/classes/${classId}/reading/${a.id}/results`}>
                      <Button size="sm" variant="outline">Káº¿t quáº£</Button>
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

