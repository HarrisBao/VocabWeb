import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '../contexts/AuthContext'

// Landing
import { LandingPage } from '../pages/landing/LandingPage'

// Auth
import { TeacherLoginPage } from '../pages/auth/TeacherLoginPage'
import { TeacherRegisterPage } from '../pages/auth/TeacherRegisterPage'
import { StudentLoginPage } from '../pages/auth/StudentLoginPage'
import { StudentRegisterPage } from '../pages/auth/StudentRegisterPage'
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'

// Lessons
import { PublicLessonsPage } from '../pages/lessons/PublicLessonsPage'

// Learn
import { ClassPage } from '../pages/learn/ClassPage'
import { VocabularyReviewPage } from '../pages/learn/VocabularyReviewPage'

// Test Access
import { TestAccessPage } from '../pages/learn/test/TestAccessPage'
import { TestIntroPage } from '../pages/learn/test/TestIntroPage'
import { TestSessionPage } from '../pages/learn/test/TestSessionPage'

// Teacher System
import { TeacherLayout } from '../components/layout/TeacherLayout'
import { DashboardPage } from '../pages/teacher/DashboardPage'
import { VocabularyListPage } from '../pages/teacher/VocabularyListPage'
import { VocabularyDetailPage } from '../pages/teacher/VocabularyDetailPage'
import { ClassListPage } from '../pages/teacher/ClassListPage'
import { ClassDetailPage } from '../pages/teacher/ClassDetailPage'
import { TestListPage } from '../pages/teacher/TestListPage'
import { TestCreatePage } from '../pages/teacher/TestCreatePage'
import { TestDetailPage } from '../pages/teacher/TestDetailPage'
import { ClassTestResultsPage } from '../pages/teacher/ClassTestResultsPage'
import { ProfilePage } from '../pages/teacher/ProfilePage'

// 404
import { NotFoundPage } from '../pages/NotFoundPage'

const TeacherRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium text-sm">Đang xác thực thông tin...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'Teacher') {
    return <Navigate to="/teacher/login" replace />
  }

  return children ? <>{children}</> : <TeacherLayout />
}

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Landing */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Lessons */}
          <Route path="/lessons" element={<PublicLessonsPage />} />

          {/* Teacher Auth */}
          <Route path="/teacher/login" element={<TeacherLoginPage />} />
          <Route path="/teacher/register" element={<TeacherRegisterPage />} />

          {/* Student Auth */}
          <Route path="/student/login" element={<StudentLoginPage />} />
          <Route path="/student/register" element={<StudentRegisterPage />} />

          {/* Forgot Password */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Learn / Student Areas */}
          <Route path="/class/:slug" element={<ClassPage />} />
          <Route path="/learn/vocabulary/:id" element={<VocabularyReviewPage />} />
          
          {/* Test Access Flow */}
          <Route path="/test/:publicCode" element={<TestAccessPage />} />
          <Route path="/test/:publicCode/intro" element={<TestIntroPage />} />
          <Route path="/test/:publicCode/session/:attemptId" element={<TestSessionPage />} />

          {/* Teacher Full-Stack Protected Area */}
          <Route path="/teacher" element={<TeacherRoute />}>
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="vocabulary" element={<VocabularyListPage />} />
            <Route path="vocabulary/new" element={<VocabularyDetailPage />} />
            <Route path="vocabulary/:id" element={<VocabularyDetailPage />} />
            <Route path="classes" element={<ClassListPage />} />
            <Route path="classes/:id" element={<ClassDetailPage />} />
            <Route path="tests" element={<TestListPage />} />
            <Route path="tests/new" element={<TestCreatePage />} />
            <Route path="tests/:id" element={<TestDetailPage />} />
            <Route path="tests/:id/results" element={<ClassTestResultsPage />} />
            <Route path="results" element={<Navigate to="/teacher/classes" replace />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
