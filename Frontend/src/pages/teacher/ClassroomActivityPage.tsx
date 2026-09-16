import React, { useEffect, useState, useRef } from 'react'
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
type ActivityType = 'random3' | 'wheel' | 'flip' | 'grid' | 'random1'

const COLORS = [
  '#FCA5A5', '#FCD34D', '#86EFAC', '#93C5FD', '#C4B5FD', '#F9A8D4', 
  '#FDBA74', '#FDE047', '#A7F3D0', '#BAE6FD', '#DDD6FE', '#FBCFE8'
]

export const ClassroomActivityPage: React.FC = () => {
  const { id } = useParams()
  const [sources, setSources] = useState<SourceItem[]>([])
  const [selectedSource, setSelectedSource] = useState<string>('')
  const [words, setWords] = useState<WordItem[]>([])
  
  const [mode, setMode] = useState<Mode>('word')
  const [activityType, setActivityType] = useState<ActivityType>('random3')

  const [availablePool, setAvailablePool] = useState<WordItem[]>([])
  const [usedPool, setUsedPool] = useState<WordItem[]>([])

  const [isLoadingSources, setIsLoadingSources] = useState(true)
  const [isLoadingWords, setIsLoadingWords] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // -- Activity States --
  
  // Random 3
  const [r3Spinning, setR3Spinning] = useState(false)
  const [r3Results, setR3Results] = useState<(WordItem | null)[] | null>(null)

  // Wheel
  const [wheelRotation, setWheelRotation] = useState(0)
  const [wheelSpinning, setWheelSpinning] = useState(false)
  const [wheelResult, setWheelResult] = useState<WordItem | null>(null)
  const [wheelItems, setWheelItems] = useState<WordItem[]>([]) // Snapshot for current wheel

  // Flip Card
  const [flipRightStack, setFlipRightStack] = useState<WordItem[]>([])
  const [flipAnimating, setFlipAnimating] = useState<WordItem | null>(null)

  // Grid Reveal
  const [gridTiles, setGridTiles] = useState<{ id: string, word: WordItem, revealed: boolean }[] | null>(null)

  // Random 1
  const [r1Result, setR1Result] = useState<WordItem | null>(null)

  useEffect(() => {
    setIsLoadingSources(true)
    api.get<SourceItem[]>(`/teacher/class/${id}/classroom-activity-sources`)
      .then(data => {
        const safeData = Array.isArray(data) ? data : []
        setSources(safeData)
        if (safeData.length > 0) {
          setSelectedSource(safeData[0].id)
        }
      })
      .catch(err => {
        console.error('Failed to load sources:', err)
        setError('Không thể tải danh sách nguồn từ vựng.')
        setSources([])
      })
      .finally(() => {
        setIsLoadingSources(false)
      })
  }, [id])

  useEffect(() => {
    if (!selectedSource) {
      setWords([])
      resetAllStates([])
      return
    }
    
    setIsLoadingWords(true)
    api.get<WordItem[]>(`/teacher/class/${id}/classroom-activity-words?sourceId=${selectedSource}`)
      .then(data => {
        const safeData = Array.isArray(data) ? data : []
        const uniqueWords = Array.from(new Map(safeData.map(w => [w.id, w])).values())
        setWords(uniqueWords)
        resetAllStates(uniqueWords)
      })
      .catch(err => {
        console.error('Failed to load words:', err)
        setError('Không thể tải danh sách từ vựng.')
        setWords([])
        resetAllStates([])
      })
      .finally(() => {
        setIsLoadingWords(false)
      })
  }, [id, selectedSource])

  const resetAllStates = (wordList: WordItem[], forceActivity?: ActivityType) => {
    const shuffled = [...wordList].sort(() => Math.random() - 0.5)
    setAvailablePool(shuffled)
    setUsedPool([])
    
    setR3Spinning(false)
    setR3Results(null)

    setWheelRotation(0)
    setWheelSpinning(false)
    setWheelResult(null)
    setWheelItems(shuffled)

    setFlipRightStack([])
    setFlipAnimating(null)

    const targetActivity = forceActivity || activityType
    if (targetActivity === 'grid') {
      setGridTiles(shuffled.map(w => ({ id: Math.random().toString(), word: w, revealed: false })))
    } else {
      setGridTiles(null)
    }
    
    setR1Result(null)
  }

  const handleReset = () => {
    resetAllStates(words)
  }



  const getDisplayText = (w: WordItem) => mode === 'word' ? w.word : w.meaning

  // --- Handlers for Random 3 ---
  const handleR3Spin = () => {
    if (availablePool.length === 0 || r3Spinning) return
    const toTake = Math.min(3, availablePool.length)
    const drawn = availablePool.slice(0, toTake)
    
    setAvailablePool(availablePool.slice(toTake))
    setUsedPool([...usedPool, ...drawn])
    
    setR3Spinning(true)
    
    setTimeout(() => {
      setR3Spinning(false)
      setR3Results([
        drawn[0] || null,
        drawn[1] || null,
        drawn[2] || null
      ])
    }, 1500)
  }

  // --- Handlers for Wheel ---
  const handleWheelSpin = () => {
    if (wheelItems.length === 0 || wheelSpinning || wheelResult) return
    
    const winnerIndex = Math.floor(Math.random() * wheelItems.length)
    const winner = wheelItems[winnerIndex]

    const segmentAngle = 360 / wheelItems.length
    const targetMod = 360 - ((winnerIndex + 0.5) * segmentAngle)
    const remainder = wheelRotation % 360
    let diff = targetMod - remainder
    if (diff < 0) diff += 360
    
    const spins = 5 * 360
    const newRotation = wheelRotation + spins + diff
    
    setWheelSpinning(true)
    setWheelRotation(newRotation)

    setTimeout(() => {
      setWheelSpinning(false)
      setWheelResult(winner)
    }, 3500)
  }

  const handleWheelNext = () => {
    if (!wheelResult) return
    setAvailablePool(prev => prev.filter(w => w.id !== wheelResult.id))
    setUsedPool(prev => [...prev, wheelResult])
    
    setWheelItems(prev => prev.filter(w => w.id !== wheelResult.id))
    setWheelResult(null)
  }

  // --- Handlers for Flip Card ---
  const handleFlipDraw = () => {
    if (availablePool.length === 0 || flipAnimating) return
    
    const drawn = availablePool[0]
    setAvailablePool(availablePool.slice(1))
    
    setFlipAnimating(drawn)
    
    setTimeout(() => {
      setFlipRightStack(prev => [...prev, drawn])
      setUsedPool(prev => [...prev, drawn])
      setFlipAnimating(null)
    }, 600)
  }

  // --- Handlers for Grid ---
  const handleGridClick = (tileId: string) => {
    if (!gridTiles) return
    const newTiles = [...gridTiles]
    const index = newTiles.findIndex(t => t.id === tileId)
    if (index === -1 || newTiles[index].revealed) return

    newTiles[index].revealed = true
    setGridTiles(newTiles)
    
    const word = newTiles[index].word
    setAvailablePool(prev => prev.filter(w => w.id !== word.id))
    setUsedPool(prev => [...prev, word])
  }

  // --- Handlers for Random 1 ---
  const handleR1Next = () => {
    if (availablePool.length === 0) return
    const drawn = availablePool[0]
    setAvailablePool(availablePool.slice(1))
    setUsedPool([...usedPool, drawn])
    setR1Result(drawn)
  }

  const isAnyActionDisabled = isLoadingSources || isLoadingWords || words.length === 0 || r3Spinning || wheelSpinning || !!flipAnimating

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen flex flex-col bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link to={`/teacher/classes/${id}`} className="text-brand hover:underline mb-2 inline-block font-medium">
            &larr; Quay lại lớp học
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">Hoạt động từ vựng trên lớp</h1>
        </div>
        <Button onClick={handleReset} variant="outline" disabled={isAnyActionDisabled} className="border-gray-300 shadow-sm font-semibold">
          🔄 Làm mới (Reset)
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-8 font-medium">
          {error}
        </div>
      )}

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap gap-6 items-center mb-8">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Nguồn từ vựng</label>
          <select 
            value={selectedSource} 
            onChange={e => setSelectedSource(e.target.value)}
            className="w-full border-gray-200 rounded-xl text-sm font-medium bg-gray-50 focus:bg-white transition-colors"
            disabled={isLoadingSources || sources.length === 0 || r3Spinning || wheelSpinning}
          >
            {sources.length === 0 && <option value="">Không có nguồn</option>}
            {sources.map(s => (
              <option key={s.id} value={s.id}>{s.title} ({s.wordCount} từ)</option>
            ))}
          </select>
        </div>
        
        <div className="w-48">
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Hiển thị</label>
          <select 
            value={mode} 
            onChange={e => setMode(e.target.value as Mode)}
            className="w-full border-gray-200 rounded-xl text-sm font-medium bg-gray-50 focus:bg-white transition-colors"
            disabled={r3Spinning || wheelSpinning}
          >
            <option value="word">Tiếng Anh (Word)</option>
            <option value="meaning">Tiếng Việt (Meaning)</option>
          </select>
        </div>

        <div className="w-48">
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Loại hoạt động</label>
          <select 
            value={activityType} 
            onChange={e => {
              const newType = e.target.value as ActivityType;
              if (newType !== activityType) {
                setActivityType(newType);
                resetAllStates(words, newType);
              }
            }}
            className="w-full border-gray-200 rounded-xl text-sm font-medium bg-gray-50 focus:bg-white transition-colors"
            disabled={r3Spinning || wheelSpinning}
          >
            <option value="random3">3 từ ngẫu nhiên</option>
            <option value="wheel">Vòng quay (Wheel)</option>
            <option value="flip">Thẻ lật (Flip Card)</option>
            <option value="grid">Lật ô (Grid Reveal)</option>
            <option value="random1">1 từ ngẫu nhiên</option>
          </select>
        </div>

        <div className="ml-auto text-right bg-brand-light/30 px-5 py-3 rounded-xl border border-brand-light">
          <div className="text-base font-bold text-brand-text">Còn lại: {availablePool.length} / {words.length}</div>
          <div className="text-sm font-medium text-gray-500">Đã dùng: {usedPool.length}</div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-gray-200 shadow-sm p-8 flex flex-col items-center justify-center relative overflow-hidden">
        {isLoadingSources || isLoadingWords ? (
          <Spinner />
        ) : sources.length === 0 ? (
          <div className="text-center text-gray-500">
            <p className="text-xl font-bold mb-4">Chưa có bộ từ để sử dụng cho hoạt động trên lớp.</p>
          </div>
        ) : words.length === 0 ? (
          <div className="text-center text-gray-500">
            <p className="text-xl font-bold mb-4">Chưa có từ vựng trong bộ này.</p>
          </div>
        ) : availablePool.length === 0 && r3Results === null && !wheelResult && flipRightStack.length === words.length && gridTiles?.every(t => t.revealed) ? (
          <div className="text-center text-gray-500">
            <p className="text-2xl font-bold mb-6 text-gray-800">Đã sử dụng hết bộ từ.</p>
            <Button size="lg" onClick={handleReset}>Bắt đầu lại</Button>
          </div>
        ) : (
          <>
            {/* --- RANDOM 3 --- */}
            {activityType === 'random3' && (
              <div className="w-full max-w-5xl text-center flex flex-col items-center">
                <div className="grid grid-cols-3 gap-8 mb-12 w-full">
                  {[0, 1, 2].map(i => {
                    const resultWord = r3Results ? r3Results[i] : null
                    const isBlank = r3Results && !resultWord
                    return (
                      <div key={i} className="relative h-64 bg-gray-50 rounded-3xl border-2 border-gray-100 shadow-inner overflow-hidden flex items-center justify-center p-4">
                        {r3Spinning ? (
                          <div className="absolute inset-0 flex flex-col animate-[spin-reel_0.25s_linear_infinite]">
                            <div className="h-full flex-shrink-0 flex items-center justify-center text-3xl font-black text-gray-300 blur-[1px]">...</div>
                            <div className="h-full flex-shrink-0 flex items-center justify-center text-3xl font-black text-gray-300 blur-[1px]">...</div>
                            <div className="h-full flex-shrink-0 flex items-center justify-center text-3xl font-black text-gray-300 blur-[1px]">...</div>
                          </div>
                        ) : (
                          <span className={`text-3xl md:text-4xl font-extrabold text-center transition-all duration-500 ${!r3Results ? 'text-gray-300 text-6xl' : isBlank ? 'text-gray-300' : 'text-brand-text scale-110'}`}>
                            {!r3Results ? '?' : isBlank ? '—' : getDisplayText(resultWord!)}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
                {availablePool.length === 0 && r3Results ? (
                  <p className="text-xl font-bold text-gray-500">Đã sử dụng hết bộ từ.</p>
                ) : (
                  <Button size="xl" onClick={handleR3Spin} disabled={r3Spinning || availablePool.length === 0} className="px-12 py-4 text-xl font-bold rounded-2xl shadow-lg">
                    {r3Spinning ? 'Đang quay...' : r3Results ? 'Quay tiếp' : 'Quay 3 từ'}
                  </Button>
                )}
              </div>
            )}

            {/* --- WHEEL --- */}
            {activityType === 'wheel' && (
              <div className="w-full max-w-4xl text-center flex flex-col items-center">
                <div className="relative mb-12 w-[400px] h-[400px]">
                  {/* Fixed Pointer */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-500 z-20 drop-shadow-md"></div>
                  
                  {/* Wheel */}
                  {wheelItems.length > 0 ? (
                    <div 
                      className="w-full h-full rounded-full border-8 border-white shadow-2xl overflow-hidden relative"
                      style={{ 
                        transform: `rotate(${wheelRotation}deg)`, 
                        transitionProperty: 'transform',
                        transitionDuration: wheelSpinning ? '3.5s' : '0s',
                        transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
                        background: wheelItems.length === 1 ? COLORS[0] : `conic-gradient(${wheelItems.map((_, i) => `${COLORS[i % COLORS.length]} ${(i * 360) / wheelItems.length}deg ${((i + 1) * 360) / wheelItems.length}deg`).join(', ')})`
                      }}
                    >
                      {wheelItems.map((w, i) => {
                        const angle = (i + 0.5) * (360 / wheelItems.length);
                        return (
                          <div 
                            key={w.id} 
                            className="absolute top-0 left-1/2 origin-bottom w-10 h-[200px] -ml-5 flex items-start justify-center pt-8"
                            style={{ transform: `rotate(${angle}deg)` }}
                          >
                            <span className="transform -rotate-90 origin-center text-gray-800 font-bold text-sm truncate w-32 text-left" style={{ writingMode: 'vertical-rl' }}>
                              {getDisplayText(w)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full border-8 border-white shadow-2xl bg-gray-100 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-400">Trống</span>
                    </div>
                  )}

                  {/* Center Dot */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-md z-10 flex items-center justify-center">
                    <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                  </div>
                </div>

                {wheelResult ? (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center animate-[pop-in_0.3s_ease-out]">
                      <h2 className="text-5xl md:text-6xl font-extrabold text-brand-text mb-12 leading-tight">
                        {getDisplayText(wheelResult)}
                      </h2>
                      <Button size="xl" onClick={handleWheelNext} className="px-12 py-4 text-xl rounded-2xl shadow-lg w-full md:w-auto">
                        Quay tiếp
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button size="xl" onClick={handleWheelSpin} disabled={wheelSpinning || wheelItems.length === 0} className="px-16 py-4 text-xl font-bold rounded-2xl shadow-lg">
                    {wheelSpinning ? 'Đang quay...' : 'Quay'}
                  </Button>
                )}
              </div>
            )}

            {/* --- FLIP CARD --- */}
            {activityType === 'flip' && (
              <div className="w-full max-w-5xl flex items-center justify-center gap-24 h-[400px]">
                {/* Left Deck */}
                <div className="relative w-64 h-80 flex-shrink-0">
                  {availablePool.length > 0 ? (
                    <button 
                      onClick={handleFlipDraw}
                      disabled={!!flipAnimating}
                      className="absolute inset-0 w-full h-full bg-brand rounded-3xl shadow-[0_8px_0_#0f766e,0_15px_20px_rgba(0,0,0,0.2)] border border-brand-light flex flex-col items-center justify-center text-white cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_0_#0f766e,0_20px_25px_rgba(0,0,0,0.2)] transition-all active:translate-y-2 active:shadow-[0_0px_0_#0f766e] group z-10"
                    >
                      <span className="text-7xl font-black opacity-20 group-hover:opacity-40 transition-opacity">?</span>
                      <span className="absolute bottom-4 font-bold tracking-wide">Còn lại: {availablePool.length}</span>
                    </button>
                  ) : (
                    <div className="w-full h-full rounded-3xl border-4 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 text-gray-400 font-bold text-xl">
                      Đã mở hết thẻ
                    </div>
                  )}
                  {availablePool.length > 1 && <div className="absolute inset-0 w-full h-full bg-brand-hover rounded-3xl -translate-y-2 translate-x-2 -z-10 shadow-sm border border-brand/50"></div>}
                  {availablePool.length > 2 && <div className="absolute inset-0 w-full h-full bg-brand-light rounded-3xl -translate-y-4 translate-x-4 -z-20 border border-brand/30"></div>}
                </div>

                {/* Flying Card Animation */}
                {flipAnimating && (
                  <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 z-50 pointer-events-none perspective-[1000px]">
                    <div className="w-full h-full relative transition-transform duration-500 preserve-3d animate-[flip-fly_0.6s_ease-in-out_forwards]">
                      <div className="absolute inset-0 bg-brand rounded-3xl shadow-xl flex items-center justify-center text-white backface-hidden">
                        <span className="text-7xl font-black opacity-20">?</span>
                      </div>
                      <div className="absolute inset-0 bg-white rounded-3xl shadow-xl flex items-center justify-center p-6 backface-hidden [transform:rotateY(180deg)] border-2 border-brand/20">
                        <span className="text-3xl font-extrabold text-brand-text text-center break-words">{getDisplayText(flipAnimating)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Right Stack */}
                <div className="relative w-64 h-80 flex-shrink-0">
                  {flipRightStack.length > 0 ? (
                    <>
                      {flipRightStack.slice(0, -1).map((w, i) => (
                        <div 
                          key={w.id}
                          className="absolute inset-0 w-full h-full bg-white rounded-3xl border-2 border-gray-100 shadow-sm flex items-center justify-center p-6"
                          style={{ transform: `rotate(${(i * 13) % 7 - 3}deg) translate(${(i * 7) % 5}px, ${(i * 11) % 5}px)` }}
                        >
                          <span className="text-3xl font-extrabold text-gray-300 text-center break-words opacity-50">{getDisplayText(w)}</span>
                        </div>
                      ))}
                      <div className="absolute inset-0 w-full h-full bg-white rounded-3xl border-2 border-brand/20 shadow-xl flex items-center justify-center p-6 z-10 animate-[pop-in_0.2s_ease-out]">
                        <span className="text-3xl font-extrabold text-brand-text text-center break-words">{getDisplayText(flipRightStack[flipRightStack.length - 1])}</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full rounded-3xl border-4 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 text-gray-400 font-bold text-xl text-center p-4">
                      Chưa mở thẻ nào
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- GRID REVEAL --- */}
            {activityType === 'grid' && gridTiles && (
              <div className="w-full max-w-6xl max-h-[600px] overflow-y-auto custom-scrollbar p-4">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {gridTiles.map((tile, idx) => (
                    <button
                      key={tile.id}
                      onClick={() => handleGridClick(tile.id)}
                      disabled={tile.revealed}
                      className={`relative aspect-[4/3] rounded-2xl perspective-[1000px] group ${tile.revealed ? 'cursor-default' : 'cursor-pointer hover:scale-105'} transition-transform`}
                    >
                      <div className={`w-full h-full relative transition-transform duration-500 preserve-3d shadow-sm group-hover:shadow-md rounded-2xl ${tile.revealed ? '[transform:rotateY(180deg)]' : ''}`}>
                        {/* Front (Hidden) */}
                        <div className="absolute inset-0 bg-brand text-white flex items-center justify-center backface-hidden rounded-2xl border border-brand-light">
                          <span className="text-3xl font-black opacity-30">{idx + 1}</span>
                        </div>
                        {/* Back (Revealed) */}
                        <div className="absolute inset-0 bg-white text-brand-text flex items-center justify-center p-4 backface-hidden [transform:rotateY(180deg)] rounded-2xl border-2 border-brand/20">
                          <span className="text-lg md:text-xl font-bold text-center break-words">{getDisplayText(tile.word)}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* --- RANDOM 1 --- */}
            {activityType === 'random1' && (
              <div className="w-full max-w-3xl text-center">
                <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-16 flex items-center justify-center min-h-[400px] mb-12">
                  {r1Result ? (
                    <span className="text-6xl md:text-7xl font-extrabold text-brand-text text-center leading-tight animate-[pop-in_0.3s_ease-out]">
                      {getDisplayText(r1Result)}
                    </span>
                  ) : (
                    <span className="text-7xl font-black text-gray-200">?</span>
                  )}
                </div>
                {availablePool.length === 0 && r1Result ? (
                  <p className="text-xl font-bold text-gray-500">Đã sử dụng hết bộ từ.</p>
                ) : (
                  <Button size="xl" onClick={handleR1Next} disabled={availablePool.length === 0} className="px-16 py-4 text-xl font-bold rounded-2xl shadow-lg">
                    {r1Result ? 'Tiếp theo' : 'Bắt đầu (1 từ)'}
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin-reel {
          0% { transform: translateY(0); }
          100% { transform: translateY(-33.33%); }
        }
        @keyframes pop-in {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes flip-fly {
          0% {
            transform: translate(-250px, 0) scale(1) rotateY(0deg);
          }
          50% {
            transform: translate(0px, -100px) scale(1.2) rotateY(90deg);
          }
          100% {
            transform: translate(250px, 0) scale(1) rotateY(180deg);
          }
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9; 
          border-radius: 4px;
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
