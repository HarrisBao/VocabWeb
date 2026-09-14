import React, { useState, useEffect } from 'react'
import type { StudentQuestionDto, StudentAnswerSubmissionDto } from '../../../services/testSession'
import { useAudioManager } from '../../../hooks/useAudioManager'

interface Props {
  questions: StudentQuestionDto[]
  activityType: string
  onComplete: (answers: StudentAnswerSubmissionDto[]) => void
}

export const MissingLettersActivity: React.FC<Props> = ({ questions, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<StudentAnswerSubmissionDto[]>([])
  const [inputValue, setInputValue] = useState('')
  
  const question = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const { playWord } = useAudioManager()

  useEffect(() => {
    setInputValue('')
  }, [currentIndex])

  const handleNext = () => {
    if (!inputValue.trim()) return

    const newAnswer: StudentAnswerSubmissionDto = {
      questionId: question.id,
      targetVocabularyItemId: 0,
      answerValue: inputValue.trim(),
      technicalFailure: false
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

  // For missing letters, prompt is like "d_m_stic_te"
  // For typing meaning, prompt is the word
  // For unscramble, prompt is scrambled letters
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

      <div className="text-center mb-12 w-full">
        {question.audioBehavior !== 'HIDDEN' && question.targetWord && (
           <button 
             onClick={() => playWord(question.targetWord!)}
             className="mb-4 text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 p-3 rounded-full transition-colors"
           >
             <span className="text-3xl">🔊</span>
           </button>
        )}
        
        <h2 className="text-4xl font-bold tracking-[0.2em] text-gray-900 mb-6 font-mono bg-gray-50 py-4 rounded-xl border border-gray-100">
          {question.prompt}
        </h2>
        
        <p className="text-gray-500 mb-6 text-sm uppercase">Nhập từ đầy đủ</p>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && inputValue.trim()) handleNext()
          }}
          className="w-full text-center text-2xl py-4 px-6 rounded-xl border-2 border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 outline-none transition-all shadow-sm font-medium"
          placeholder="..."
          autoFocus
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      <button
        onClick={handleNext}
        disabled={!inputValue.trim()}
        className={`w-full py-4 rounded-full font-bold text-lg shadow-sm transition-all ${
          inputValue.trim()
            ? 'bg-green-600 hover:bg-green-700 text-white active:scale-95'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isLast ? 'Hoàn thành hoạt động' : 'Tiếp tục'}
      </button>
    </div>
  )
}
