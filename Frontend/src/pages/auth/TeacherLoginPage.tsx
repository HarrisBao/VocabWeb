import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import type { LoginFormData, FormErrors } from '../../types/auth'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (parent: HTMLElement, options: any) => void
          prompt: (notification?: any) => void
        }
      }
    }
  }
}

export const TeacherLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, loginWithGoogle } = useAuth()
  const googleBtnRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleConfigMissing, setGoogleConfigMissing] = useState(false)

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    // Check if Google Client ID is valid
    if (!googleClientId || googleClientId === 'your_google_client_id_here') {
      setGoogleConfigMissing(true)
      return
    }

    setGoogleConfigMissing(false)

    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (window.google?.accounts?.id) {
        initializeGoogle()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initializeGoogle
      document.body.appendChild(script)
    }

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) return

      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: 380,
            locale: 'vi'
          })
        }
      } catch (err) {
        console.error('Google initialization error:', err)
      }
    }

    loadGoogleScript()
  }, [googleClientId])

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) {
      setErrorMessage('Không nhận được thông tin xác thực từ Google.')
      return
    }

    setGoogleLoading(true)
    setErrorMessage(null)
    try {
      const user = await loginWithGoogle(response.credential)
      if (user.role === 'TA') {
        navigate('/ta/dashboard')
      } else {
        navigate('/teacher/dashboard')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng nhập bằng Google thất bại. Vui lòng thử lại.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleClickManual = () => {
    if (googleConfigMissing) {
      setErrorMessage('GOOGLE AUTH: Hệ thống đang chờ cấu hình VITE_GOOGLE_CLIENT_ID từ Google Cloud Console.')
      return
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt()
    } else {
      setErrorMessage('Thư viện Google Sign-In đang tải, vui lòng thử lại sau vài giây.')
    }
  }

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!form.email) errs.email = 'Email không được để trống'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Email không hợp lệ'
    if (!form.password) errs.password = 'Mật khẩu không được để trống'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setErrorMessage(null)
    try {
      const user = await login(form.email, form.password)
      if (user.role === 'TA') {
        navigate('/ta/dashboard')
      } else {
        navigate('/teacher/dashboard')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Đăng nhập dành cho giáo viên"
      subtitle="Quản lý lớp học, soạn bộ từ vựng và tạo bài kiểm tra IELTS chuyên nghiệp."
      role="teacher"
    >
      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      {/* Google Sign-In Button Container */}
      <div className="space-y-3">
        {googleConfigMissing ? (
          <button
            type="button"
            onClick={handleGoogleClickManual}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Tiếp tục với Google</span>
          </button>
        ) : (
          <div className="w-full flex justify-center">
            <div ref={googleBtnRef} className="w-full" />
          </div>
        )}

        {googleLoading && (
          <p className="text-center text-xs text-green-700 animate-pulse font-medium">
            Đang xác thực tài khoản Google...
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-4 text-gray-400 font-medium">hoặc</span>
        </div>
      </div>

      {/* Email + Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          placeholder="giaovien@example.com"
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
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          }
        />

        {/* Remember me + Forgot password */}
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

        <p className="text-center text-sm text-gray-500 pt-2">
          Chưa có tài khoản?{' '}
          <Link to="/teacher/register" className="text-green-600 font-semibold hover:text-green-800 underline-offset-2 hover:underline">
            Đăng ký tài khoản giáo viên
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
