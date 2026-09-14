// ============================================================
// TypeScript interfaces for authentication
// Phase 1: UI only — no real API calls yet
// TODO: Connect to ASP.NET Core Web API in Phase 2
// ============================================================

export type UserRole = 'teacher' | 'student'

export interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface TeacherRegisterFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  specialization: string
  phoneNumber?: string
}

export interface StudentRegisterFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  level: 'beginner' | 'intermediate' | 'advanced'
  className?: string
}

export interface ForgotPasswordFormData {
  email: string
}

export interface FormErrors {
  [key: string]: string
}
