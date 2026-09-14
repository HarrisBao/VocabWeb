import React, { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Card'

interface AttemptHistoryDto {
  attemptId: number
  attemptNumber: number
  score: number
  submittedAt: string
  isAppliedScore: boolean
}

interface AttemptDetailDto {
  attemptId: number
  attemptNumber: number
  score: number
  durationSeconds: number
  submittedAt: string
  activitySummaries: ActivitySummaryDto[]
}

interface ActivitySummaryDto {
  activityType: string
  correctCount: number
  incorrectCount: number
  invalidCount: number
}

interface WrongAnswerDto {
  answerId: number
  activityType: string
  questionPrompt: string
  studentAnswer: string
  correctAnswer: string
}

interface Props {
  testId: number
  participantKey: string
  participantName: string
  appliedScore: number
  onClose: () => void
}

type DialogView = 'history' | 'attempt' | 'activityErrors'

const ACTIVITY_LABELS: Record<string, string> = {
  WORD_TO_MEANING: 'Từ → Chọn nghĩa',
  MEANING_TO_WORD: 'Nghĩa → Chọn từ',
  LISTEN_TO_WORD: 'Nghe → Chọn từ',
  LISTEN_TO_MEANING: 'Nghe → Chọn nghĩa',
  MEANING_TO_TYPE_WORD: 'Nghĩa → Điền từ',
  LISTEN_TO_TYPE_WORD: 'Nghe → Điền từ',
  WORD_TO_TYPE_MEANING: 'Từ → Điền nghĩa',
  MISSING_LETTERS: 'Điền chữ còn thiếu',
  UNSCRAMBLE_WORD: 'Sắp xếp chữ thành từ',
  MATCH_WORD_MEANING: 'Ghép Từ ↔ Nghĩa',
  PRONUNCIATION: 'Phát âm'
}

export const ParticipantResultDialog: React.FC<Props> = ({ testId, participantKey, participantName, appliedScore, onClose }) => {
  const [view, setView] = useState<DialogView>('history')
  
  // History state
  const [history, setHistory] = useState<AttemptHistoryDto[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  // Attempt detail state
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null)
  const [attemptDetail, setAttemptDetail] = useState<AttemptDetailDto | null>(null)
  const [loadingAttempt, setLoadingAttempt] = useState(false)

  // Activity Errors state
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswerDto[]>([])
  const [loadingErrors, setLoadingErrors] = useState(false)
  const [errorIndex, setErrorIndex] = useState(0)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoadingHistory(true)
    try {
      const data = await api.get<AttemptHistoryDto[]>(`/teacher/tests/${testId}/participants/${participantKey}/history`)
      setHistory(data)
    } catch {
      //
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSelectAttempt = async (attemptId: number) => {
    setSelectedAttemptId(attemptId)
    setView('attempt')
    setLoadingAttempt(true)
    try {
      const data = await api.get<AttemptDetailDto>(`/teacher/results/attempts/${attemptId}/detail`)
      setAttemptDetail(data)
    } catch {
      //
    } finally {
      setLoadingAttempt(false)
    }
  }

  const handleSelectActivityErrors = async (activityType: string) => {
    if (!selectedAttemptId) return
    setSelectedActivity(activityType)
    setView('activityErrors')
    setErrorIndex(0)
    setLoadingErrors(true)
    try {
      const data = await api.get<WrongAnswerDto[]>(`/teacher/results/attempts/${selectedAttemptId}/activities/${activityType}/errors`)
      setWrongAnswers(data)
    } catch {
      //
    } finally {
      setLoadingErrors(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentError = wrongAnswers[errorIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            {view !== 'history' && (
              <button 
                onClick={() => view === 'activityErrors' ? setView('attempt') : setView('history')}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
              >
                ←
              </button>
            )}
            <div>
              <h2 className="font-bold text-gray-900 text-lg">
                {view === 'history' && participantName}
                {view === 'attempt' && `${participantName} - Lượt ${attemptDetail?.attemptNumber}`}
                {view === 'activityErrors' && `${ACTIVITY_LABELS[selectedActivity || ''] || selectedActivity} - ${wrongAnswers.length} câu sai`}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 font-bold transition-colors">
            ✕
          </button>
        </div>

        {/* Content area */}
        <div className="p-6 overflow-y-auto flex-1">
          {view === 'history' && (
            <div className="space-y-6">
              <div className="flex gap-8 border-b border-gray-100 pb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Điểm đang áp dụng:</p>
                  <p className="text-2xl font-bold text-green-600">{appliedScore}/10</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tổng số lượt làm:</p>
                  <p className="text-2xl font-bold text-gray-800">{history.length}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Lịch sử lượt làm</h3>
                <p className="text-xs text-gray-500 mb-4">Chọn một lượt để xem chi tiết.</p>
                
                {loadingHistory ? (
                  <div className="py-8 flex justify-center"><div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {history.map(h => (
                      <button
                        key={h.attemptId}
                        onClick={() => handleSelectAttempt(h.attemptId)}
                        className="text-left p-4 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors flex flex-col gap-2 relative"
                      >
                        <span className="font-bold text-gray-700">Lượt {h.attemptNumber}</span>
                        <span className="text-lg font-black text-gray-900">{h.score}</span>
                        {h.isAppliedScore && (
                          <span className="absolute top-2 right-2 text-[10px] font-bold bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                            Đang tính điểm
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {view === 'attempt' && (
            <div className="space-y-6">
              {loadingAttempt || !attemptDetail ? (
                <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-4 border-b border-gray-100 pb-4">
                    <div className="bg-gray-50 px-4 py-2 rounded-xl">
                      <p className="text-xs text-gray-500">Điểm</p>
                      <p className="font-bold text-lg text-gray-900">{attemptDetail.score}/10</p>
                    </div>
                    <div className="bg-gray-50 px-4 py-2 rounded-xl">
                      <p className="text-xs text-gray-500">Thời gian</p>
                      <p className="font-bold text-lg text-gray-900">{formatDuration(attemptDetail.durationSeconds)}</p>
                    </div>
                    <div className="bg-gray-50 px-4 py-2 rounded-xl">
                      <p className="text-xs text-gray-500">Nộp bài</p>
                      <p className="font-bold text-sm text-gray-900 mt-1">
                        {new Date(attemptDetail.submittedAt).toLocaleDateString('vi-VN')} &middot; {new Date(attemptDetail.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Chi tiết hoạt động</h3>
                    <div className="space-y-3">
                      {attemptDetail.activitySummaries.map((act, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
                          <div>
                            <p className="font-bold text-gray-900 mb-1">{ACTIVITY_LABELS[act.activityType] || act.activityType}</p>
                            <p className="text-sm text-gray-600">
                              <span className="text-green-600 font-bold">{act.correctCount} đúng</span> &middot; <span className={act.incorrectCount > 0 ? 'text-red-600 font-bold' : ''}>{act.incorrectCount} sai</span>
                              {act.invalidCount > 0 && <span> &middot; {act.invalidCount} câu không được tính</span>}
                            </p>
                          </div>
                          <div>
                            {act.incorrectCount > 0 ? (
                              <Button size="sm" variant="outline" onClick={() => handleSelectActivityErrors(act.activityType)}>
                                Xem {act.incorrectCount} câu sai
                              </Button>
                            ) : (
                              <span className="text-sm font-bold text-green-600">✓ Không có câu sai</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {view === 'activityErrors' && (
            <div className="h-full flex flex-col min-h-[300px]">
              {loadingErrors ? (
                <div className="flex-1 flex justify-center items-center"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
              ) : wrongAnswers.length > 0 && currentError ? (
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-bold mb-4">Câu sai {errorIndex + 1} / {wrongAnswers.length}</p>
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Mục tiêu / Câu hỏi:</p>
                        <p className="text-lg font-medium text-gray-900">{currentError.questionPrompt}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                          <p className="text-xs text-green-700 uppercase font-bold mb-1">Đáp án đúng:</p>
                          <p className="text-base font-bold text-green-900">{currentError.correctAnswer}</p>
                        </div>
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                          <p className="text-xs text-red-700 uppercase font-bold mb-1">Học sinh trả lời:</p>
                          <p className="text-base font-bold text-red-900">{currentError.studentAnswer || '(Để trống)'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-8">
                    <Button 
                      variant="outline" 
                      onClick={() => setErrorIndex(prev => Math.max(0, prev - 1))}
                      disabled={errorIndex === 0}
                    >
                      ← Câu trước
                    </Button>
                    <span className="text-sm font-bold text-gray-500">{errorIndex + 1} / {wrongAnswers.length}</span>
                    <Button 
                      variant="outline" 
                      onClick={() => setErrorIndex(prev => Math.min(wrongAnswers.length - 1, prev + 1))}
                      disabled={errorIndex === wrongAnswers.length - 1}
                    >
                      Câu sau →
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500">Không tìm thấy chi tiết câu sai.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
