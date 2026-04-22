import { useEffect } from 'react'

interface ToastProps {
  message: string | null
  onDismiss: () => void
}

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const id = window.setTimeout(onDismiss, 5000)
    return () => window.clearTimeout(id)
  }, [message, onDismiss])

  if (!message) return null

  return (
    <div
      role="alert"
      className="fixed bottom-6 right-6 z-50 max-w-sm view-enter"
      style={{
        backgroundColor: '#1E1E1E',
        border: '1px solid var(--error)',
        color: 'var(--error)',
        fontFamily: '"DM Mono", monospace',
        fontSize: '13px',
        padding: '12px 16px',
        borderRadius: '4px',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="flex-1 leading-relaxed">{message}</span>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{ color: 'var(--error)', opacity: 0.7 }}
          className="hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  )
}
