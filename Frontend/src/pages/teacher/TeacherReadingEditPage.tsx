import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

export const TeacherReadingEditPage: React.FC = () => {
  const { id, readingId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  
  // Editable basic info
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState(60)

  // Answer keys
  const [keys, setKeys] = useState<Record<number, string[]>>({})
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [readingId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/teacher/class/${id}/reading/${readingId}`)
      setData(res)
      setTitle(res.title || '')
      setDuration(res.durationMinutes || 60)

      const newKeys: Record<number, string[]> = {}
      res.questionGroups?.forEach((g: any) => {
        g.questions?.forEach((q: any) => {
          newKeys[q.id] = q.acceptedAnswers?.map((a: any) => a.answer) || []
          if (newKeys[q.id].length === 0) newKeys[q.id] = ['']
        })
      })
      setKeys(newKeys)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    if (data?.passage) {
      const confirmUpload = window.confirm("Upload file mới sẽ thay thế nội dung Passage/Questions hiện tại. Bạn có muốn tiếp tục?")
      if (!confirmUpload) {
        e.target.value = ''
        return
      }
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setIsUploading(true)
      await api.post(`/teacher/class/${id}/reading/${readingId}/upload-docx`, formData)
      
      alert('Upload thành công! Nội dung đã được trích xuất.')
      await fetchData()
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Có lỗi xảy ra khi upload hoặc phân tích file.')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleKeyChange = (questionId: number, index: number, value: string) => {
    const list = [...(keys[questionId] || [])]
    list[index] = value
    setKeys({ ...keys, [questionId]: list })
  }

  const addKeyOption = (questionId: number) => {
    const list = [...(keys[questionId] || []), '']
    setKeys({ ...keys, [questionId]: list })
  }

  const removeKeyOption = (questionId: number, index: number) => {
    const list = [...(keys[questionId] || [])]
    list.splice(index, 1)
    if (list.length === 0) list.push('')
    setKeys({ ...keys, [questionId]: list })
  }

  const handleChangeInteractionType = async (groupId: number, newType: string) => {
    try {
      await api.put(`/teacher/class/${id}/reading/${readingId}/groups/${groupId}/interaction`, { type: newType })
      setData((prev: any) => ({
        ...prev,
        questionGroups: prev.questionGroups.map((g: any) => g.id === groupId ? { ...g, interactionType: newType } : g)
      }))
    } catch (err) {
      alert('Lỗi khi cập nhật loại câu hỏi')
    }
  }

  const handleSaveDraft = async () => {
    try {
      // 1. Save Info
      await api.put(`/teacher/class/${id}/reading/${readingId}/info`, {
        title,
        durationMinutes: duration
      })
      
      // 2. Save Keys
      await api.put(`/teacher/class/${id}/reading/${readingId}/keys`, keys)
      
      alert('Đã lưu bản nháp thành công!')
      fetchData()
    } catch (e) {
      alert('Lỗi khi lưu bản nháp')
    }
  }

  const handlePublish = async () => {
    try {
      // 1. Auto-save info and keys before publishing
      await api.put(`/teacher/class/${id}/reading/${readingId}/info`, {
        title,
        durationMinutes: duration
      })
      await api.put(`/teacher/class/${id}/reading/${readingId}/keys`, keys)
      
      // 2. Publish
      await api.put(`/teacher/class/${id}/reading/${readingId}/publish`)
      
      alert('Đã xuất bản bài tập thành công!')
      navigate(`/teacher/classes/${id}`)
    } catch (e: any) {
      alert(e.message || 'Lỗi khi xuất bản. Vui lòng kiểm tra lại dữ liệu.');
    }
  }

  if (loading) return <div className="p-8 text-center"><Spinner /></div>

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen flex flex-col bg-gray-50">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <Link to={`/teacher/classes/${id}`} className="text-brand hover:underline text-sm mb-1 inline-block font-medium">&larr; Quay lại lớp học</Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Thiết lập bài Reading
            {data?.status === 'PUBLISHED' ? (
              <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Đã xuất bản</span>
            ) : (
              <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Bản nháp</span>
            )}
          </h1>
        </div>
        <div className="space-x-4 flex items-center">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isUploading}>
            💾 Lưu bản nháp
          </Button>
          {data?.status !== 'PUBLISHED' && (
            <Button onClick={handlePublish} disabled={isUploading}>
              🚀 Xuất bản
            </Button>
          )}
        </div>
      </div>

      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-xl mb-6 font-medium flex items-center gap-3 shadow-sm">
          <Spinner /> Đang upload và phân tích file Word...
        </div>
      )}

      {/* Basic Info Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-6 shrink-0 shadow-sm flex flex-wrap gap-6 items-start">
        <div className="flex-1 min-w-[300px]">
          <label className="block text-sm font-bold text-gray-700 mb-2">Tên bài Reading</label>
          <input 
            type="text" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border-gray-300 rounded-xl p-3 focus:ring-brand focus:border-brand transition-shadow"
            placeholder="Ví dụ: IELTS Reading Practice 01"
          />
        </div>
        
        <div className="w-48">
          <label className="block text-sm font-bold text-gray-700 mb-2">Thời gian (phút)</label>
          <input 
            type="number" 
            value={duration}
            onChange={e => setDuration(parseInt(e.target.value) || 0)}
            className="w-full border-gray-300 rounded-xl p-3 focus:ring-brand focus:border-brand transition-shadow"
            min="1"
          />
        </div>

        <div className="w-64 pt-7">
          <label className="bg-brand text-white px-6 py-3 rounded-xl font-bold cursor-pointer hover:bg-brand-hover transition-colors shadow-md flex items-center justify-center gap-2">
            <span>📄 {data?.passage ? 'Đổi file DOCX' : 'Tải lên DOCX'}</span>
            <input type="file" accept=".docx" className="hidden" onChange={handleUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      {/* Document Area */}
      {!data?.passage ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-gray-300 shadow-sm">
          <div className="text-center text-gray-500 max-w-md">
            <span className="text-6xl mb-4 block">📄</span>
            <p className="text-xl font-bold mb-2 text-gray-700">Chưa có nội dung Reading</p>
            <p className="text-sm">Vui lòng tải lên file Word (.docx) chứa nội dung bài đọc và câu hỏi. Hệ thống sẽ tự động phân tích và tạo form nhập đáp án.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
          {/* Passage Area */}
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold shrink-0 text-gray-800 uppercase tracking-wide flex items-center justify-between">
              <span>Nội dung đoạn văn (Passage)</span>
            </div>
            <div className="p-8 overflow-y-auto prose prose-brand max-w-none text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: data.passage }}></div>
          </div>

          {/* Questions Area */}
          <div className="w-full lg:w-[500px] bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-sm shrink-0">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0">
              <span className="font-bold text-gray-800 uppercase tracking-wide">Câu hỏi & Đáp án</span>
            </div>
            <div className="p-6 overflow-y-auto space-y-10 custom-scrollbar">
              {data.questionGroups?.map((g: any) => (
                <div key={g.id} className="space-y-4">
                  <div className="font-bold text-brand-text mb-4 whitespace-pre-wrap bg-brand-light/30 p-4 rounded-xl border border-brand-light text-sm">
                    {g.instruction}
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-semibold uppercase">Cách trả lời:</span>
                      <select 
                        value={g.interactionType} 
                        onChange={(e) => handleChangeInteractionType(g.id, e.target.value)}
                        className="text-xs border-gray-300 rounded p-1 text-brand font-bold bg-white focus:ring-brand focus:border-brand shadow-sm cursor-pointer"
                      >
                        <option value="SHORT_TEXT">Nhập câu trả lời ngắn</option>
                        <option value="INLINE_GAP">Điền vào chỗ trống</option>
                        <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                        <option value="TRUE_FALSE_NOT_GIVEN">TRUE / FALSE / NOT GIVEN</option>
                        <option value="YES_NO_NOT_GIVEN">YES / NO / NOT GIVEN</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {g.questions?.map((q: any) => (
                      <div key={q.id} className="border border-gray-200 p-5 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all">
                        <div className="font-semibold mb-3 flex items-start gap-3">
                          <span className="bg-brand text-white text-xs px-2 py-1 rounded-md shrink-0 mt-0.5">Q. {q.displayNumber}</span>
                          <span className="whitespace-pre-wrap text-sm text-gray-700">{q.content}</span>
                        </div>
                        <div className="space-y-2">
                          {keys[q.id]?.map((ans, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input 
                                type="text"
                                value={ans}
                                onChange={e => handleKeyChange(q.id, idx, e.target.value)}
                                className={`border ${!ans.trim() ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-brand focus:ring-brand'} rounded-lg px-3 py-2 text-sm flex-1 font-mono`}
                                placeholder={idx === 0 ? "Nhập đáp án chính..." : "Nhập đáp án thay thế..."}
                              />
                              <button onClick={() => removeKeyOption(q.id, idx)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 px-3 rounded-lg font-bold transition-colors" title="Xóa đáp án">✕</button>
                            </div>
                          ))}
                          <button onClick={() => addKeyOption(q.id)} className="text-xs text-brand hover:text-brand-hover font-bold flex items-center gap-1 mt-2">
                            <span>+ Thêm đáp án thay thế</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  )
}
