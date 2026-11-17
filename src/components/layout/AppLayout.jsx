import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { BookOpen, CalendarDays, LayoutDashboard, LogOut } from 'lucide-react'
import Alert from '../ui/Alert.jsx'
import Button from '../ui/Button.jsx'
import Logo from '../ui/Logo.jsx'
import { useAuth } from '../../features/auth/useAuth.js'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/subjects', label: 'Subjects', icon: BookOpen },
  { to: '/schedule', label: 'Schedule', icon: CalendarDays },
]

const NAV_ITEM_CLASSES =
  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
const NAV_ACTIVE_CLASSES = 'bg-indigo-50 text-indigo-700'
const NAV_INACTIVE_CLASSES = 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'

const TAB_ITEM_CLASSES =
  'mx-2 my-1.5 flex flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'

/** Authenticated app shell (design-spec §4): sticky top nav ≥md, tab bar <md. */
export default function AppLayout() {
  const { user, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    setSignOutError(false)
    try {
      await signOut()
    } catch {
      // The local session may still have been cleared (which redirects);
      // this alert only shows when sign-out genuinely failed.
      setSignOutError(true)
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Logo />
              <span className="hidden text-base font-semibold tracking-tight text-slate-900 sm:inline">
                Class Schedule Builder
              </span>
            </div>
            <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `${NAV_ITEM_CLASSES} ${isActive ? NAV_ACTIVE_CLASSES : NAV_INACTIVE_CLASSES}`
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <span className="hidden max-w-48 truncate text-xs text-slate-500 lg:block">
                {user?.email}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {signOutError && (
        <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8" role="alert">
          <Alert variant="error">
            Couldn&apos;t sign out. Check your connection and try again.
          </Alert>
        </div>
      )}

      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8 md:pb-8 lg:px-8">
        <Outlet />
      </main>

      <nav
        aria-label="Primary"
        className="no-print fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${TAB_ITEM_CLASSES} ${isActive ? NAV_ACTIVE_CLASSES : 'text-slate-600'}`
            }
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
