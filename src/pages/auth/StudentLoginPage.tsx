import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import type { LoginFormData, FormErrors } from '../../types/auth'

export const StudentLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!form.email) errs.email = 'Email hoặc tên đăng nhập không được để trống'
    if (!form.password) errs.password = 'Mật khẩu không được để trống'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    // TODO: Connect to ASP.NET Core Web API — POST /api/auth/student/login
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    navigate('/')
  }

  return (
    <AuthLayout
      title="Chào mừng học viên!"
      subtitle="Đăng nhập để tiếp tục hành trình chinh phục IELTS của bạn."
      role="student"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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

        <Input
          label="Mật khẩu"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          error={errors.password}
          required
          autoComplete="current-password"
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
          rightElement={
            <button
              type="button"
              className="text-gray-400 hover:text-green-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          }
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              checked={form.rememberMe}
              onChange={e => setForm(f => ({ ...f, rememberMe: e.target.checked }))}
            />
            <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-green-600 hover:text-green-800 font-medium transition-colors"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>

        <p className="text-center text-sm text-gray-500">
          Chưa có tài khoản?{' '}
          <Link to="/student/register" className="text-green-600 font-semibold hover:text-green-800">
            Đăng ký miễn phí
          </Link>
        </p>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-gray-400">Hoặc</span>
          </div>
        </div>

        <Link to="/teacher/login">
          <Button variant="secondary" fullWidth>
            Giáo viên — Đăng nhập
          </Button>
        </Link>
      </form>
    </AuthLayout>
  )
}
