import React, { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'

interface Notification {
  id: number
  type: string
  message: string
  isRead: boolean
  createdAt: string
}

interface Props {
  classSlug?: string
}

export function NotificationBell({ classSlug }: Props) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
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

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true)
      setIsError(false)
      try {
        const url = classSlug 
          ? `/learn/classes/${classSlug}/notifications`
          : `/notification`
        
        const data = await api.get<Notification[]>(url)
        setNotifications(data)
      } catch (err) {
        console.error("Failed to load notifications", err)
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }
    fetchNotifications()
  }, [classSlug])

  const handleMarkRead = async (id: number) => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      const url = classSlug
        ? `/learn/notifications/${id}/read`
        : `/notification/${id}/read`
      await api.put(url)
    } catch (err) {
      console.error("Failed to mark read", err)
      // Revert on failure
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n))
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length
  const displayCount = unreadCount > 99 ? '99+' : unreadCount.toString()

  return (
    <div className="relative" ref={wrapperRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full border-2 border-white">
            {displayCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Thông báo</h3>
            {unreadCount > 0 && <span className="text-xs font-medium text-brand">{unreadCount} mới</span>}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 flex flex-col items-center justify-center text-gray-400">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-brand rounded-full animate-spin mb-2"></div>
                <p className="text-sm">Đang tải...</p>
              </div>
            ) : isError ? (
              <div className="p-8 text-center text-red-500 text-sm">
                Không thể tải thông báo. Vui lòng thử lại sau.
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-4 transition-colors cursor-pointer ${!n.isRead ? 'bg-brand-light/20 hover:bg-brand-light/30' : 'bg-white hover:bg-gray-50'}`}
                    onClick={() => {
                      if (!n.isRead) handleMarkRead(n.id)
                    }}
                  >
                    <p className={`text-sm ${!n.isRead ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center text-gray-400 text-sm">
                <Bell className="w-8 h-8 text-gray-200 mb-2" />
                Bạn chưa có thông báo.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
