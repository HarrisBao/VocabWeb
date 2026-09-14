import React from 'react'

interface ActivityResultScreenProps {
  result: {
    activityTypeLabel: string
    correctCount: number
    incorrectCount: number
    invalidCount: number
    totalValidQuestions: number
    accuracy: number
    isLastActivity: boolean
  }
  onNext: () => void
}

export const ActivityResultScreen: React.FC<ActivityResultScreenProps> = ({ result, onNext }) => {
  // SVG Half-Donut Math
  const radius = 60
  const strokeWidth = 16
  const normalizedRadius = radius - strokeWidth * 0.5
  const circumference = normalizedRadius * Math.PI // Only half circle
  const greenDash = (result.accuracy / 100) * circumference
  const redDash = circumference - greenDash

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Hoàn thành hoạt động!</h2>
      <p className="text-gray-500 mb-8">{result.activityTypeLabel}</p>

      {/* Semicircle Chart */}
      <div className="relative w-48 h-24 mb-6">
        <svg
          className="w-full h-full"
          viewBox="0 0 120 60"
          style={{ transform: 'rotate(180deg)' }}
        >
          {/* Background Track */}
          <path
            d={`M ${strokeWidth/2} 60 A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${120 - strokeWidth/2} 60`}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Red Track (Incorrect) - Rendered first so it covers the right side */}
          <path
            d={`M ${strokeWidth/2} 60 A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${120 - strokeWidth/2} 60`}
            fill="none"
            stroke="#DC2626"
            strokeWidth={strokeWidth}
            strokeDasharray={`${redDash} ${circumference}`}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Green Track (Correct) */}
          <path
            d={`M ${strokeWidth/2} 60 A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${120 - strokeWidth/2} 60`}
            fill="none"
            stroke="#16A34A"
            strokeWidth={strokeWidth}
            strokeDasharray={`${greenDash} ${circumference}`}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute bottom-0 left-0 right-0 text-center">
          <p className="text-3xl font-bold text-gray-900">{result.correctCount} / {result.totalValidQuestions}</p>
        </div>
      </div>

      <div className="flex gap-6 mb-4">
        <div className="flex flex-col items-center">
          <span className="text-green-600 font-bold mb-1">✓ Đúng</span>
          <span className="text-xl font-semibold">{result.correctCount}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-red-600 font-bold mb-1">✕ Sai</span>
          <span className="text-xl font-semibold">{result.incorrectCount}</span>
        </div>
      </div>

      {result.invalidCount > 0 && (
        <p className="text-sm text-gray-500 mb-6">{result.invalidCount} câu không được tính do lỗi kỹ thuật.</p>
      )}

      <div className="mt-8">
        <button
          onClick={onNext}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-full shadow-md transition-transform active:scale-95"
        >
          {result.isLastActivity ? 'Xem kết quả bài kiểm tra' : 'Qua hoạt động tiếp theo'}
        </button>
      </div>
    </div>
  )
}
