import React, { useState, useEffect } from 'react'
import { StudentQuestionDto, StudentAnswerSubmissionDto } from '../../../services/testSession'
import { Volume2, Mic, MicOff, AlertCircle } from 'lucide-react'
import { useAudioManager } from '../../../hooks/useAudioManager'

interface Props {
  questions: StudentQuestionDto[]
  activityType: string
  onComplete: (answers: StudentAnswerSubmissionDto[]) => void
}

export const PronunciationActivity: React.FC<Props> = ({ questions, activityType, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<StudentAnswerSubmissionDto[]>([])
  
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const question = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const { playWord } = useAudioManager()

  // We use Web Speech API for V1 Pronunciation
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  const recognition = SpeechRecognition ? new SpeechRecognition() : null

  useEffect(() => {
    setTranscript('')
    setError(null)
    setIsRecording(false)
  }, [currentIndex])

  const startRecording = () => {
    if (!recognition) {
      setError('Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng bỏ qua câu này.')
      return
    }

    try {
      recognition.lang = 'en-US'
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsRecording(true)
        setError(null)
      }

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript
        setTranscript(text)
        setIsRecording(false)
      }

      recognition.onerror = (event: any) => {
        setIsRecording(false)
        if (event.error === 'not-allowed') {
          setError('Không thể truy cập microphone. Vui lòng cấp quyền.')
        } else {
          setError(`Lỗi nhận diện: ${event.error}`)
        }
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognition.start()
    } catch (err) {
      setIsRecording(false)
      setError('Lỗi khi khởi động ghi âm.')
    }
  }

  const handleNext = (isTechnicalFailure = false) => {
    const newAnswer: StudentAnswerSubmissionDto = {
      questionId: question.id,
      targetVocabularyItemId: 0,
      answerValue: isTechnicalFailure ? '' : transcript,
      technicalFailure: isTechnicalFailure
    }

    const newAnswers = [...answers, newAnswer]

    if (isLast) {
      onComplete(newAnswers)
    } else {
      setAnswers(newAnswers)
      setCurrentIndex(curr => curr + 1)
    }
  }

  if (!question) return null

  return (
    <div className="max-w-xl mx-auto px-4 py-8 flex flex-col items-center w-full animate-in fade-in">
      <div className="w-full text-center mb-10">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Câu {currentIndex + 1} / {questions.length}
        </p>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-green-500 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="text-center mb-12 w-full flex flex-col items-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          {question.prompt}
          <button 
            onClick={() => playWord(question.prompt)}
            className="p-3 text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 rounded-full transition-colors ml-2"
          >
            <Volume2 className="w-8 h-8" />
          </button>
        </h2>
        
        {question.targetIpa && (
          <p className="text-xl text-gray-500 font-mono mb-8">/{question.targetIpa}/</p>
        )}

        <div className="flex flex-col items-center my-8">
          <button
            onClick={isRecording ? undefined : startRecording}
            className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-white border-4 border-green-500 text-green-600 hover:bg-green-50'
            }`}
          >
            {isRecording ? <Mic className="w-16 h-16" /> : <MicOff className="w-16 h-16" />}
          </button>
          
          <p className="mt-6 text-lg font-medium text-gray-700 h-8">
            {isRecording ? 'Đang nghe...' : (transcript ? `Bạn vừa đọc: "${transcript}"` : 'Nhấn vào mic để đọc')}
          </p>
        </div>

        {error && (
          <div className="flex flex-col items-center gap-4 text-red-500 bg-red-50 p-4 rounded-lg w-full">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <button 
              onClick={() => handleNext(true)}
              className="text-sm underline font-medium hover:text-red-700"
            >
              Bỏ qua câu này (Lỗi kỹ thuật)
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => handleNext(false)}
        disabled={!transcript && !error}
        className={`w-full py-4 rounded-full font-bold text-lg shadow-sm transition-all ${
          transcript
            ? 'bg-green-600 hover:bg-green-700 text-white active:scale-95'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isLast ? 'Hoàn thành hoạt động' : 'Tiếp tục'}
      </button>
    </div>
  )
}
