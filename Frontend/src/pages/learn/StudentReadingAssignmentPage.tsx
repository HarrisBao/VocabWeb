import React, { useEffect, useState } from 'react'
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
  const [timeLeft, setTimeLeft] = useState<number>(0)
  
  // result state after submit
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [readingId])

  useEffect(() => {
    if (!data || result) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit() // Auto submit when time's up
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [data, result])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/learn/class/${id}/reading/${readingId}`)
      setData(res.data)
      setTimeLeft(res.data.durationMinutes * 60)
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
      const load = 0
      const res = await api.post(`/learn/class/${id}/reading/${readingId}/submit`, answers)
      
      alert('Ná»™p bÃ i thÃ nh cÃ´ng!')
      setResult(res.data)
    } catch (e) {
      
      alert('Lá»—i khi ná»™p bÃ i')
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (loading) return <div className="p-8 text-center"><Spinner /></div>
  
  if (!data) return <div className="p-8 text-center text-red-500 font-bold">BÃ i táº­p khÃ´ng tá»“n táº¡i hoáº·c chÆ°a má»Ÿ.</div>

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shrink-0 shadow-sm relative z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{data.title}</h1>
          {result && <div className="text-sm text-gray-500 mt-1">ÄÃ£ ná»™p bÃ i</div>}
        </div>
        <div className="flex items-center gap-6">
          {!result && (
            <div className={`font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-gray-800'}`}>
              {formatTime(timeLeft)}
            </div>
          )}
          
          {result ? (
            <div className="bg-brand text-white font-bold px-4 py-2 rounded-lg text-lg shadow-md">
              {result.correctCount} / {result.totalQuestions}
            </div>
          ) : (
            <Button onClick={handleSubmit}>Ná»™p bÃ i</Button>
          )}
          
          <Button variant="outline" onClick={() => navigate(-1)}>ThoÃ¡t</Button>
        </div>
      </div>

      <div className="flex-1 flex gap-0 overflow-hidden relative z-0">
        {/* Left Side: Passage */}
        <div className="flex-1 bg-white border-r border-gray-200 overflow-y-auto p-8 custom-scrollbar">
          <div className="prose max-w-none text-[15px] leading-relaxed text-gray-800" dangerouslySetInnerHTML={{ __html: data.passage }}></div>
        </div>

        {/* Right Side: Questions */}
        <div className="flex-1 bg-[#F9FAFB] overflow-y-auto p-8 custom-scrollbar relative">
          <div className="max-w-3xl mx-auto space-y-10">
            {data.questionGroups?.map((g: any) => (
              <div key={g.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="font-bold text-gray-800 mb-6 bg-blue-50 p-4 rounded-xl whitespace-pre-wrap">{g.instruction}</div>
                <div className="space-y-6">
                  {g.questions?.map((q: any) => {
                    const ansResult = result?.answers?.find((a: any) => a.questionId === q.id)
                    return (
                      <div key={q.id} className="flex gap-4 items-start">
                        <div className="w-8 shrink-0 text-right font-bold text-brand mt-1">{q.displayNumber}.</div>
                        <div className="flex-1">
                          <div className="whitespace-pre-wrap text-[15px] font-medium text-gray-800 mb-3">{q.content}</div>
                          
                          {/* Answer Input */}
                          {result ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-gray-500 w-24">CÃ¢u tráº£ lá»i:</span>
                                <span className={`px-3 py-1 rounded font-mono font-bold text-sm ${ansResult?.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {ansResult?.studentAnswer || '(Trá»‘ng)'}
                                </span>
                                {ansResult?.isCorrect ? 'âœ…' : 'âŒ'}
                              </div>
                              {!ansResult?.isCorrect && (
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-gray-500 w-24">ÄÃ¡p Ã¡n Ä‘Ãºng:</span>
                                  <span className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-mono font-bold text-sm">
                                    {ansResult?.correctAnswer}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <input 
                              type="text"
                              value={answers[q.id] || ''}
                              onChange={e => handleAnswerChange(q.id, e.target.value)}
                              className="w-full max-w-sm border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:border-brand focus:ring-0 font-mono uppercase"
                              placeholder="Nháº­p cÃ¢u tráº£ lá»i..."
                              autoComplete="off"
                              spellCheck="false"
                            />
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
      
      {/* Custom Scrollbar Styles for Independent scrolling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; 
        }
      `}</style>
    </div>
  )
}



