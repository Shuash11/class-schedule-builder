import Logo from '../components/ui/Logo.jsx'

/**
 * Full-screen setup card shown instead of the app when the Firebase
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
          Set up Firebase to continue
        </h1>
        <p className="mt-1 text-center text-sm text-slate-600">
          This app needs your Firebase project details before it can run.
        </p>
        <div className="mt-6 space-y-4 text-sm text-slate-600">
          <p>
            Add these variables to a <code className="text-slate-900">.env.local</code> file in
            the project root, then restart the dev server:
          </p>
          <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            VITE_FIREBASE_API_KEY=&lt;your web app API key&gt;
            {'\n'}
            VITE_FIREBASE_AUTH_DOMAIN=&lt;your auth domain&gt;
            {'\n'}
            VITE_FIREBASE_PROJECT_ID=&lt;your project id&gt;
            {'\n'}
            VITE_FIREBASE_STORAGE_BUCKET=&lt;your storage bucket&gt;
            {'\n'}
            VITE_FIREBASE_MESSAGING_SENDER_ID=&lt;your sender id&gt;
            {'\n'}
            VITE_FIREBASE_APP_ID=&lt;your app id&gt;
          </pre>
          <p>
            Copy the values from the Firebase console: <strong>Project settings → General →
            Your apps → SDK setup and configuration</strong> (web app). Step-by-step
            instructions are in <code className="text-slate-900">README.md</code> at the project
            root.
          </p>
        </div>
      </div>
    </div>
  )
}
