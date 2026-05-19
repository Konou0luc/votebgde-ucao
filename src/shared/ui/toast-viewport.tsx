import { useEffect } from 'react'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { useToastStore } from './toast-store'

export function ToastViewport({ theme }: { theme: 'light' | 'dark' }) {
  const { toasts, removeToast } = useToastStore()

  useEffect(() => {
    if (toasts.length === 0) return

    const timers = toasts.map((toast) =>
      window.setTimeout(() => removeToast(toast.id), 3200),
    )

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [toasts, removeToast])

  return (
    <div
      className="pointer-events-none fixed z-[110] flex w-[min(92vw,420px)] flex-col gap-2 max-md:inset-x-4 max-md:top-[max(1rem,env(safe-area-inset-top))] max-md:bottom-auto md:bottom-4 md:right-4 md:left-auto"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-2 rounded-xl border p-3 text-sm shadow-lg ${
            toast.type === 'success'
              ? theme === 'dark'
                ? 'border-emerald-700 bg-emerald-900/90 text-emerald-100'
                : 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : theme === 'dark'
                ? 'border-rose-800 bg-rose-950/90 text-rose-100'
                : 'border-rose-200 bg-rose-50 text-rose-900'
          }`}
        >
          {toast.type === 'success' ? (
            <CircleCheck size={16} className="mt-0.5 shrink-0" />
          ) : (
            <CircleAlert size={16} className="mt-0.5 shrink-0" />
          )}
          <p>{toast.message}</p>
        </div>
      ))}
    </div>
  )
}
