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
import { NoAccountPortalPage } from '../pages/auth/NoAccountPortalPage'
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'

// Lessons
import { PublicLessonsPage } from '../pages/lessons/PublicLessonsPage'

// Learn
import { ClassPage } from '../pages/learn/ClassPage'
import { VocabularyReviewPage } from '../pages/learn/VocabularyReviewPage'
import { ReadingAttemptWorkspace } from '../pages/learn/reading/ReadingAttemptWorkspace'
import { ReadingResultSummaryPage } from '../pages/learn/reading/ReadingResultSummaryPage'


// Student System Shell
import { StudentLayout } from '../components/layout/StudentLayout'
import { StudentHomePage } from '../pages/student/StudentHomePage'
import { StudentReadingPage } from '../pages/student/StudentReadingPage'
import { StudentComingSoonPage } from '../pages/student/StudentComingSoonPage'
import { StudentAccountDashboard } from '../pages/student/StudentAccountDashboard'
import { StudentClassDetailPage } from '../pages/student/StudentClassDetailPage'

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
import { ClassroomActivityPage } from '../pages/teacher/ClassroomActivityPage'
import { TeacherReadingListPage } from '../pages/teacher/TeacherReadingListPage'
import { TeacherReadingEditPage } from '../pages/teacher/TeacherReadingEditPage'
import { TeacherReadingResultsClassSelectPage } from '../pages/teacher/TeacherReadingResultsClassSelectPage'
import { TeacherReadingResultsPage } from '../pages/teacher/TeacherReadingResultsPage'
import { ProfilePage } from '../pages/teacher/ProfilePage'

// TA System
import { TaLayout } from '../components/layout/TaLayout'
import { TaDashboardPage } from '../pages/ta/TaDashboardPage'
import { TaClassDetailPage } from '../pages/ta/TaClassDetailPage'
import { TaScheduleManagementPage } from '../pages/ta/TaScheduleManagementPage'

// Admin System
import AdminLoginPage from '../pages/admin/AdminLoginPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminClassDetailPage from '../pages/admin/AdminClassDetailPage'
import AdminFeedbackCyclesPage from '../pages/admin/AdminFeedbackCyclesPage'

// Feedback Pages
import TaFeedbackPage from '../pages/ta/TaFeedbackPage'
import TeacherFeedbackPage from '../pages/teacher/TeacherFeedbackPage'
import { StudentFeedbackPage } from '../pages/student/StudentFeedbackPage'
import { StudentVocabularyHubPage } from '../pages/student/StudentVocabularyHubPage'

// Progress Pages
import { TeacherProgressPage } from '../pages/teacher/TeacherProgressPage'

// 404
import { NotFoundPage } from '../pages/NotFoundPage'


const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('admin_access_token')
  const profile = (() => {
    try { return JSON.parse(localStorage.getItem('admin_user_profile') ?? '{}') } catch { return {} }
  })()

  if (!token || profile?.role !== 'Admin') {
    return <Navigate to="/admin/login" replace />
  }
  return <>{children}</>
}

const StudentRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const stored = localStorage.getItem('student_profile')
  const token = localStorage.getItem('student_access_token')
  
  if (!stored || !token) {
    return <Navigate to="/student/login" replace />
  }

  try {
    const profile = JSON.parse(stored)
    if (profile.role !== 'Student') {
      return <Navigate to="/student/login" replace />
    }
  } catch {
    return <Navigate to="/student/login" replace />
  }

  return children ? <>{children}</> : <StudentLayout />
}

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

const TaRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
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

  if (!isAuthenticated || user?.role !== 'TA') {
    return <Navigate to="/teacher/login" replace />
  }

  return children ? <>{children}</> : <TaLayout />
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
            <Route path="/class/:classSlug/portal/login" element={<NoAccountPortalPage />} />

            {/* Student System Shell for No-Account Students */}
            <Route path="/class/:classSlug/portal" element={<StudentLayout />}>
              <Route index element={<StudentHomePage />} />
              <Route path="reading" element={<StudentReadingPage />} />
              <Route path=":skillId" element={<StudentComingSoonPage />} />
            </Route>

            {/* Student System Shell for Account Students */}
            <Route path="/student" element={<StudentRoute />}>
              <Route index element={<StudentAccountDashboard />} />
              <Route path="feedback" element={<StudentFeedbackPage />} />
              <Route path="classes/:id" element={<StudentClassDetailPage />} />
              <Route path="classes/:id/reading/:readingId" element={<ReadingAttemptWorkspace />} />
              <Route path="classes/:id/reading/:readingId/attempts/:attemptId/result" element={<ReadingResultSummaryPage />} />
              <Route path="classes/:id/reading/:readingId/attempts/:attemptId/review" element={<ReadingAttemptWorkspace isReview />} />

              <Route path="classes/:id/:skill-vocabulary" element={<StudentVocabularyHubPage />} />
              <Route path="classes/:id/:skillId" element={<StudentComingSoonPage />} />
            </Route>

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
            <Route path="reading" element={<TeacherReadingListPage />} />
            <Route path="reading/:readingId/edit" element={<TeacherReadingEditPage />} />
            <Route path="reading/:readingId/results" element={<TeacherReadingResultsClassSelectPage />} />
            <Route path="classes/:id" element={<ClassDetailPage />} />
            <Route path="classes/:id/activities" element={<ClassroomActivityPage />} />
            <Route path="classes/:id/reading/:readingId/edit" element={<TeacherReadingEditPage />} />
            <Route path="classes/:id/reading/:readingId/results" element={<TeacherReadingResultsPage />} />
            <Route path="tests" element={<TestListPage />} />
            <Route path="tests/new" element={<TestCreatePage />} />
            <Route path="tests/:id" element={<TestDetailPage />} />
            <Route path="tests/:id/results" element={<ClassTestResultsPage />} />
            <Route path="feedback" element={<TeacherFeedbackPage />} />
            <Route path="progress" element={<TeacherProgressPage />} />
            <Route path="results" element={<Navigate to="/teacher/classes" replace />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* TA Protected Area */}
          <Route path="/ta" element={<TaRoute />}>
            <Route index element={<Navigate to="/ta/dashboard" replace />} />
            <Route path="dashboard" element={<TaDashboardPage />} />
            <Route path="classes" element={<TaDashboardPage />} />
            <Route path="classes/:id" element={<TaClassDetailPage />} />
            <Route path="feedback" element={<TaFeedbackPage />} />
            <Route path="schedule" element={<TaScheduleManagementPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Area */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/classes/:id" element={<AdminRoute><AdminClassDetailPage /></AdminRoute>} />
          <Route path="/admin/feedback" element={<AdminRoute><AdminFeedbackCyclesPage /></AdminRoute>} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}






