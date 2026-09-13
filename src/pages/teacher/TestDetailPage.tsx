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

interface GeneratedQuestion {
  questionIndex: number
  type: string
  typeLabel: string
  prompt: string
  targetWord?: string
  targetMeaning?: string
  correctAnswer?: string
  options?: string[]
  matchingPairs?: Array<{ word: string; meaning: string }>
  audioText?: string
}

interface TestPreview {
  testId: number
  title: string
  totalGeneratedQuestions: number
  questions: GeneratedQuestion[]
}

export const TestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [test, setTest] = useState<TestDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState<TestPreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

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
    try {
      const data = await api.get<TestPreview>(`/teacher/test/${id}/preview`)
      setPreview(data)
    } catch (err: any) {
      alert(err.message || 'Không thể sinh câu hỏi thử nghiệm.')
    } finally {
      setPreviewLoading(false)
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
      {preview ? (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">
                Đề thi mẫu ngẫu nhiên ({preview.totalGeneratedQuestions} câu hỏi)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Được sinh tự động bởi Random Engine với luật bảo vệ trùng lặp nghĩa (Duplicate Meaning Rules).
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={handleGeneratePreview}>
              🔄 Xáo trộn sinh đề khác
            </Button>
          </div>

          <div className="space-y-4">
            {preview.questions.map((q) => (
              <div
                key={q.questionIndex}
                className="p-4 rounded-xl border border-gray-200 bg-white space-y-2 hover:border-green-300 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                    Câu {q.questionIndex}: {q.typeLabel}
                  </span>
                  {q.audioText && (
                    <span className="text-gray-400 font-mono">🔊 Audio: "{q.audioText}"</span>
                  )}
                </div>

                <p className="text-sm font-bold text-gray-900 pt-1">{q.prompt}</p>

                {/* Multiple choice options */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = opt === q.correctAnswer
                      return (
                        <div
                          key={oIdx}
                          className={[
                            'p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between',
                            isCorrect
                              ? 'border-green-500 bg-green-50 text-green-900 font-bold'
                              : 'border-gray-200 bg-gray-50 text-gray-700'
                          ].join(' ')}
                        >
                          <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                          {isCorrect && <span className="text-green-600 font-bold">✓ Đáp án</span>}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Matching pairs preview */}
                {q.matchingPairs && q.matchingPairs.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mt-2">
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Các cặp ghép hợp lệ:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {q.matchingPairs.map((p, pIdx) => (
                        <div key={pIdx} className="p-2 bg-white rounded border border-gray-200 text-xs text-center">
                          <p className="font-bold text-gray-900">{p.word}</p>
                          <p className="text-gray-500 text-[11px] mt-0.5">{p.meaning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Typing or pronunciation correct answer indicator */}
                {(!q.options || q.options.length === 0) && !q.matchingPairs && (
                  <div className="pt-2 text-xs text-gray-500 flex items-center gap-2">
                    <span className="font-semibold">Đáp án mong đợi:</span>
                    <span className="font-mono font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                      {q.correctAnswer}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center bg-gray-50/50 border-2 border-dashed border-gray-200">
          <div className="text-3xl mb-3">🎲</div>
          <h3 className="text-sm font-bold text-gray-800 mb-1">Kiểm tra thuật toán sinh đề thi</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
            Bấm "Sinh & Xem trước đề thi" để kiểm tra chất lượng câu hỏi, các phương án nhiễu deduplicated và bộ ghép thẻ từ vựng.
          </p>
          <Button size="sm" onClick={handleGeneratePreview} loading={previewLoading}>
            🎲 Sinh & Xem trước đề thi mẫu
          </Button>
        </Card>
      )}
    </div>
  )
}
