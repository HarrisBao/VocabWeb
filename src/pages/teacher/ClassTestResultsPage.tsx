import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ParticipantResultDialog } from '../../components/teacher/ParticipantResultDialog'

interface ParticipantResultDto {
  participantKey: string
  displayName: string
  isGuest: boolean
  appliedScore: number
  submittedAt: string
  attemptCount: number
}

export const ClassTestResultsPage: React.FC = () => {
  const { id: testId } = useParams<{ id: string }>()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [participants, setParticipants] = useState<ParticipantResultDto[]>([])
  
  // Dialog state
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantResultDto | null>(null)

  useEffect(() => {
    loadResults()
  }, [testId])

  const loadResults = async () => {
    if (!testId) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<ParticipantResultDto[]>(`/teacher/tests/${testId}/results`)
      setParticipants(data)
    } catch (err: any) {
      setError(err.message || 'Không thể tải kết quả kiểm tra.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Đang tải kết quả...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => window.history.back()}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kết quả bài kiểm tra</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">Bài kiểm tra #{testId}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Main Attempts Card */}
      <Card padding="none" className="overflow-hidden">
        {/* Table / Empty State */}
        {participants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Học sinh</th>
                  <th className="py-3 px-4 text-center">Điểm</th>
                  <th className="py-3 px-4">Thời gian nộp</th>
                  <th className="py-3 px-4 text-right">Chức năng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {participants.map((item) => (
                  <tr key={item.participantKey} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        {item.displayName}
                        {item.isGuest && (
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-bold uppercase rounded">
                            Khách
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-lg font-bold text-sm bg-green-50 text-green-700 border border-green-100">
                        {item.appliedScore}/10
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-500">
                      {new Date(item.submittedAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelectedParticipant(item)}>
                        Xem chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 px-4 text-center">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1">
              Chưa có học sinh nào hoàn thành bài kiểm tra này.
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              Kết quả làm bài sẽ tự động hiển thị tại đây khi học viên nộp bài.
            </p>
            <button onClick={() => window.history.back()} className="text-green-600 font-bold hover:underline">
              Quay lại bài kiểm tra
            </button>
          </div>
        )}
      </Card>

      {selectedParticipant && testId && (
        <ParticipantResultDialog
          testId={parseInt(testId)}
          participantKey={selectedParticipant.participantKey}
          participantName={selectedParticipant.displayName}
          appliedScore={selectedParticipant.appliedScore}
          onClose={() => setSelectedParticipant(null)}
        />
      )}
    </div>
  )
}
