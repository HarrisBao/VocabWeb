import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'


export const TeacherReadingEditPage: React.FC = () => {
  const { id, readingId } = useParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [keys, setKeys] = useState<Record<number, string[]>>({})

  useEffect(() => {
    fetchData()
  }, [readingId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/teacher/class/${id}/reading/${readingId}`)
      setData(res.data)

      const newKeys: Record<number, string[]> = {}
      res.data.questionGroups?.forEach((g: any) => {
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
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const loadingId = 0
      await api.post(`/teacher/class/${id}/reading/${readingId}/upload-docx`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      alert('Upload thÃ nh cÃ´ng!')
      fetchData()
    } catch (e) {
      
      alert('CÃ³ lá»—i xáº£y ra khi upload')
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

  const handleSaveKeys = async () => {
    try {
      await api.put(`/teacher/class/${id}/reading/${readingId}/keys`, keys)
      alert('ÄÃ£ lÆ°u Ä‘Ã¡p Ã¡n!')
    } catch (e) {
      alert('Lá»—i khi lÆ°u Ä‘Ã¡p Ã¡n')
    }
  }

  const handlePublish = async () => {
    try {
      await handleSaveKeys() // save first
      await api.put(`/teacher/class/${id}/reading/${readingId}/publish`)
      alert('ÄÃ£ xuáº¥t báº£n bÃ i táº­p!')
      fetchData()
    } catch (e: any) {
      if (e.response?.data) alert(e.response.data)
      else alert('Lá»—i khi xuáº¥t báº£n')
    }
  }

  if (loading) return <div className="p-8 text-center"><Spinner /></div>

  return (
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <Link to={`/teacher/classes/${id}`} className="text-brand hover:underline text-sm mb-1 inline-block">&larr; Quay láº¡i lá»›p há»c</Link>
          <h1 className="text-2xl font-bold">{data?.title} {data?.status === 'PUBLISHED' && <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full ml-2">ÄÃ£ xuáº¥t báº£n</span>}</h1>
        </div>
        <div className="space-x-3">
          {data?.status !== 'PUBLISHED' && (
            <Button onClick={handlePublish}>Xuáº¥t báº£n (Publish)</Button>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h3 className="font-bold">Ná»™i dung bÃ i Ä‘á»c</h3>
          <p className="text-sm text-gray-500">Upload file DOCX chá»©a bÃ i Ä‘á»c vÃ  cÃ¢u há»i.</p>
        </div>
        <label className="bg-brand text-white px-4 py-2 rounded-lg font-bold cursor-pointer hover:bg-brand-hover">
          Upload DOCX
          <input type="file" accept=".docx" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {!data?.passage ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="text-center text-gray-500">
            <p>ChÆ°a cÃ³ ná»™i dung. HÃ£y upload file Word (DOCX).</p>
            <p className="text-sm mt-2">BÃ i Ä‘á»c vÃ  cÃ¢u há»i sáº½ Ä‘Æ°á»£c trÃ­ch xuáº¥t tá»± Ä‘á»™ng.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Passage Area */}
          <div className="flex-1 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200 font-bold shrink-0">BÃ i Ä‘á»c</div>
            <div className="p-6 overflow-y-auto prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: data.passage }}></div>
          </div>

          {/* Questions Area */}
          <div className="flex-1 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0">
              <span className="font-bold">CÃ¢u há»i & ÄÃ¡p Ã¡n</span>
              <Button size="sm" onClick={handleSaveKeys} variant="outline">LÆ°u Ä‘Ã¡p Ã¡n</Button>
            </div>
            <div className="p-6 overflow-y-auto space-y-8">
              {data.questionGroups?.map((g: any) => (
                <div key={g.id}>
                  <div className="font-bold text-gray-800 mb-4 whitespace-pre-wrap">{g.instruction}</div>
                  <div className="space-y-4">
                    {g.questions?.map((q: any) => (
                      <div key={q.id} className="border border-gray-100 p-4 rounded-lg bg-gray-50">
                        <div className="font-semibold mb-2">
                          <span className="inline-block w-8 text-brand">{q.displayNumber}.</span>
                          <span className="whitespace-pre-wrap text-sm">{q.content}</span>
                        </div>
                        <div className="pl-8 space-y-2">
                          {keys[q.id]?.map((ans, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input 
                                type="text"
                                value={ans}
                                onChange={e => handleKeyChange(q.id, idx, e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm flex-1 font-mono uppercase"
                                placeholder={idx === 0 ? "ÄÃ¡p Ã¡n chÃ­nh..." : "ÄÃ¡p Ã¡n thay tháº¿..."}
                              />
                              <button onClick={() => removeKeyOption(q.id, idx)} className="text-red-500 hover:bg-red-50 px-2 rounded font-bold">Ã—</button>
                            </div>
                          ))}
                          <button onClick={() => addKeyOption(q.id)} className="text-xs text-brand hover:underline font-bold">+ ThÃªm Ä‘Ã¡p Ã¡n thay tháº¿</button>
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
    </div>
  )
}

