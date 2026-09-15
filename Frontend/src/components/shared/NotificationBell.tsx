import React, { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
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
      try {
        const url = classSlug 
          ? `/learn/classes/${classSlug}/notifications`
          : `/notification`
        
        const data = await api.get<Notification[]>(url)
        setNotifications(data)
      } catch (err) {
        console.error("Failed to load notifications", err)
      }
    }
    fetchNotifications()
  }, [classSlug])

  const handleMarkRead = async (id: number) => {
    try {
      const url = classSlug
        ? `/learn/notifications/${id}/read`
        : `/notification/${id}/read`
      await api.put(url)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error("Failed to mark read", err)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="relative" ref={wrapperRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">THÃ”NG BÃO</h3>
            {unreadCount > 0 && <span className="text-xs font-medium text-brand">{unreadCount} má»›i</span>}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-brand-light/20' : 'bg-white'}`}
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
              <div className="p-8 text-center text-gray-500 text-sm">
                Báº¡n khÃ´ng cÃ³ thÃ´ng bÃ¡o nÃ o.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

