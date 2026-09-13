import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

interface TestDetails {
  id: number
  title: string
  description?: string
  vocabularySetId: number
  vocabularySetTitle: string
  classId?: number
  className?: string
  enabledTypes: string[]
  totalQuestions: number
  passScore: number
  timeLimitMinutes?: number
  attemptCount: number
  createdAt: string
}

export enum ActivityType {
  WORD_TO_MEANING = 0,
  MEANING_TO_WORD = 1,
  LISTEN_TO_WORD = 2,
  LISTEN_TO_MEANING = 3,
  MEANING_TO_TYPE_WORD = 4,
  LISTEN_TO_TYPE_WORD = 5,
  WORD_TO_TYPE_MEANING = 6,
  MISSING_LETTERS = 7,
  UNSCRAMBLE_WORD = 8,
  MATCH_WORD_MEANING = 9,
  PRONUNCIATION = 10,
}

export interface QuestionOption {
  vocabularyItemId: number;
  text: string;
}

export interface GeneratedQuestion {
  questionId: string;
  type: ActivityType;
  targetVocabularyItemId: number;
  questionPrompt: string;
  options: QuestionOption[];
  audioBehavior: number;
}

export interface EvaluationResult {
  questionId: string;
  isCorrect: boolean;
  technicalFailure: boolean;
  userAnswer: string;
  correctAnswer: string;
}

export interface EvaluateResponse {
  finalScore: number;
  results: EvaluationResult[];
}

import { ActivityPreview } from '../../components/activities/ActivityPreview'

export const TestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [test, setTest] = useState<TestDetails | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Mock Test State
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [evaluation, setEvaluation] = useState<EvaluateResponse | null>(null)

  useEffect(() => {
    fetchTestDetails()
  }, [id])

  const fetchTestDetails = async () => {
    setLoading(true)
    try {
      const data = await api.get<TestDetails>(`/teacher/test/${id}`)
      setTest(data)
    } catch (err: any) {
      setMessage(err.message || 'Không thể tải chi tiết bài kiểm tra.')
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePreview = async () => {
    setPreviewLoading(true)
    setEvaluation(null)
    setCurrentQuestionIndex(0)
    setSubmissions([])
    try {
      const data = await api.get<GeneratedQuestion[]>(`/teacher/test/${id}/preview`)
      setQuestions(data)
    } catch (err: any) {
      alert(err.message || 'Không thể sinh câu hỏi thử nghiệm.')
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleAnswer = async (answerValue: string, technicalFailure: boolean = false) => {
    const currentQ = questions[currentQuestionIndex]
    const newSubmissions = [
      ...submissions,
      {
        questionId: currentQ.questionId,
        targetVocabularyItemId: currentQ.targetVocabularyItemId,
        type: currentQ.type,
        answerValue,
        technicalFailure
      }
    ]
    
    setSubmissions(newSubmissions)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Finished
      submitMockTest(newSubmissions)
    }
  }

  const submitMockTest = async (finalSubmissions: any[]) => {
    try {
      const data = await api.post<EvaluateResponse>(`/teacher/test/preview-evaluate`, {
        testId: Number(id),
        submissions: finalSubmissions
      })
      setEvaluation(data)
    } catch (err: any) {
      alert(err.message || 'Lỗi chấm điểm.')
    }
  }

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!test) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">{message || 'Không tìm thấy bài kiểm tra.'}</p>
        <Link to="/teacher/tests">
          <Button size="sm">Quay lại danh sách</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/teacher/tests">
            <button className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">
              ←
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{test.title}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Nguồn: <span className="font-semibold text-green-700">{test.vocabularySetTitle}</span>
              {test.className && ` • Lớp: ${test.className}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleGeneratePreview}
            loading={previewLoading}
          >
            🎲 Sinh & Xem trước đề thi
          </Button>

          <Link to={`/teacher/tests/${test.id}/results`}>
            <Button size="sm" variant="outline">
              📊 Xem kết quả ({test.attemptCount})
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-gray-400 font-semibold uppercase">Số câu hỏi</span>
          <p className="text-xl font-bold text-gray-900 mt-1">{test.totalQuestions} câu</p>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-gray-400 font-semibold uppercase">Điểm đạt</span>
          <p className="text-xl font-bold text-green-700 mt-1">{test.passScore}/10.0</p>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-gray-400 font-semibold uppercase">Thời gian</span>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {test.timeLimitMinutes ? `${test.timeLimitMinutes} phút` : 'Tự do'}
          </p>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-gray-400 font-semibold uppercase">Lượt làm bài</span>
          <p className="text-xl font-bold text-gray-900 mt-1">{test.attemptCount} lượt</p>
        </Card>
      </div>

      {/* Enabled Types */}
      <Card className="p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
          Các dạng bài thi đang bật ({test.enabledTypes.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          {test.enabledTypes.map((type) => (
            <span
              key={type}
              className="text-xs font-semibold bg-green-50 text-green-800 border border-green-200 px-3 py-1.5 rounded-xl"
            >
              ✓ {type}
            </span>
          ))}
        </div>
      </Card>

      {/* Preview Section */}
      {questions.length > 0 ? (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">
                Làm thử đề thi mẫu ngẫu nhiên
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Mô phỏng trải nghiệm học sinh dựa trên cấu hình hiện tại.
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={handleGeneratePreview}>
              🔄 Bắt đầu lại
            </Button>
          </div>

          {!evaluation ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                <span>Câu hỏi {currentQuestionIndex + 1} / {questions.length}</span>
                <span className="bg-gray-100 px-2 py-1 rounded text-xs">Loại: {questions[currentQuestionIndex].type}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all" 
                  style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                ></div>
              </div>
              
              <ActivityPreview 
                question={questions[currentQuestionIndex]} 
                onAnswer={handleAnswer} 
              />
            </div>
          ) : (
            <div className="text-center py-8 space-y-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 border-4 border-green-200">
                <span className="text-3xl font-black text-green-700">{evaluation.finalScore.toFixed(1)}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Đã hoàn thành!</h3>
              
              <div className="max-w-2xl mx-auto mt-8 space-y-3">
                {evaluation.results.map((res, i) => (
                  <div key={res.questionId} className={`p-4 border rounded-lg flex items-center justify-between ${res.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="text-left">
                      <p className="font-bold">Câu {i + 1} <span className="text-xs font-normal text-gray-500">({questions[i].type})</span></p>
                      <p className="text-sm">Trúng: <span className="font-semibold text-gray-900">{res.userAnswer || '(Trống)'}</span></p>
                      {!res.isCorrect && !res.technicalFailure && <p className="text-sm text-red-600">Đúng: <span className="font-semibold">{res.correctAnswer}</span></p>}
                      {res.technicalFailure && <p className="text-sm text-gray-500">Bỏ qua do lỗi kỹ thuật</p>}
                    </div>
                    <div>
                      {res.isCorrect ? <span className="text-xl text-green-600">✓</span> : (res.technicalFailure ? <span className="text-xl text-gray-400">-</span> : <span className="text-xl text-red-600">✗</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-8 text-center bg-gray-50/50 border-2 border-dashed border-gray-200">
          <div className="text-3xl mb-3">🎲</div>
          <h3 className="text-sm font-bold text-gray-800 mb-1">Kiểm tra thuật toán sinh đề thi</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
            Bấm "Sinh & Xem trước đề thi" để trải nghiệm thử các câu hỏi được tạo ra theo cấu hình của bạn.
          </p>
          <Button size="sm" onClick={handleGeneratePreview} loading={previewLoading}>
            🎲 Bắt đầu làm thử
          </Button>
        </Card>
      )}
    </div>
  )
}
