import Logo from '../../../components/ui/Logo.jsx'

/**
 * Shared centered card shell for /login and /register (design-spec §6.1).
 * The page's single h1 is the app name; the subtitle says which page it is.
 */
export default function AuthShell({ subtitle, children, footer }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h1 className="mt-3 text-center text-xl font-semibold text-slate-900">
          Class Schedule Builder
        </h1>
        <p className="mt-1 text-center text-sm text-slate-600">{subtitle}</p>
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>}
      </div>
    </div>
  )
}
