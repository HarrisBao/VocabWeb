import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

type SourceItem = {
  id: string
  title: string
  type: string
  wordCount: number
}

type WordItem = {
  id: number
  word: string
  meaning: string
}

type Mode = 'word' | 'meaning'
type ActivityType = 'random3' | 'wheel' | 'flip' | 'random1' | 'grid'

export const ClassroomActivityPage: React.FC = () => {
  const { id } = useParams()
  const [sources, setSources] = useState<SourceItem[]>([])
  const [selectedSource, setSelectedSource] = useState<string>('')
  const [words, setWords] = useState<WordItem[]>([])
  
  const [mode, setMode] = useState<Mode>('word')
  const [activityType, setActivityType] = useState<ActivityType>('random3')

  const [availablePool, setAvailablePool] = useState<WordItem[]>([])
  const [usedPool, setUsedPool] = useState<WordItem[]>([])

  // Activity specific states
  const [currentDisplay, setCurrentDisplay] = useState<WordItem[]>([])
  
  // Grid/Flip state
  const [revealedIds, setRevealedIds] = useState<number[]>([])

  useEffect(() => {
    api.get(`/teacher/class/${id}/classroom-activity-sources`).then(res => {
      setSources(res.data)
      if (res.data.length > 0) {
        setSelectedSource(res.data[0].id)
      }
    })
  }, [id])

  useEffect(() => {
    if (!selectedSource) return
    api.get(`/teacher/class/${id}/classroom-activity-words?sourceId=${selectedSource}`).then(res => {
      setWords(res.data)
      resetPool(res.data)
    })
  }, [id, selectedSource])

  const resetPool = (wordList: WordItem[] = words) => {
    const shuffled = [...wordList].sort(() => Math.random() - 0.5)
    setAvailablePool(shuffled)
    setUsedPool([])
    setCurrentDisplay([])
    setRevealedIds([])
  }

  const handleNextRandom3 = () => {
    if (availablePool.length === 0) return
    const toTake = Math.min(3, availablePool.length)
    const newDisplay = availablePool.slice(0, toTake)
    setCurrentDisplay(newDisplay)
    setUsedPool([...usedPool, ...newDisplay])
    setAvailablePool(availablePool.slice(toTake))
  }

  const handleNextRandom1 = () => {
    if (availablePool.length === 0) return
    const newDisplay = [availablePool[0]]
    setCurrentDisplay(newDisplay)
    setUsedPool([...usedPool, newDisplay[0]])
    setAvailablePool(availablePool.slice(1))
  }

  const handleSpinWheel = () => {
    if (availablePool.length === 0) return
    // Simple mock of a wheel spinning and landing on the first available
    const newDisplay = [availablePool[0]]
    setCurrentDisplay(newDisplay)
    setUsedPool([...usedPool, newDisplay[0]])
    setAvailablePool(availablePool.slice(1))
  }

  const handleFlipCard = (wordId: number) => {
    if (!revealedIds.includes(wordId)) {
      setRevealedIds([...revealedIds, wordId])
      const word = words.find(w => w.id === wordId)
      if (word && !usedPool.find(u => u.id === word.id)) {
        setUsedPool([...usedPool, word])
        setAvailablePool(availablePool.filter(a => a.id !== wordId))
      }
    }
  }

  const handleGridReveal = (wordId: number) => {
    if (!revealedIds.includes(wordId)) {
      setRevealedIds([...revealedIds, wordId])
      const word = words.find(w => w.id === wordId)
      if (word && !usedPool.find(u => u.id === word.id)) {
        setUsedPool([...usedPool, word])
        setAvailablePool(availablePool.filter(a => a.id !== wordId))
      }
    }
  }

  const getDisplayText = (w: WordItem) => mode === 'word' ? w.word : w.meaning

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link to={`/teacher/classes/${id}`} className="text-brand hover:underline mb-2 inline-block">
            &larr; Quay lại lớp học
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Hoạt động từ vựng trên lớp</h1>
        </div>
        <Button onClick={() => resetPool()} variant="outline">🔄 Làm mới (Reset)</Button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-6 items-center mb-8">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Nguồn từ vựng</label>
          <select 
            value={selectedSource} 
            onChange={e => setSelectedSource(e.target.value)}
            className="border-gray-200 rounded-lg text-sm"
          >
            {sources.map(s => (
              <option key={s.id} value={s.id}>{s.title} ({s.wordCount} từ)</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Hiển thị</label>
          <select 
            value={mode} 
            onChange={e => setMode(e.target.value as Mode)}
            className="border-gray-200 rounded-lg text-sm"
          >
            <option value="word">Tiếng Anh (Word)</option>
            <option value="meaning">Tiếng Việt (Meaning)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Loại hoạt động</label>
          <select 
            value={activityType} 
            onChange={e => {
              setActivityType(e.target.value as ActivityType)
              resetPool()
            }}
            className="border-gray-200 rounded-lg text-sm"
          >
            <option value="random3">3 từ ngẫu nhiên</option>
            <option value="random1">1 từ ngẫu nhiên</option>
            <option value="wheel">Vòng quay (Wheel)</option>
            <option value="flip">Thẻ lật (Flip Card)</option>
            <option value="grid">Lật ô (Grid Reveal)</option>
          </select>
        </div>

        <div className="ml-auto text-right">
          <div className="text-sm font-bold text-gray-900">Còn lại: {availablePool.length} / {words.length}</div>
          <div className="text-xs text-gray-500">Đã dùng: {usedPool.length}</div>
        </div>
      </div>

      <div className="flex-1 bg-surface-muted rounded-2xl border border-gray-200 p-8 flex flex-col items-center justify-center">
        {words.length === 0 ? (
          <Spinner />
        ) : availablePool.length === 0 && currentDisplay.length === 0 && activityType !== 'flip' && activityType !== 'grid' ? (
          <div className="text-center text-gray-500">
            <p className="text-xl font-bold mb-4">Đã sử dụng hết bộ từ.</p>
            <Button onClick={() => resetPool()}>Bắt đầu lại</Button>
          </div>
        ) : (
          <>
            {activityType === 'random3' && (
              <div className="w-full max-w-4xl text-center">
                <div className="grid grid-cols-3 gap-6 mb-12">
                  {currentDisplay.map(w => (
                    <div key={w.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex items-center justify-center min-h-[200px]">
                      <span className="text-3xl font-bold text-gray-800 text-center">{getDisplayText(w)}</span>
                    </div>
                  ))}
                </div>
                <Button size="lg" onClick={handleNextRandom3} disabled={availablePool.length === 0}>Quay tiếp</Button>
              </div>
            )}

            {activityType === 'random1' && (
              <div className="w-full max-w-xl text-center">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 flex items-center justify-center min-h-[300px] mb-12">
                  {currentDisplay.length > 0 && (
                    <span className="text-5xl font-bold text-gray-800 text-center">{getDisplayText(currentDisplay[0])}</span>
                  )}
                </div>
                <Button size="lg" onClick={handleNextRandom1} disabled={availablePool.length === 0}>Tiếp theo</Button>
              </div>
            )}

            {activityType === 'wheel' && (
              <div className="w-full max-w-xl text-center flex flex-col items-center">
                <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-brand to-brand-light flex items-center justify-center shadow-lg border-4 border-white mb-8 text-white relative">
                   <div className="absolute top-0 w-4 h-4 bg-red-500 rotate-45 -mt-2"></div>
                   {currentDisplay.length > 0 ? (
                     <span className="text-3xl font-bold text-center px-4">{getDisplayText(currentDisplay[0])}</span>
                   ) : (
                     <span className="text-xl font-bold">Vòng quay</span>
                   )}
                </div>
                <Button size="lg" onClick={handleSpinWheel} disabled={availablePool.length === 0}>Quay</Button>
              </div>
            )}

            {activityType === 'flip' && (
              <div className="w-full h-full flex flex-col">
                <div className="flex gap-8 w-full">
                  <div className="flex-1 bg-white p-6 rounded-2xl border border-gray-100">
                    <h3 className="font-bold mb-4 text-gray-700">Chưa mở ({availablePool.length})</h3>
                    <div className="flex flex-wrap gap-3">
                      {availablePool.map(w => (
                        <button 
                          key={w.id} 
                          onClick={() => handleFlipCard(w.id)}
                          className="w-16 h-20 bg-brand text-white font-bold rounded-lg shadow-sm hover:scale-105 transition-transform"
                        >
                          ?
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 bg-white p-6 rounded-2xl border border-gray-100">
                    <h3 className="font-bold mb-4 text-gray-700">Đã mở ({usedPool.length})</h3>
                    <div className="flex flex-wrap gap-3">
                      {usedPool.map(w => (
                        <div key={w.id} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-bold text-gray-800">
                          {getDisplayText(w)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activityType === 'grid' && (
              <div className="w-full max-w-5xl">
                <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                  {words.map((w, idx) => {
                    const isRevealed = revealedIds.includes(w.id)
                    return (
                      <button
                        key={w.id}
                        onClick={() => handleGridReveal(w.id)}
                        disabled={isRevealed}
                        className={`aspect-video rounded-xl flex items-center justify-center p-2 transition-all font-bold text-sm ${
                          isRevealed 
                            ? 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                            : 'bg-brand text-white shadow-md hover:bg-brand-hover hover:scale-105 cursor-pointer'
                        }`}
                      >
                        {isRevealed ? getDisplayText(w) : (idx + 1)}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
