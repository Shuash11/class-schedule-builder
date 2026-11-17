import { createContext, useContext } from 'react'

/**
 * Success-toast context (design-spec §5). Success only — errors are inline.
 * Split from Toast.jsx so the component file exports only the provider.
 */
export const ToastContext = createContext(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
