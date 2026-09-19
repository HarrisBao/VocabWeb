import React, { useEffect, useState, useRef } from 'react'
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

  const passageRef = useRef<HTMLDivElement>(null)

  const changeFontSize = (sizePx: string) => {
    if (!sizePx) return;
    document.execCommand('fontSize', false, '7');
    const fonts = passageRef.current?.querySelectorAll('font[size="7"]');
    fonts?.forEach(f => {
      f.removeAttribute('size');
      f.style.fontSize = `${sizePx}px`;
    });
  };

  useEffect(() => {
    fetchData()
  }, [readingId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/teacher/reading/${readingId}`)
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
      
      // Auto-save Teacher metadata before upload so it isn't lost on refetch
      await api.put(`/teacher/reading/${readingId}/info`, {
        title,
        durationMinutes: duration
      })
      await api.put(`/teacher/reading/${readingId}/keys`, keys)
      await api.post(`/teacher/reading/${readingId}/upload-docx`, formData)
      
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
      await api.put(`/teacher/reading/${readingId}/groups/${groupId}/interaction`, { type: newType })
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
      const infoRes = await api.put(`/teacher/reading/${readingId}/info`, {
        title,
        durationMinutes: duration,
        passageHtml: passageRef.current?.innerHTML
      })
      
      // 2. Save Keys
      const keysRes = await api.put(`/teacher/reading/${readingId}/keys`, keys)
      
      alert('Đã lưu thay đổi thành công!')
      fetchData()
    } catch (e: any) {
      alert(e.message || 'Lỗi khi lưu thay đổi')
    }
  }

  if (loading) return <div className="p-8 text-center"><Spinner /></div>

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen flex flex-col bg-gray-50">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          {id && id !== '0' ? (
            <Link to={`/teacher/classes/${id}`} className="text-brand hover:underline text-sm mb-1 inline-block font-medium">&larr; Quay lại lớp học</Link>
          ) : (
            <Link to={`/teacher/reading`} className="text-brand hover:underline text-sm mb-1 inline-block font-medium">&larr; Quay lại danh sách Reading</Link>
          )}
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Thiết lập bài Reading
            {data?.status === 'READY' ? (
              <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Hoàn chỉnh</span>
            ) : (
              <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Bản nháp</span>
            )}
          </h1>
        </div>
        <div className="space-x-4 flex items-center">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isUploading}>
            💾 Lưu thay đổi
          </Button>
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
        <div className="flex min-h-0 flex-col lg:flex-row gap-6 overflow-hidden h-[calc(100vh-250px)] min-h-[650px]">
          {/* Passage Area */}
            <div className="flex-1 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-sm min-h-0 h-full">
              <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold shrink-0 text-gray-800 uppercase tracking-wide flex items-center justify-between">
                <span>Nội dung đoạn văn (Passage)</span>
              </div>
              <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center gap-2 flex-wrap shrink-0 sticky top-0 z-10">
                <button onClick={() => document.execCommand('bold')} className="p-1 hover:bg-gray-200 rounded font-bold w-8 h-8 flex items-center justify-center transition-colors">B</button>
                <button onClick={() => document.execCommand('italic')} className="p-1 hover:bg-gray-200 rounded italic w-8 h-8 flex items-center justify-center transition-colors">I</button>
                <button onClick={() => document.execCommand('underline')} className="p-1 hover:bg-gray-200 rounded underline w-8 h-8 flex items-center justify-center transition-colors">U</button>
                <div className="h-5 w-px bg-gray-300 mx-2"></div>
                <select onChange={(e) => { changeFontSize(e.target.value); e.target.value = ''; }} className="border border-gray-300 rounded px-2 py-1 text-sm bg-white outline-none focus:border-brand cursor-pointer" defaultValue="">
                   <option value="" disabled>Cỡ chữ</option>
                   {[12, 13, 14, 15, 16, 18, 20, 24].map(s => <option key={s} value={s}>{s}px</option>)}
                </select>
                <div className="h-5 w-px bg-gray-300 mx-2"></div>
                <button onClick={() => document.execCommand('justifyLeft')} className="px-2 py-1 hover:bg-gray-200 rounded text-sm font-semibold transition-colors" title="Căn trái">Left</button>
                <button onClick={() => document.execCommand('justifyCenter')} className="px-2 py-1 hover:bg-gray-200 rounded text-sm font-semibold transition-colors" title="Căn giữa">Center</button>
                <button onClick={() => document.execCommand('justifyRight')} className="px-2 py-1 hover:bg-gray-200 rounded text-sm font-semibold transition-colors" title="Căn phải">Right</button>
                <button onClick={() => document.execCommand('justifyFull')} className="px-2 py-1 hover:bg-gray-200 rounded text-sm font-semibold transition-colors" title="Căn đều">Justify</button>
              </div>
              <div 
                ref={passageRef}
                contentEditable
                suppressContentEditableWarning={true}
                className="p-8 overflow-y-scroll prose prose-brand max-w-none text-base leading-relaxed text-justify outline-none flex-1 custom-scrollbar min-h-0" 
                dangerouslySetInnerHTML={{ __html: data.passage }}
              ></div>
            </div>

          {/* Questions Area */}
          <div className="w-full lg:w-[500px] h-full bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-sm shrink-0 min-h-0">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0">
              <span className="font-bold text-gray-800 uppercase tracking-wide">Cấu hình câu hỏi & Đáp án</span>
            </div>
            <div className="p-6 overflow-y-scroll space-y-10 custom-scrollbar flex-1 min-h-0">
              {data.questionGroups?.map((g: any) => {
                const isSummary = g.academicQuestionType === 'SUMMARY_COMPLETION';
                let parsedRefItems: any[] = [];
                try {
                  if (g.referenceItems) parsedRefItems = JSON.parse(g.referenceItems);
                } catch (e) {}

                return (
                  <div key={g.id} className="space-y-4 border-2 border-gray-100 p-5 rounded-2xl bg-white shadow-sm">
                    {/* Header */}
                    <div className="flex flex-col gap-2 mb-4">
                      <div className="font-bold text-lg text-gray-800">{g.displayLabel || 'Questions'}</div>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        {g.academicQuestionType && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Loại bài: {g.academicQuestionType.replace(/_/g, ' ')}</span>
                        )}
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                          Kiểu: {g.interactionType === 'SHORT_LETTER_RESPONSE' ? 'Nhập chữ cái' : 
                                 g.interactionType === 'INLINE_GAP' ? 'Điền chỗ trống' : 
                                 g.interactionType === 'TRUE_FALSE_NOT_GIVEN' ? 'T/F/NG' : 
                                 g.interactionType === 'YES_NO_NOT_GIVEN' ? 'Y/N/NG' : 'Nhập ngắn'}
                        </span>
                        {g.allowedAnswerDomain && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Miền đáp án: {g.allowedAnswerDomain}</span>
                        )}
                      </div>
                    </div>

                    {/* Instruction */}
                    {g.instruction && (
                      <div className="font-medium text-gray-600 mb-4 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl text-sm italic border-l-4 border-brand">
                        {g.instruction}
                      </div>
                    )}

                    {/* Reference Items (List of People etc.) */}
                    {parsedRefItems.length > 0 && (
                      <div className="mb-4 bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
                        <div className="font-bold text-xs text-yellow-800 uppercase mb-2">Danh sách tham chiếu</div>
                        <ul className="space-y-1">
                          {parsedRefItems.map((item: any, i: number) => (
                            <li key={i} className="text-sm"><span className="font-bold mr-2 text-gray-700">{item.key}</span> {item.label}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Summary Completion template rendering */}
                    {isSummary && g.structuredContent && (
                      <div className="mb-6 p-5 bg-blue-50/30 rounded-xl border border-blue-100 text-sm leading-relaxed whitespace-pre-wrap">
                        {g.structuredContent.split(/(\{\{Q\d+\}\})/).map((part: string, i: number) => {
                          const match = part.match(/\{\{Q(\d+)\}\}/);
                          if (match) {
                            return <span key={i} className="inline-block mx-1 px-2 py-0.5 bg-brand text-white font-bold rounded shadow-sm text-xs">[{match[1]}]</span>;
                          }
                          return <span key={i}>{part}</span>;
                        })}
                      </div>
                    )}

                    {/* Individual Questions */}
                    <div className="space-y-4">
                      {g.questions?.map((q: any) => (
                        <div key={q.id} className="border border-gray-200 p-5 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all">
                          <div className="font-semibold mb-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="bg-brand text-white text-sm px-2.5 py-1 rounded-md shrink-0 font-bold">{q.displayNumber}</span>
                            </div>
                            {!isSummary && q.content && (
                              <span className="whitespace-pre-wrap text-sm text-gray-700">{q.content}</span>
                            )}
                          </div>
                          <div className="space-y-3">
                            <div className="text-xs font-bold text-gray-500 uppercase">Đáp án đúng</div>
                            {keys[q.id]?.map((ans, idx) => (
                              <div key={idx} className="flex gap-2">
                                <input 
                                  type="text"
                                  value={ans}
                                  onChange={e => handleKeyChange(q.id, idx, g.interactionType === 'SHORT_LETTER_RESPONSE' ? e.target.value.toUpperCase() : e.target.value)}
                                  className={`border ${!ans.trim() ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:border-brand focus:ring-brand bg-white'} rounded-lg px-3 py-2 text-sm flex-1 font-mono ${g.interactionType === 'SHORT_LETTER_RESPONSE' ? 'uppercase' : ''} shadow-sm`}
                                  placeholder={idx === 0 ? "Nhập đáp án chính..." : "Nhập đáp án thay thế..."}
                                />
                                {idx > 0 && (
                                  <button onClick={() => removeKeyOption(q.id, idx)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 px-3 rounded-lg font-bold transition-colors" title="Xóa đáp án">✕</button>
                                )}
                              </div>
                            ))}
                            <button onClick={() => addKeyOption(q.id)} className="text-xs text-brand hover:text-brand-hover font-bold flex items-center gap-1 mt-2">
                              <span>+ Thêm đáp án được chấp nhận</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
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
