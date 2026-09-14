import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7035/api'

export const NoAccountPortalPage: React.FC = () => {
  const { classSlug } = useParams<{ classSlug: string }>()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/auth/student/phone-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classSlug, phone })
      })

      if (res.ok) {
        const data = await res.json()
        // Save the No-Account token securely in localStorage or cookies
        localStorage.setItem('student_access_token', data.accessToken)
        localStorage.setItem('student_profile', JSON.stringify(data.user))
        
        // Push the recent class for the reading hub
        const recentClassesJson = localStorage.getItem('student_recent_classes')
        const recentClasses = recentClassesJson ? JSON.parse(recentClassesJson) : []
        const newClass = { id: data.user.classId, name: 'Lớp ' + classSlug, code: classSlug, joinedAt: new Date().toISOString() }
        
        const filtered = recentClasses.filter((c: any) => c.code !== classSlug)
        filtered.unshift(newClass)
        localStorage.setItem('student_recent_classes', JSON.stringify(filtered.slice(0, 5)))

        navigate(`/class/${classSlug}/portal`)
      } else {
        const errData = await res.json()
        setError(errData.message || 'Không tìm thấy lớp hoặc số điện thoại không hợp lệ.')
      }
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border border-gray-100 shadow-2xl rounded-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👋</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Đăng nhập vào lớp</h1>
          <p className="text-gray-500">Mã lớp: <span className="font-bold text-green-600">{classSlug}</span></p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Số điện thoại</label>
            <Input 
              type="tel"
              placeholder="Nhập số điện thoại của bạn..."
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-medium">{error}</p>}

          <Button type="submit" className="w-full h-12 text-base font-bold" loading={loading}>
            Vào lớp học
          </Button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          Dành cho học sinh chưa có tài khoản email. Giáo viên cần thêm SDT của bạn vào danh sách lớp trước khi đăng nhập.
        </p>
      </Card>
    </div>
  )
}