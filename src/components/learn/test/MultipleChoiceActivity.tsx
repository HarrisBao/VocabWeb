import React, { useState, useEffect } from 'react'
import type { StudentQuestionDto, StudentAnswerSubmissionDto } from '../../../services/testSession'
import { useAudioManager } from '../../../hooks/useAudioManager'

interface Props {
  questions: StudentQuestionDto[]
  activityType: string
  onComplete: (answers: StudentAnswerSubmissionDto[]) => void
}

export const MultipleChoiceActivity: React.FC<Props> = ({ questions, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<StudentAnswerSubmissionDto[]>([])
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null)
  
  const question = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const { playWord } = useAudioManager()

  // Auto play audio if activity requires it (e.g., LISTEN_TO_WORD, PRONUNCIATION would use other renderers, but if multiple choice needs it)
  useEffect(() => {
    if (question && question.audioBehavior === 'AUTO_PLAY_TARGET' && question.targetWord) {
      playWord(question.targetWord)
    }
  }, [currentIndex, question, playWord])

  const handleNext = () => {
    if (selectedOptionId === null) return

    const newAnswer: StudentAnswerSubmissionDto = {
      questionId: question.id,
      targetVocabularyItemId: question.options?.find(o => o.vocabularyItemId === selectedOptionId)?.vocabularyItemId || 0, // Fallback, not great. Actually the target item ID isn't directly exposed in Multiple Choice DTO unless selected? Wait. 
      // Ah, the targetVocabularyItemId for submission is the selected item's ID!
      answerValue: selectedOptionId.toString(),
      technicalFailure: false
    }

    const newAnswers = [...answers, newAnswer]

    if (isLast) {
      onComplete(newAnswers)
    } else {
      setAnswers(newAnswers)
      setSelectedOptionId(null)
      setCurrentIndex(curr => curr + 1)
    }
  }

  if (!question) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col items-center w-full animate-in fade-in">
      <div className="w-full text-center mb-8">
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

      <div className="text-center mb-10 w-full">
        {question.audioBehavior !== 'HIDDEN' && question.targetWord && (
          <h2 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            {question.targetWord}
            <button 
              onClick={() => playWord(question.targetWord!)}
              className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-full hover:bg-green-50"
              title="Nghe phát âm"
            >
              <span className="text-2xl">🔊</span>
            </button>
          </h2>
        )}
        
        <p className="text-xl text-gray-700 font-medium">
          {question.prompt}
        </p>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {question.options?.map((opt) => (
          <button
            key={opt.vocabularyItemId}
            onClick={() => setSelectedOptionId(opt.vocabularyItemId)}
            className={`p-6 rounded-xl border-2 text-lg font-medium transition-all text-left ${
              selectedOptionId === opt.vocabularyItemId 
                ? 'border-green-500 bg-green-50 text-green-900 shadow-sm' 
                : 'border-gray-200 bg-white hover:border-green-200 hover:bg-gray-50'
            }`}
          >
            {opt.text}
          </button>
        ))}
      </div>

      <button
        onClick={handleNext}
        disabled={selectedOptionId === null}
        className={`w-full max-w-sm py-4 rounded-full font-bold text-lg shadow-sm transition-all ${
          selectedOptionId !== null
            ? 'bg-green-600 hover:bg-green-700 text-white active:scale-95'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isLast ? 'Hoàn thành hoạt động' : 'Tiếp tục'}
      </button>
    </div>
  )
}
