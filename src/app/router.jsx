import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import { useAuth } from '../features/auth/useAuth.js'
import LoginPage from '../features/auth/pages/LoginPage.jsx'
import RegisterPage from '../features/auth/pages/RegisterPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import SchedulePage from '../features/schedule/pages/SchedulePage.jsx'
import SubjectsPage from '../features/subjects/pages/SubjectsPage.jsx'

function FullScreenLoader() {
  return (
    <div className="grid min-h-dvh place-items-center bg-slate-50" role="status">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-hidden="true" />
      <span className="sr-only">Loading</span>
    </div>
  )
}

/** Protected routes: redirect to /login when unauthenticated. */
function RequireAuth() {
  const { status } = useAuth()
  if (status === 'loading') return <FullScreenLoader />
  if (status === 'unauthenticated') return <Navigate to="/login" replace />
  return <Outlet />
}

/** Public-only routes (/login, /register): redirect to /dashboard when authed. */
function RequireAnon() {
  const { status } = useAuth()
  if (status === 'loading') return <FullScreenLoader />
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function RootRedirect() {
  const { status } = useAuth()
  if (status === 'loading') return <FullScreenLoader />
  return <Navigate to={status === 'authenticated' ? '/dashboard' : '/login'} replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<RequireAnon />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
        </Route>
      </Route>
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
