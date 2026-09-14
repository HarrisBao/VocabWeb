import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, Badge } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth()

  // Profile Form state
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [specialization, setSpecialization] = useState(user?.specialization || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSuccess(null)
    setProfileError(null)

    if (!fullName.trim()) {
      setProfileError('Vui lòng nhập họ và tên.')
      return
    }

    setProfileLoading(true)
    try {
      await updateProfile({
        fullName: fullName.trim(),
        specialization: specialization.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined
      })
      setProfileSuccess('Cập nhật thông tin hồ sơ thành công!')
    } catch (err: any) {
      setProfileError(err.message || 'Không thể cập nhật hồ sơ.')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSuccess(null)
    setPasswordError(null)

    if (!currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại.')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không trùng khớp với mật khẩu mới.')
      return
    }

    setPasswordLoading(true)
    try {
      await changePassword(currentPassword, newPassword)
      setPasswordSuccess('Đổi mật khẩu thành công!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setPasswordError(err.message || 'Đổi mật khẩu thất bại.')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân & Tài khoản</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý thông tin giảng viên, ảnh đại diện và bảo mật tài khoản
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-green-100 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-600 to-emerald-700 text-white flex items-center justify-center text-3xl font-bold ring-4 ring-green-100 shadow-sm">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'T'}
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-xl font-bold text-gray-900">{user?.fullName}</h2>
              <Badge variant="green">Giáo viên</Badge>
            </div>
            <p className="text-sm text-gray-500 font-medium">{user?.email}</p>
            {user?.specialization && (
              <p className="text-xs text-green-700 bg-green-50 inline-block px-2.5 py-1 rounded-md font-medium">
                🎯 {user.specialization}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Tham gia từ ngày:{' '}
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Update Profile Form */}
        <Card padding="lg">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Thông tin cá nhân</h3>
            <p className="text-xs text-gray-500 mt-0.5">Thay đổi tên hiển thị và chuyên môn giảng dạy</p>
          </div>

          {profileSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs">
              ✓ {profileSuccess}
            </div>
          )}

          {profileError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
              ✕ {profileError}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên giáo viên"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email tài khoản (không thể thay đổi)
              </label>
              <Input
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-100 cursor-not-allowed opacity-75"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Chuyên môn giảng dạy
              </label>
              <Input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="Ví dụ: IELTS Reading & Listening, IELTS 8.0+"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Link ảnh đại diện (URL)
              </label>
              <Input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                loading={profileLoading}
                className="w-full"
              >
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Form */}
        <Card padding="lg">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Đổi mật khẩu</h3>
            <p className="text-xs text-gray-500 mt-0.5">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản</p>
          </div>

          {passwordSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs">
              ✓ {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
              ✕ {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mật khẩu hiện tại <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu đang sử dụng"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="outline"
                loading={passwordLoading}
                className="w-full"
              >
                Cập nhật mật khẩu
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
