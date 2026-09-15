import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { api } from '../../services/api'
import type { StudentRegisterFormData, FormErrors } from '../../types/auth'

export const StudentRegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState<StudentRegisterFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!form.fullName.trim()) errs.fullName = 'Họ và tên không được để trống'
    if (!form.email) errs.email = 'Email không được để trống'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email không hợp lệ'
    if (!form.password) errs.password = 'Mật khẩu không được để trống'
    else if (form.password.length < 8) errs.password = 'Mật khẩu phải có ít nhất 8 ký tự'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Mật khẩu không khớp'
    if (!agreedToTerms) errs.terms = 'Bạn cần đồng ý với điều khoản sử dụng'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setErrorMessage(null)
    
    try {
      await api.post('/auth/student/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password
      }, { requiresAuth: false })
      
      // Auto login or redirect to login
      navigate('/student/login')
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    const p = form.password
    if (!p) return null
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    const levels = [
      { label: 'Yếu', color: 'bg-red-500', width: '25%' },
      { label: 'Trung bình', color: 'bg-yellow-500', width: '50%' },
      { label: 'Mạnh', color: 'bg-blue-500', width: '75%' },
      { label: 'Rất mạnh', color: 'bg-green-500', width: '100%' },
    ]
    return levels[Math.min(score - 1, 3)] || levels[0]
  }

  const strength = passwordStrength()

  return (
    <AuthLayout
      title="Đăng ký học viên"
      subtitle="Tạo tài khoản miễn phí và bắt đầu chinh phục từ vựng IELTS ngay hôm nay!"
      role="student"
    >
      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Họ và tên"
          type="text"
          placeholder="Nguyễn Thị Bích"
          value={form.fullName}
          onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
          error={errors.fullName}
          required
          autoComplete="name"
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />

        <Input
          label="Email"
          type="email"
          placeholder="hocvien@example.com"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          error={errors.email}
          required
          autoComplete="email"
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />

        <div>
          <Input
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            placeholder="Ít nhất 8 ký tự"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            error={errors.password}
            required
            autoComplete="new-password"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            rightElement={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-green-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            }
          />
          {strength && (
            <div className="mt-2">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${strength.color} rounded-full transition-all duration-300`} style={{ width: strength.width }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">Độ mạnh: {strength.label}</p>
            </div>
          )}
        </div>

        <Input
          label="Xác nhận mật khẩu"
          type="password"
          placeholder="Nhập lại mật khẩu"
          value={form.confirmPassword}
          onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />

        <div>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500 shrink-0"
              checked={agreedToTerms}
              onChange={e => setAgreedToTerms(e.target.checked)}
            />
            <span className="text-sm text-gray-600">
              Tôi đồng ý với{' '}
              <a href="#" className="text-green-600 hover:text-green-800 font-medium">Điều khoản sử dụng</a>
              {' '}và{' '}
              <a href="#" className="text-green-600 hover:text-green-800 font-medium">Chính sách bảo mật</a>
            </span>
          </label>
          {errors.terms && <p className="text-sm text-red-600 mt-1">{errors.terms}</p>}
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading}>
          {loading ? 'Đang tạo tài khoản...' : 'Đăng ký miễn phí'}
        </Button>

        <p className="text-center text-sm text-gray-500">
          Đã có tài khoản?{' '}
          <Link to="/student/login" className="text-green-600 font-semibold hover:text-green-800">
            Đăng nhập
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
