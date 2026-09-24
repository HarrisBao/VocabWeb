import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import type { ForgotPasswordFormData, FormErrors } from '../../types/auth'

type Step = 'email' | 'success'

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<Step>('email')
  const [form, setForm] = useState<ForgotPasswordFormData>({ email: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!form.email) errs.email = 'Email không được để trống'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Email không hợp lệ'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    // TODO: Connect to ASP.NET Core Web API — POST /api/auth/forgot-password
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setStep('success')
  }

  return (
    <AuthLayout
      title={step === 'email' ? 'Quên mật khẩu?' : 'Kiểm tra email!'}
      subtitle={
        step === 'email'
          ? 'Nhập email đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn.'
          : undefined
      }
      role="student"
    >
      {step === 'email' ? (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            label="Email đã đăng ký"
            type="email"
            placeholder="email@example.com"
            value={form.email}
            onChange={e => setForm({ email: e.target.value })}
            error={errors.email}
            required
            autoComplete="email"
            autoFocus
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />

          <Button type="submit" fullWidth size="lg" loading={loading}>
            {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
          </Button>

          <div className="flex flex-col gap-2 text-center text-sm">
            <p className="text-gray-500">
              Nhớ mật khẩu rồi?{' '}
              <Link to="/student/login" className="text-green-600 font-semibold hover:text-green-800">
                Đăng nhập
              </Link>
            </p>
            <p className="text-gray-500">
              Chưa có tài khoản?{' '}
              <Link to="/student/register" className="text-green-600 font-semibold hover:text-green-800">
                Đăng ký miễn phí
              </Link>
            </p>
          </div>
        </form>
      ) : (
        /* Success state */
        <div className="text-center py-4">
          {/* Checkmark icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">Email đã được gửi!</h3>
          <p className="text-gray-500 text-sm mb-2">
            Chúng tôi đã gửi link đặt lại mật khẩu đến:
          </p>
          <p className="font-semibold text-green-700 text-sm mb-6 bg-green-50 px-4 py-2 rounded-xl inline-block">
            {form.email}
          </p>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 text-left">
            <p className="text-sm text-green-800 font-semibold mb-2">📧 Hướng dẫn tiếp theo:</p>
            <ol className="text-sm text-green-700 space-y-1.5 list-decimal list-inside">
              <li>Mở hộp thư email của bạn</li>
              <li>Tìm email từ MLC - Magical Linguistic Center</li>
              <li>Click vào link "Đặt lại mật khẩu"</li>
              <li>Link có hiệu lực trong <strong>30 phút</strong></li>
            </ol>
          </div>

          <p className="text-sm text-gray-500 mb-5">
            Không nhận được email?{' '}
            <button
              className="text-green-600 font-semibold hover:text-green-800 transition-colors"
              onClick={() => setStep('email')}
            >
              Gửi lại
            </button>
          </p>

          <div className="flex flex-col gap-3">
            <Link to="/student/login">
              <Button variant="primary" fullWidth>
                Quay lại đăng nhập
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" fullWidth>
                Về trang chủ
              </Button>
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  )
}
