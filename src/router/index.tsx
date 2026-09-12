import { BrowserRouter, Routes, Route } from 'react-router-dom'

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

// 404
import { NotFoundPage } from '../pages/NotFoundPage'

export const AppRouter = () => {
  return (
    <BrowserRouter>
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

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
