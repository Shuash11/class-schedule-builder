import { HashRouter } from 'react-router-dom'
import { isSupabaseConfigured } from '../lib/supabaseClient.js'
import { ToastProvider } from '../components/ui/Toast.jsx'
import { AuthProvider } from '../features/auth/AuthProvider.jsx'
import SetupScreen from '../pages/SetupScreen.jsx'
import AppRoutes from './router.jsx'

/**
 * When the Supabase environment variables are missing, render the setup card
 * instead of the app (no router, no crash). Otherwise mount providers + routes.
 *
 * HashRouter (not BrowserRouter): GitHub Pages serves the app from a subpath
 * and cannot rewrite deep links to index.html, so browser-style paths would
 * 404 on refresh. Hash routing keeps every route refreshable and linkable
 * (URLs look like /#/schedule).
 */
export default function App() {
  if (!isSupabaseConfigured) {
    return <SetupScreen />
  }

  return (
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  )
}
