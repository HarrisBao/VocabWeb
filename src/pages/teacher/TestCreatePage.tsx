import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const CANONICAL_TEST_TYPES = [
  { id: 'WORD_TO_MEANING', label: '1. Từ → Chọn nghĩa', desc: 'Hiển thị từ tiếng Anh, chọn nghĩa tiếng Việt chính xác' },
  { id: 'MEANING_TO_WORD', label: '2. Nghĩa → Chọn từ', desc: 'Hiển thị nghĩa tiếng Việt, chọn từ tiếng Anh tương ứng' },
  { id: 'LISTEN_TO_WORD', label: '3. Nghe → Chọn từ', desc: 'Phát âm thanh từ vựng, chọn từ tiếng Anh đúng' },
  { id: 'LISTEN_TO_MEANING', label: '4. Nghe → Chọn nghĩa', desc: 'Phát âm thanh từ vựng, chọn nghĩa tiếng Việt đúng' },
  { id: 'MEANING_TO_TYPE_WORD', label: '5. Nghĩa → Điền từ', desc: 'Cho nghĩa tiếng Việt, học sinh gõ lại từ tiếng Anh' },
  { id: 'LISTEN_TO_TYPE_WORD', label: '6. Nghe → Điền từ', desc: 'Nghe phát âm chuẩn, gõ lại từ vựng chính xác' },
  { id: 'WORD_TO_TYPE_MEANING', label: '7. Từ → Điền nghĩa', desc: 'Cho từ tiếng Anh, học sinh gõ lại nghĩa tiếng Việt' },
  { id: 'MISSING_LETTERS', label: '8. Điền chữ còn thiếu', desc: 'Ẩn 1-2 ký tự trong từ, học sinh hoàn thiện từ' },
  { id: 'UNSCRAMBLE_WORD', label: '9. Sắp xếp chữ thành từ', desc: 'Xáo trộn thứ tự các chữ cái, sắp xếp thành từ đúng' },
  { id: 'MATCH_WORD_MEANING', label: '10. Ghép Từ ↔ Nghĩa', desc: 'Ghép cặp thẻ từ vựng với nghĩa tương ứng trong cùng batch' },
  { id: 'PRONUNCIATION', label: '11. Phát âm (Microphone)', desc: 'Học sinh đọc từ vựng vào micro để chấm điểm nhận diện giọng nói' },
]

interface SelectOption {
  id: number
  title?: string
  name?: string
  wordCount?: number
}

export const TestCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedSetId = searchParams.get('setId')
  const preselectedClassId = searchParams.get('classId')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [vocabularySetId, setVocabularySetId] = useState<number | ''>(
    preselectedSetId ? Number(preselectedSetId) : ''
  )
  const [classId, setClassId] = useState<number | ''>(
    preselectedClassId ? Number(preselectedClassId) : ''
  )
  const [passScore, setPassScore] = useState(5.0)
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | ''>(15)

  // Enabled types: by default enable first 3 popular types
  const [enabledTypes, setEnabledTypes] = useState<string[]>([
    'WORD_TO_MEANING',
    'MEANING_TO_WORD',
    'LISTEN_TO_WORD',
    'MATCH_WORD_MEANING'
  ])

  const [sets, setSets] = useState<SelectOption[]>([])
  const [classes, setClasses] = useState<SelectOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadOptions()
  }, [])

  const loadOptions = async () => {
    setLoadingOptions(true)
    try {
      const [setsData, classesData] = await Promise.all([
        api.get<SelectOption[]>('/teacher/vocabulary'),
        api.get<SelectOption[]>('/teacher/class')
      ])
      setSets(setsData)
      setClasses(classesData)

      if (!vocabularySetId && setsData.length > 0) {
        setVocabularySetId(setsData[0].id)
        setTitle(`Bài kiểm tra: ${setsData[0].title}`)
      } else if (vocabularySetId) {
        const found = setsData.find(s => s.id === Number(vocabularySetId))
        if (found) setTitle(`Bài kiểm tra: ${found.title}`)
      }
    } catch {
      setError('Không thể tải danh sách bộ từ vựng hoặc lớp học.')
    } finally {
      setLoadingOptions(false)
    }
  }

  const toggleTestType = (typeId: string) => {
    setEnabledTypes(prev => {
      if (prev.includes(typeId)) {
        if (prev.length === 1) {
          alert('Cần chọn ít nhất 1 loại câu hỏi cho bài kiểm tra.')
          return prev
        }
        return prev.filter(t => t !== typeId)
      } else {
        return [...prev, typeId]
      }
    })
  }

  const handleSelectAll = () => {
    setEnabledTypes(CANONICAL_TEST_TYPES.map(t => t.id))
  }

  const handleDeselectAll = () => {
    setEnabledTypes(['WORD_TO_MEANING'])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề bài kiểm tra.')
      return
    }

    if (!vocabularySetId) {
      setError('Vui lòng chọn bộ từ vựng nguồn.')
      return
    }

    if (enabledTypes.length === 0) {
      setError('Vui lòng bật ít nhất 1 loại câu hỏi.')
      return
    }

    setCreating(true)
    setError(null)
    try {
      const res = await api.post<{ id: number }>('/teacher/test', {
        title: title.trim(),
        description: description.trim() || undefined,
        vocabularySetId: Number(vocabularySetId),
        classId: classId ? Number(classId) : undefined,
        enabledTypes,
        passScore,
        timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : undefined
      })

      navigate(`/teacher/tests/${res.id}`)
    } catch (err: any) {
      setError(err.message || 'Tạo bài kiểm tra thất bại.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/teacher/tests">
          <button className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">
            ←
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Tạo Bài kiểm tra mới</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Chọn bộ từ vựng và kích hoạt các dạng bài thi. Thuật toán Random Engine sẽ tự động phân phối câu hỏi.
          </p>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: General Info */}
        <Card className="p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">1. Thông tin chung & Nguồn đề</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Tiêu đề bài kiểm tra *"
                placeholder="VD: Kiểm tra từ vựng Oxford 3000 - Unit 1"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Bộ từ vựng nguồn *
              </label>
              <select
                value={vocabularySetId}
                onChange={e => {
                  setVocabularySetId(Number(e.target.value))
                  const s = sets.find(item => item.id === Number(e.target.value))
                  if (s) setTitle(`Bài kiểm tra: ${s.title}`)
                }}
                disabled={loadingOptions || !!preselectedSetId}
                className={`w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${!!preselectedSetId ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
                required
              >
                <option value="">-- Chọn bộ từ vựng --</option>
                {sets.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.wordCount ?? 0} từ)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Gán trực tiếp vào lớp (tùy chọn)
              </label>
              <select
                value={classId}
                onChange={e => setClassId(e.target.value ? Number(e.target.value) : '')}
                disabled={loadingOptions || !!preselectedClassId}
                className={`w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${!!preselectedClassId ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`}
              >
                <option value="">-- Không gán (Đề tự do) --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <Input
                label="Ghi chú / Hướng dẫn làm bài"
                placeholder="VD: Hoàn thành bài kiểm tra trong thời gian quy định, đạt từ 6.0 điểm để vượt qua."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Step 2: Test Parameters */}
        <Card className="p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">2. Thông số bài thi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Số lượng câu hỏi
              </label>
              <div className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl bg-gray-50 text-gray-500">
                Tự động phân bổ theo bài học
              </div>
            </div>

            <div>
              <Input
                label="Thời gian (phút, để trống = không giới hạn)"
                type="number"
                min={1}
                max={120}
                value={timeLimitMinutes}
                onChange={e => setTimeLimitMinutes(e.target.value ? Number(e.target.value) : '')}
              />
            </div>

            <div>
              <Input
                label="Điểm đạt (thang điểm 0 - 10.0)"
                type="number"
                step="0.5"
                min={0}
                max={10}
                value={passScore}
                onChange={e => setPassScore(Number(e.target.value))}
                required
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Công thức chấm điểm: Điểm = (Số câu đúng / Tổng câu hợp lệ) × 10. Tất cả câu hỏi đều có trọng số đồng đều.
          </p>
        </Card>

        {/* Step 3: Canonical Test Types Selection */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                3. Các dạng câu hỏi được kích hoạt ({enabledTypes.length}/11)
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Hệ thống Random Engine sẽ tự động xáo trộn và phân phối giữa các dạng được chọn.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-bold text-green-700 hover:text-green-800 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200"
              >
                Chọn tất cả
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg"
              >
                Mặc định
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CANONICAL_TEST_TYPES.map((type) => {
              const isChecked = enabledTypes.includes(type.id)
              return (
                <div
                  key={type.id}
                  onClick={() => toggleTestType(type.id)}
                  className={[
                    'p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none',
                    isChecked
                      ? 'border-green-500 bg-green-50/60 shadow-2xs'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  ].join(' ')}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-4 h-4 mt-1 rounded text-green-600 focus:ring-green-500"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900">{type.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{type.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/teacher/tests">
            <Button type="button" variant="ghost" size="md">
              Hủy
            </Button>
          </Link>
          <Button type="submit" size="md" loading={creating} className="font-bold shadow-sm">
            ✓ Hoàn tất tạo bài kiểm tra
          </Button>
        </div>
      </form>
    </div>
  )
}
