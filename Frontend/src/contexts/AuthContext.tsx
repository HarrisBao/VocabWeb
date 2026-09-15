import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'
import type { TeacherRegisterFormData } from '../types/auth'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  specialization?: string
  role: string
  createdAt: string
}

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<UserProfile>
  loginWithGoogle: (idToken: string) => Promise<UserProfile>
  registerTeacher: (data: TeacherRegisterFormData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: { fullName: string; specialization?: string; avatarUrl?: string }) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('teacher_user_profile')
    return saved ? JSON.parse(saved) : null
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('teacher_access_token')
    if (token) {
      refreshProfile().finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const refreshProfile = async () => {
    try {
      const profile = await api.get<UserProfile>('/auth/profile')
      setUser(profile)
      localStorage.setItem('teacher_user_profile', JSON.stringify(profile))
    } catch {
      // If profile fails, clear tokens if unauthorized
      setUser(null)
      api.clearTokens()
    }
  }

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/teacher/login', { email, password }, { requiresAuth: false })
    api.setTokens(res.accessToken, res.refreshToken)
    setUser(res.user)
    localStorage.setItem('teacher_user_profile', JSON.stringify(res.user))
    return res.user
  }

  const loginWithGoogle = async (idToken: string) => {
    const res = await api.post('/auth/teacher/google', { idToken }, { requiresAuth: false })
    api.setTokens(res.accessToken, res.refreshToken)
    setUser(res.user)
    localStorage.setItem('teacher_user_profile', JSON.stringify(res.user))
    return res.user
  }

  const registerTeacher = async (data: TeacherRegisterFormData) => {
    const res = await api.post('/auth/teacher/register', data, { requiresAuth: false })
    api.setTokens(res.accessToken, res.refreshToken)
    setUser(res.user)
    localStorage.setItem('teacher_user_profile', JSON.stringify(res.user))
  }

  const logout = async () => {
    const refreshToken = localStorage.getItem('teacher_refresh_token')
    try {
      await api.post('/auth/logout', { refreshToken })
    } catch {
      // Ignore network error on logout
    } finally {
      api.clearTokens()
      setUser(null)
    }
  }

  const updateProfile = async (data: { fullName: string; specialization?: string; avatarUrl?: string }) => {
    const updated = await api.put<UserProfile>('/auth/profile', data)
    setUser(updated)
    localStorage.setItem('teacher_user_profile', JSON.stringify(updated))
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await api.post('/auth/change-password', { currentPassword, newPassword })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        registerTeacher,
        logout,
        updateProfile,
        changePassword,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
