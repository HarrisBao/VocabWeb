import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TestSessionApi } from '../../../services/testSession'
import type { CurrentStageDto, ActivityResultDto, StudentAnswerSubmissionDto, TestFinalResultDto } from '../../../services/testSession'
import { StudentActivityRenderer } from '../../../components/learn/test/StudentActivityRenderer'
import { ActivityResultScreen } from '../../../components/learn/test/ActivityResultScreen'
import { useAssessmentEnvironmentCheck } from '../../../components/assessment/useAssessmentEnvironmentCheck'
import { EnvironmentWarningModal } from '../../../components/assessment/EnvironmentWarningModal'

const TestTimer: React.FC<{ startedAt: string; timeLimitMinutes: number | null }> = ({ startedAt, timeLimitMinutes }) => {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = new Date(startedAt).getTime()
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startedAt])

  if (!timeLimitMinutes) {
    return (
      <div className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
        <span>⏱️</span>
        <span>{Math.floor(elapsed / 60).toString().padStart(2, '0')}:{(elapsed % 60).toString().padStart(2, '0')}</span>
      </div>
    )
  }

  const limitSeconds = timeLimitMinutes * 60
  const isOvertime = elapsed > limitSeconds

  if (isOvertime) {
    const over = elapsed - limitSeconds
    return (
      <div className="text-sm font-bold text-red-600 flex items-center gap-1.5 bg-red-50 px-3 py-1 rounded-full border border-red-200">
        <span>⚠️</span>
        <span>Quá thời gian +{Math.floor(over / 60).toString().padStart(2, '0')}:{(over % 60).toString().padStart(2, '0')}</span>
      </div>
    )
  }

  const remaining = limitSeconds - elapsed
  const isWarning = remaining < 60 // last minute warning

  return (
    <div className={`text-sm font-bold flex items-center gap-1.5 px-3 py-1 rounded-full ${isWarning ? 'text-orange-600 bg-orange-50 border border-orange-200' : 'text-gray-600 bg-gray-50'}`}>
      <span>⏱️</span>
      <span>Còn lại {Math.floor(remaining / 60).toString().padStart(2, '0')}:{(remaining % 60).toString().padStart(2, '0')}</span>
    </div>
  )
}

export const TestSessionPage: React.FC = () => {
  const { publicCode, attemptId } = useParams<{ publicCode: string; attemptId: string }>()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { workspaceRef, detectionResult, startMonitoring, stopMonitoring, runCheck } = useAssessmentEnvironmentCheck('TEST');
  const [stage, setStage] = useState<CurrentStageDto | null>(null)
  const [activityResult, setActivityResult] = useState<ActivityResultDto | null>(null)
  const [finalResult, setFinalResult] = useState<TestFinalResultDto | null>(null)

  const loadCurrentStage = async () => {
    if (!publicCode) return;
    setLoading(true)
    setError(null)
    setActivityResult(null)
    try {
      const data = await TestSessionApi.getCurrentStage(publicCode, Number(attemptId))
      setStage(data)
    } catch (err: any) {
      if (err.message === 'Đã hoàn thành tất cả hoạt động. Vui lòng nộp bài.') {
        submitTest()
      } else {
        setError(err.message || 'Có lỗi xảy ra khi tải bài kiểm tra.')
      }
    } finally {
      setLoading(false)
    }
  }

  const submitTest = async () => {
    if (!publicCode) return;
    setLoading(true)
    try {
      const result = await TestSessionApi.submitTest(publicCode, Number(attemptId))
      setFinalResult(result)
    } catch (err: any) {
      setError(err.message || 'Lỗi nộp bài')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (attemptId) {
      loadCurrentStage()
    }
  }, [attemptId])

  useEffect(() => {
    if (stage && !finalResult && !activityResult) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
  }, [stage, finalResult, activityResult, startMonitoring, stopMonitoring]);

  const handleStageComplete = async (answers: StudentAnswerSubmissionDto[]) => {
    if (!stage || !publicCode) return
    setLoading(true)
    try {
      const result = await TestSessionApi.completeStage(publicCode, Number(attemptId), stage.stageIndex, { answers })
      setActivityResult(result)
    } catch (err: any) {
      setError(err.message || 'Lỗi khi nộp hoạt động')
    } finally {
      setLoading(false)
    }
  }

  const handleNextActivity = () => {
    if (activityResult?.isLastActivity) {
      submitTest()
    } else {
      loadCurrentStage()
    }
  }

  if (loading && !stage && !finalResult) {
    return <div className="flex justify-center items-center h-screen"><p className="text-gray-500">Đang tải bài kiểm tra...</p></div>
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen p-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => navigate(`/test/${publicCode}`)} className="text-green-600 underline">Quay lại trang chủ bài kiểm tra</button>
      </div>
    )
  }

  if (finalResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex flex-col items-center">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 max-w-2xl w-full text-center animate-in fade-in slide-in-from-bottom-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Hoàn thành bài kiểm tra!</h1>
          
          <div className="my-10">
            <p className="text-7xl font-black text-green-600 mb-2">{finalResult.score} <span className="text-3xl text-gray-400">/ 10</span></p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-10">
            <div className="bg-gray-50 rounded-2xl p-6">
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Số câu đúng</p>
              <p className="text-2xl font-bold text-gray-900">{finalResult.correctCount} / {finalResult.totalAttempted}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Thời gian</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.floor(finalResult.durationSeconds / 60)} phút {finalResult.durationSeconds % 60} giây
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/test/${publicCode}`)}
            className="text-gray-500 font-medium hover:text-gray-900 transition-colors"
          >
            Thoát
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-green-700 hidden sm:block">IELTS Thanh Lê Learning</h1>
        
        {stage && (
          <div className="flex items-center gap-3">
            {!activityResult && (
              <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Hoạt động {stage.stageIndex + 1} / {stage.totalStages}
              </div>
            )}
            
            <TestTimer startedAt={stage.startedAt} timeLimitMinutes={stage.timeLimitSnapshotMinutes} />
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main ref={workspaceRef} className="max-w-4xl mx-auto py-6">
        {loading && <div className="text-center py-12 text-gray-400">Đang xử lý...</div>}
        
        {!loading && activityResult && (
          <ActivityResultScreen result={activityResult} onNext={handleNextActivity} />
        )}

        {!loading && !activityResult && stage && (
          <StudentActivityRenderer stage={stage} onComplete={handleStageComplete} />
        )}
      </main>
      
      {detectionResult && (
        <EnvironmentWarningModal
          mode="TEST"
          result={detectionResult}
          onRetry={() => {
            const res = runCheck();
            if (res.status === 'CLEAN') {
              startMonitoring();
            }
          }}
        />
      )}
    </div>
  )
}
