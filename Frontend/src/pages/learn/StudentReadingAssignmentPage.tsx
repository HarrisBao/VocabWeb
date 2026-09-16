import React, { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

export const StudentReadingAssignmentPage: React.FC = () => {
  const { id, readingId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  
  // map questionId -> user answer
  const [answers, setAnswers] = useState<Record<number, string>>({})
  
  // timer state
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const [allowedDuration, setAllowedDuration] = useState<number>(0)
  const [elapsed, setElapsed] = useState<number>(0)
  
  // result state after submit
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    fetchDataAndStart()
  }, [readingId, id])

  useEffect(() => {
    if (!startedAt || result) return
    
    const interval = setInterval(() => {
      const now = new Date()
      const diffSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000)
      setElapsed(diffSeconds > 0 ? diffSeconds : 0)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [startedAt, result])

  const fetchDataAndStart = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/learn/class/${id}/reading/${readingId}`)
      setData(res)
      
      const startRes = await api.post(`/learn/class/${id}/reading/${readingId}/start`, {})
      setStartedAt(new Date(startRes.startedAt))
      setAllowedDuration(startRes.allowedDurationSecondsSnapshot)
      
      const initialElapsed = Math.floor((new Date().getTime() - new Date(startRes.startedAt).getTime()) / 1000)
      setElapsed(initialElapsed > 0 ? initialElapsed : 0)

    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const handleSubmit = async () => {
    try {
      const res = await api.post(`/learn/class/${id}/reading/${readingId}/submit`, answers)
      alert('Nộp bài thành công!')
      setResult(res)
    } catch (e) {
      alert('Lỗi khi nộp bài')
    }
  }

  const handleRetry = () => {
    // Reset state to do a new attempt
    setResult(null)
    setAnswers({})
    setStartedAt(null)
    setElapsed(0)
    fetchDataAndStart()
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (loading) return <div className="p-8 text-center"><Spinner /></div>
  
  if (!data) return <div className="p-8 text-center text-red-500 font-bold">Bài tập không tồn tại hoặc chưa mở.</div>

  const isOvertime = elapsed > allowedDuration
  const timeLeftOrOvertime = isOvertime ? elapsed - allowedDuration : allowedDuration - elapsed

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shrink-0 shadow-sm relative z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{data.title}</h1>
          {result && <div className="text-sm text-gray-500 mt-1">Đã nộp bài</div>}
        </div>
        <div className="flex items-center gap-6">
          {!result && (
            <div className={`font-mono text-xl font-bold ${isOvertime ? 'text-red-600' : 'text-gray-800'}`}>
              {isOvertime ? `Quá giờ +${formatTime(timeLeftOrOvertime)}` : formatTime(timeLeftOrOvertime)}
            </div>
          )}
          
          {result ? (
            <div className="flex gap-4 items-center">
              <div className="bg-brand text-white font-bold px-4 py-2 rounded-lg text-lg shadow-md">
                {result.correctCount} / {result.totalQuestions}
              </div>
              <Button onClick={handleRetry} variant="outline">Làm lại</Button>
            </div>
          ) : (
            <Button onClick={handleSubmit} className="font-bold text-base px-8 shadow-sm hover:shadow">
              Nộp bài
            </Button>
          )}
          
          <Link to={`/learn/classes/${id}`} className="text-gray-400 hover:text-gray-600 text-sm font-bold">
            ✕ Thoát
          </Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Passage */}
        <div className="w-1/2 border-r border-gray-200 bg-white overflow-y-auto custom-scrollbar p-10">
          <div 
            className="prose prose-lg max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-brand"
            dangerouslySetInnerHTML={{ __html: data.passage || '' }} 
          />
        </div>

        {/* Right: Questions */}
        <div className="w-1/2 bg-gray-50 overflow-y-auto custom-scrollbar p-10">
          {result && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm flex flex-col items-center">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Kết quả làm bài</h2>
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Thời gian quy định</p>
                  <p className="font-bold text-gray-900">{Math.floor(allowedDuration / 60)} phút</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Thời gian làm</p>
                  <p className="font-bold text-gray-900">{formatTime(result.timeSpentSeconds)}</p>
                </div>
              </div>
              {result.overtimeSeconds > 0 && (
                <div className="mt-4 w-full bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-red-600 mb-1">Quá giờ</p>
                  <p className="font-bold text-red-700">+{formatTime(result.overtimeSeconds)}</p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-10 max-w-3xl mx-auto">
            {data.questionGroups?.map((group: any) => (
              <div key={group.id} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <span className="inline-block px-3 py-1 bg-brand/10 text-brand rounded-lg text-xs font-bold uppercase tracking-wider mb-3">
                    {group.displayLabel || 'Questions'}
                  </span>
                  {group.instruction && (
                    <div className="font-bold text-gray-800 text-lg leading-snug">{group.instruction}</div>
                  )}
                </div>
                
                <div className="space-y-6">
                  {group.questions?.map((q: any) => {
                    const ansResult = result?.answers?.find((a: any) => a.questionId === q.id)
                    
                    return (
                      <div key={q.id} className="flex gap-6 items-start group">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 shadow-sm border border-gray-200">
                          {q.displayNumber}
                        </div>
                        <div className="flex-1 pt-1.5">
                          <div className="text-gray-900 text-base mb-3 leading-relaxed">{q.content}</div>
                          <input
                            type="text"
                            disabled={!!result}
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className={`w-full max-w-md border rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all ${
                              result 
                                ? ansResult?.isCorrect 
                                  ? 'border-green-300 bg-green-50 text-green-900' 
                                  : 'border-red-300 bg-red-50 text-red-900'
                                : 'border-gray-300 bg-white hover:border-gray-400'
                            }`}
                            placeholder="Nhập câu trả lời..."
                          />
                          
                          {result && (
                            <div className="mt-3 flex items-center gap-2">
                              {ansResult?.isCorrect ? (
                                <span className="text-green-600 font-bold flex items-center gap-1">
                                  <span>✅</span> Chính xác
                                </span>
                              ) : (
                                <div className="text-red-600 font-bold flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-100 inline-flex">
                                  <span>❌</span>
                                  <span className="text-gray-600 text-sm font-medium border-l border-red-200 pl-2 ml-1">Đáp án:</span>
                                  <span className="text-green-700">{ansResult?.correctAnswer}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
