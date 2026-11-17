import { BrowserRouter } from 'react-router-dom'
import { isSupabaseConfigured } from '../lib/supabaseClient.js'
import { ToastProvider } from '../components/ui/Toast.jsx'
import { AuthProvider } from '../features/auth/AuthProvider.jsx'
import SetupScreen from '../pages/SetupScreen.jsx'
import AppRoutes from './router.jsx'

/**
 * When the Supabase environment variables are missing, render the setup card
 * instead of the app (no router, no crash). Otherwise mount providers + routes.
 */
export default function App() {
  if (!isSupabaseConfigured) {
    return <SetupScreen />
  }

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
