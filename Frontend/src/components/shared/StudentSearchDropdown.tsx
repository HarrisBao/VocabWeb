import React, { useState, useEffect, useRef } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { api } from '../../services/api'
import { Input } from '../ui/Input'

interface SearchResult {
  id: number
  fullName: string
  phone: string | null
  hasAccount: boolean
  membershipStatus?: 'NOT_ENROLLED' | 'ACTIVE' | 'INACTIVE'
}

interface Props {
  classId: number
  onSelect: (studentId: number) => void
  isAdding: boolean
}

export function StudentSearchDropdown({ classId, onSelect, isAdding }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (val: string) => {
    setQuery(val)
    if (val.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsOpen(true)
    setLoading(true)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(async () => {
      try {
        const data = await api.get<SearchResult[]>(`/teacher/class/${classId}/students/search?q=` + encodeURIComponent(val))
        // Filter out those without account for this flow!
        setResults(data.filter((r: SearchResult) => r.hasAccount))
      } catch (e) {
        console.error("Search failed", e)
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  return (
    <div className="relative w-full max-w-md" ref={wrapperRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input 
          placeholder="Tìm học sinh theo tên hoặc SĐT..." 
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => { if (query.trim().length >= 2) setIsOpen(true) }}
          className="pl-9"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 flex items-center justify-center text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tìm...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    if (r.membershipStatus === 'ACTIVE') return
                    onSelect(r.id)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0 ${r.membershipStatus === 'ACTIVE' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{r.fullName}</p>
                      {r.hasAccount && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-wider">Đã có tài khoản</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{r.phone || 'Chưa có SĐT'}</p>
                  </div>
                  {r.membershipStatus === 'ACTIVE' ? (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Đã trong lớp</span>
                  ) : r.membershipStatus === 'INACTIVE' ? (
                    <span className="text-xs font-bold text-brand bg-brand-light/30 px-2 py-1 rounded">Thêm lại</span>
                  ) : (
                    <span className="text-xs font-bold text-brand bg-brand-light/30 px-2 py-1 rounded">Thêm</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500 mb-3">Không tìm thấy học sinh có tài khoản.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
