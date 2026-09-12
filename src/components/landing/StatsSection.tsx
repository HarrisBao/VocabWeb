import React from 'react'

const stats = [
  { value: '5,000+', label: 'Học viên tin dùng', icon: '👨‍🎓' },
  { value: '200+', label: 'Bài học từ vựng', icon: '📚' },
  { value: '10,000+', label: 'Từ vựng IELTS', icon: '🔤' },
  { value: '95%', label: 'Học viên hài lòng', icon: '⭐' },
]

export const StatsSection: React.FC = () => {
  return (
    <section className="py-16 bg-green-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-4xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-green-200 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
