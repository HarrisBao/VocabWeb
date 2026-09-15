import React, { useState, useEffect, useRef } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { api } from '../../services/api'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface SearchResult {
  id: number
  fullName: string
  phone: string | null
  membershipStatus?: 'NOT_ENROLLED' | 'ACTIVE' | 'INACTIVE'
}

interface Props {
  classId: number
  onSelect: (studentId: number) => void
  onAddNoAccount: (name: string, phone: string) => void
  isAdding: boolean
}

export function StudentSearchDropdown({ classId, onSelect, onAddNoAccount, isAdding }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')

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
    setShowCreateForm(false)
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
        const data = await api.get<SearchResult[]>(`/teacher/class/${classId}/students/search?q=${encodeURIComponent(val)}`)
        setResults(data)
      } catch (e) {
        console.error("Search failed", e)
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault()
    onAddNoAccount(newName, newPhone)
  }

  return (
    <div className="relative w-full max-w-md" ref={wrapperRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input 
          placeholder="TÃ¬m há»c sinh theo tÃªn hoáº·c SÄT..." 
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => { if (query.trim().length >= 2) setIsOpen(true) }}
          className="pl-9"
        />
      </div>

      {isOpen && !showCreateForm && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 flex items-center justify-center text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Äang tÃ¬m...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    if (r.membershipStatus === 'ACTIVE') return
                    setIsOpen(false)
                    onSelect(r.id)
                  }}
                  className={`w-full text-left px-4 py-2 flex flex-col items-start transition-colors ${r.membershipStatus === 'ACTIVE' ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50'}`}
                  disabled={r.membershipStatus === 'ACTIVE'}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-gray-900">{r.fullName}</span>
                    {r.membershipStatus === 'ACTIVE' && <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded uppercase tracking-wider">Đã có trong lớp</span>}
                    {r.membershipStatus === 'INACTIVE' && <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded uppercase tracking-wider">Đã rời lớp</span>}
                  </div>
                  {r.phone && <span className="text-xs text-gray-500">{r.phone}</span>}
                  {r.membershipStatus === 'INACTIVE' && <span className="text-xs text-brand mt-1 font-semibold">Thêm lại vào lớp</span>}
                  {(!r.membershipStatus || r.membershipStatus === 'NOT_ENROLLED') && <span className="text-xs text-brand mt-1 font-semibold">Thêm vào lớp</span>}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500 mb-3">KhÃ´ng tÃ¬m tháº¥y há»c sinh phÃ¹ há»£p.</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsOpen(false)
                  setShowCreateForm(true)
                  setNewName(query) // prepopulate
                }}
              >
                Táº¡o há»c sinh chÆ°a cÃ³ tÃ i khoáº£n
              </Button>
            </div>
          )}
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={handleCreateNew} className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Táº¡o há»c sinh má»›i</h4>
          <Input 
            placeholder="Há» vÃ  tÃªn *" 
            value={newName} 
            onChange={e => setNewName(e.target.value)} 
            required 
          />
          <Input 
            placeholder="Sá»‘ Ä‘iá»‡n thoáº¡i *" 
            value={newPhone} 
            onChange={e => setNewPhone(e.target.value)} 
            required 
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)}>Há»§y</Button>
            <Button type="submit" loading={isAdding}>ThÃªm vÃ o lá»›p</Button>
          </div>
        </form>
      )}
    </div>
  )
}


