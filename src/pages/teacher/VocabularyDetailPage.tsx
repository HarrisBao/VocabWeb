import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

interface VocabularyItem {
  id?: number
  word: string
  meaning: string
  ipa?: string
  example?: string
  orderIndex: number
}

interface VocabularySetData {
  id?: number
  title: string
  description?: string
  level: string
  isPublic: boolean
  items: VocabularyItem[]
}

export const VocabularyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<VocabularySetData>({
    title: '',
    description: '',
    level: 'Intermediate',
    isPublic: false,
    items: [
      { word: '', meaning: '', ipa: '', example: '', orderIndex: 0 }
    ]
  })

  const [loading, setLoading] = useState(!isNew)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [generatingIpa, setGeneratingIpa] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!isNew) {
      fetchSetDetails()
    }
  }, [id])

  const fetchSetDetails = async () => {
    setLoading(true)
    try {
      const data = await api.get<VocabularySetData>(`/teacher/vocabulary-sets/${id}`)
      setForm({
        ...data,
        items: data.items.length > 0 ? data.items : [{ word: '', meaning: '', ipa: '', example: '', orderIndex: 0 }]
      })
    } catch (err: any) {
      console.error(err)
      if (err.message && (err.message.includes('404') || err.message.toLowerCase().includes("không tìm thấy") || err.message.toLowerCase().includes("khong tim thay"))) {
        setNotFound(true)
      } else {
        setMessage({ type: 'error', text: err.message || 'Không thể tải chi tiết bộ từ vựng.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    setForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { word: '', meaning: '', ipa: '', example: '', orderIndex: prev.items.length }
      ]
    }))
  }

  const handleRemoveItem = (index: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const handleItemChange = (index: number, field: keyof VocabularyItem, value: string) => {
    setForm(prev => {
      const updated = [...prev.items]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, items: updated }
    })
  }

  const handleGenerateMissingIpa = async () => {
    if (!isNew && id) {
      setGeneratingIpa(true)
      try {
        const res = await api.post<{ totalMissingFound: number; generatedCount: number; unresolvedCount: number; updatedItems: VocabularyItem[] }>(
          `/teacher/vocabulary-sets/${id}/generate-ipa`
        )
        if (res.totalMissingFound === 0) {
          setMessage({
            type: 'success', // Could be info, but system only has success/error right now
            text: 'Không có từ nào còn thiếu phiên âm.'
          })
        } else if (res.generatedCount === 0) {
          setMessage({
            type: 'error',
            text: 'Chưa tạo được phiên âm cho các từ còn thiếu.'
          })
        } else if (res.unresolvedCount === 0) {
          setMessage({
            type: 'success',
            text: `Đã tạo phiên âm cho ${res.generatedCount} từ.`
          })
        } else {
          setMessage({
            type: 'success',
            text: `Đã tạo phiên âm cho ${res.generatedCount}/${res.totalMissingFound} từ.`
          })
        }
        fetchSetDetails()
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Không thể tạo IPA tự động.' })
      } finally {
        setGeneratingIpa(false)
      }
    } else {
      setMessage({
        type: 'error',
        text: 'Vui lòng lưu bộ từ vựng trước khi tạo IPA.'
      })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setMessage(null)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await api.post('/teacher/vocabulary-sets/import', formData)

      if (result.items && result.items.length > 0) {
        // Filter out empty rows from current items
        const currentValid = form.items.filter(i => i.word.trim() && i.meaning.trim())
        const combined = [...currentValid, ...result.items].map((item, idx) => ({
          ...item,
          orderIndex: idx
        }))

        setForm(prev => ({ ...prev, items: combined }))
        setMessage({
          type: 'success',
          text: `Nhập thành công ${result.validCount} từ từ file "${file.name}". Bấm "Lưu bộ từ vựng" để hoàn tất.`
        })
      } else {
        setMessage({
          type: 'error',
          text: result.warnings?.join('; ') || 'Không tìm thấy dữ liệu từ vựng hợp lệ trong file.'
        })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Lỗi khi đọc file.' })
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.title.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập tên bộ từ vựng.' })
      return
    }

    const validItems = form.items.filter(i => i.word.trim() && i.meaning.trim())
    if (validItems.length === 0) {
      setMessage({ type: 'error', text: 'Bộ từ vựng cần có ít nhất 1 từ và nghĩa hợp lệ.' })
      return
    }

    setSaving(true)
    setMessage(null)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description?.trim(),
        level: form.level,
        isPublic: form.isPublic,
        items: validItems.map((item, idx) => ({
          ...item,
          orderIndex: idx
        }))
      }

      if (isNew) {
        const created = await api.post<VocabularySetData>('/teacher/vocabulary-sets', payload)
        setMessage({ type: 'success', text: 'Tạo bộ từ vựng thành công!' })
        navigate(`/teacher/vocabulary/${created.id}`)
      } else {
        await api.put(`/teacher/vocabulary-sets/${id}`, payload)
        setMessage({ type: 'success', text: 'Đã lưu thay đổi bộ từ vựng!' })
        fetchSetDetails()
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Lưu thất bại.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-12 bg-red-50 rounded-2xl border border-red-100">
        <h2 className="text-xl font-bold text-red-600 mb-3">404 Not Found</h2>
        <p className="text-red-800 text-sm mb-6">Bộ từ vựng không tồn tại hoặc bạn không có quyền truy cập.</p>
        <Button onClick={() => navigate('/teacher/vocabulary')}>Quay lại danh sách</Button>
      </div>
    )
  }

  const missingIpaCount = form.items.filter(i => i.word.trim() && !i.ipa?.trim()).length

  return (
    <div className="space-y-6">
      {/* Header & Back */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/teacher/vocabulary">
            <button className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">
              ←
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              {isNew ? 'Soạn Bộ từ vựng mới' : `Chỉnh sửa: ${form.title}`}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isNew ? 'Tạo danh sách từ, phiên âm IPA và ví dụ cho học viên' : 'Quản lý các từ vựng trong bộ này'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.csv"
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            loading={importing}
          >
            📥 Import Excel / CSV
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleGenerateMissingIpa}
            loading={generatingIpa}
            title="Chỉ tạo IPA cho các từ chưa có phiên âm, không ghi đè IPA đã có"
          >
            ✨ Tạo IPA còn thiếu ({missingIpaCount})
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            loading={saving}
            className="font-bold shadow-sm"
          >
            💾 Lưu bộ từ vựng
          </Button>
        </div>
      </div>

      {/* Message alert */}
      {message && (
        <div
          className={[
            'p-4 rounded-xl text-sm flex items-center justify-between border',
            message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          ].join(' ')}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Form Settings Card */}
      <Card className="p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Thông tin cơ bản</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Tên bộ từ vựng *"
              placeholder="VD: Cambridge IELTS 18 - Test 1 Academic Vocabulary"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Trình độ mục tiêu
            </label>
            <select
              value={form.level}
              onChange={e => setForm(prev => ({ ...prev, level: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Beginner">Beginner (Band 4.5 - 5.5)</option>
              <option value="Intermediate">Intermediate (Band 6.0 - 6.5)</option>
              <option value="Advanced">Advanced (Band 7.0+)</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <Input
              label="Mô tả tóm tắt"
              placeholder="Ghi chú về chủ đề từ vựng, mẹo ghi nhớ hoặc nguồn tài liệu..."
              value={form.description || ''}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </div>
      </Card>

      {/* Vocabulary Items Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              Danh sách từ vựng ({form.items.filter(i => i.word.trim()).length} từ)
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Cho phép nhiều từ cùng chung một nghĩa (ví dụ: rapid, quick → nhanh).
            </p>
          </div>

          <Button type="button" variant="secondary" size="sm" onClick={handleAddItem}>
            + Thêm dòng từ mới
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase bg-gray-50/50">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-3 min-w-[160px]">Từ vựng (Word) *</th>
                <th className="py-3 px-3 min-w-[200px]">Nghĩa tiếng Việt (Meaning) *</th>
                <th className="py-3 px-3 min-w-[140px]">Phiên âm (IPA)</th>
                <th className="py-3 px-3 min-w-[200px]">Ví dụ (Example)</th>
                <th className="py-3 px-3 w-16 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {form.items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-2.5 px-3 text-center text-xs text-gray-400 font-mono">
                    {index + 1}
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      placeholder="e.g. rapid"
                      value={item.word}
                      onChange={e => handleItemChange(index, 'word', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 font-semibold text-gray-900"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      placeholder="e.g. nhanh chóng"
                      value={item.meaning}
                      onChange={e => handleItemChange(index, 'meaning', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-800"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      placeholder="e.g. /ˈræp.ɪd/"
                      value={item.ipa || ''}
                      onChange={e => handleItemChange(index, 'ipa', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 font-mono text-xs text-green-800 bg-green-50/30"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      placeholder="e.g. The city experienced rapid growth."
                      value={item.example || ''}
                      onChange={e => handleItemChange(index, 'example', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-600"
                    />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded-md transition-colors"
                      title="Xóa dòng này"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={handleAddItem}>
            + Thêm dòng tiếp theo
          </Button>

          <Button type="button" size="sm" onClick={handleSave} loading={saving} className="font-bold">
            💾 Lưu bộ từ vựng
          </Button>
        </div>
      </Card>
    </div>
  )
}
