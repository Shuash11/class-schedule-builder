import Logo from '../components/ui/Logo.jsx'

/**
 * Full-screen setup card shown instead of the app when the Supabase
 * environment variables are missing. No router, no crash.
 */
export default function SetupScreen() {
  return (
    <div className="grid min-h-dvh place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h1 className="mt-3 text-center text-xl font-semibold text-slate-900">
          Set up Supabase to continue
        </h1>
        <p className="mt-1 text-center text-sm text-slate-600">
          This app needs your Supabase project details before it can run.
        </p>
        <div className="mt-6 space-y-4 text-sm text-slate-600">
          <p>
            Add these two variables to a <code className="text-slate-900">.env.local</code> file in
            the project root, then restart the dev server:
          </p>
          <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            VITE_SUPABASE_URL=&lt;your Supabase project URL&gt;
            {'\n'}
            VITE_SUPABASE_PUBLISHABLE_KEY=&lt;your publishable key&gt;
          </pre>
          <p>
            Step-by-step instructions are in <code className="text-slate-900">README.md</code> at
            the project root.
          </p>
        </div>
      </div>
    </div>
  )
}
