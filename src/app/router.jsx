import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout.jsx'
import { useAuth } from '../features/auth/useAuth.js'
import LoginPage from '../features/auth/pages/LoginPage.jsx'
import RegisterPage from '../features/auth/pages/RegisterPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import SchedulePage from '../features/schedule/pages/SchedulePage.jsx'
import SubjectsPage from '../features/subjects/pages/SubjectsPage.jsx'

/**
 * Demo mode with OPTIONAL sign-in: the schedule pages are never blocked —
 * Firestore rules are open. /login and /register are available for users who
 * want to sign in once the Email/Password provider is enabled in the Firebase
 * console; an already-signed-in visitor is returned to the dashboard.
 */
function RequireAnon() {
  const { status } = useAuth()
  if (status === 'loading') return null
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<RequireAnon />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
