import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { Spinner } from '../../components/ui/Spinner'
import { Button } from '../../components/ui/Button'

interface Attempt {
  id: number
  attemptNumber: number
  startedAt: string
  submittedAt: string
  timeSpentSeconds: number
  allowedDurationSecondsSnapshot: number
  overtimeSeconds: number
  correctCount: number
  totalQuestions: number
  studentId: string
  studentName: string
}

interface StudentGroup {
  studentId: string
  studentName: string
  attempts: Attempt[]
}

export const TeacherReadingResultsPage: React.FC = () => {
  const { id: classId, readingId } = useParams()
  const [loading, setLoading] = useState(true)
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([])
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchResults()
  }, [readingId, classId])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/teacher/class/${classId}/reading/${readingId}/attempts`)
      const attemptsData: Attempt[] = Array.isArray(res) ? res : []
      
      const groupsMap = new Map<string, StudentGroup>()
      for (const a of attemptsData) {
        if (!groupsMap.has(a.studentId)) {
          groupsMap.set(a.studentId, {
            studentId: a.studentId,
            studentName: a.studentName,
            attempts: []
          })
        }
        groupsMap.get(a.studentId)!.attempts.push(a)
      }
      
      // Sort attempts by attemptNumber descending
      for (const g of groupsMap.values()) {
        g.attempts.sort((a, b) => b.attemptNumber - a.attemptNumber)
      }

      setStudentGroups(Array.from(groupsMap.values()).sort((a, b) => a.studentName.localeCompare(b.studentName)))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const toggleStudent = (studentId: string) => {
    setExpandedStudents(prev => {
      const next = new Set(prev)
      if (next.has(studentId)) next.delete(studentId)
      else next.add(studentId)
      return next
    })
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (loading) return <div className="p-8 text-center"><Spinner /></div>

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link to={`/teacher/reading/${readingId}/results`} className="text-brand hover:underline text-sm mb-1 inline-block">&larr; Quay lại danh sách lớp</Link>
          <h1 className="text-2xl font-bold">Kết quả bài làm</h1>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Học sinh</th>
              <th className="px-4 py-3 font-semibold text-center">Số lần làm</th>
              <th className="px-4 py-3 font-semibold text-center">Kết quả gần nhất</th>
              <th className="px-4 py-3 font-semibold text-center">Thời gian</th>
              <th className="px-4 py-3 font-semibold text-center">Quá giờ</th>
              <th className="px-4 py-3 font-semibold">Ngày nộp gần nhất</th>
              <th className="px-4 py-3 font-semibold text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {studentGroups.map(group => {
              const latestAttempt = group.attempts[0]
              const isExpanded = expandedStudents.has(group.studentId)
              
              return (
                <React.Fragment key={group.studentId}>
                  <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleStudent(group.studentId)}>
                    <td className="px-4 py-3 font-bold text-gray-900">{group.studentName}</td>
                    <td className="px-4 py-3 text-center">{group.attempts.length}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded font-bold ${latestAttempt.correctCount >= latestAttempt.totalQuestions / 2 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {latestAttempt.correctCount} / {latestAttempt.totalQuestions}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-center">
                      {formatTime(latestAttempt.timeSpentSeconds)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {latestAttempt.overtimeSeconds > 0 ? (
                        <span className="text-red-500 font-medium">+{formatTime(latestAttempt.overtimeSeconds)}</span>
                      ) : (
                        <span className="text-gray-400">Đúng thời gian</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(latestAttempt.submittedAt).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3 text-right text-gray-400">
                      {isExpanded ? '▲' : '▼'}
                    </td>
                  </tr>
                  
                  {isExpanded && group.attempts.map(a => (
                    <tr key={a.id} className="bg-gray-50/50">
                      <td className="px-4 py-2 pl-8 border-l-4 border-brand text-gray-600">
                        Lần {a.attemptNumber}
                      </td>
                      <td colSpan={1}></td>
                      <td className="px-4 py-2 text-center text-gray-700">
                        {a.correctCount} / {a.totalQuestions}
                      </td>
                      <td className="px-4 py-2 text-center text-gray-500">
                        {formatTime(a.timeSpentSeconds)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {a.overtimeSeconds > 0 ? (
                          <span className="text-red-500 text-xs">+{formatTime(a.overtimeSeconds)}</span>
                        ) : (
                          <span className="text-gray-400 text-xs">Đúng thời gian</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-gray-500" colSpan={2}>
                        {new Date(a.submittedAt).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )
            })}
            {studentGroups.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-8 text-gray-500">Chưa có học sinh nào nộp bài.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
