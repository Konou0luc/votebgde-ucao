import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CircleAlert, CircleCheck, X } from 'lucide-react'
import { useToastStore } from './toast-store'

const TOAST_DURATION = 3200

// `theme` conservé pour compatibilité ; le style suit la classe `.dark`.
export function ToastViewport(props: { theme: 'light' | 'dark' }) {
  void props
  const { toasts, removeToast } = useToastStore()

  return (
    <div
      className="pointer-events-none fixed z-[110] flex w-[min(92vw,400px)] flex-col gap-2 max-md:inset-x-0 max-md:top-[max(0.75rem,env(safe-area-inset-top))] max-md:mx-auto md:bottom-5 md:right-5"
      aria-live="polite"
      aria-relevant="additions"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const success = toast.type === 'success'
          return (
            <motion.div
              key={toast.id}
              layout
              role={success ? 'status' : 'alert'}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 p-3.5 pr-10 text-sm text-slate-800 shadow-lift backdrop-blur-xl dark:border-white/10 dark:bg-night-800/95 dark:text-slate-100"
            >
              <span
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
                  success ? 'bg-aqua-500/15 text-aqua-600 dark:text-aqua-300' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                }`}
              >
                {success ? <CircleCheck size={14} /> : <CircleAlert size={14} />}
              </span>
              <p className="leading-snug">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Fermer la notification"
                className="absolute right-2 top-2 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X size={14} />
              </button>
              <AutoDismiss id={toast.id} onDismiss={removeToast} />
              <motion.span
                aria-hidden
                className={`absolute bottom-0 left-0 h-0.5 ${success ? 'bg-aqua-500/60' : 'bg-rose-500/60'}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: TOAST_DURATION / 1000, ease: 'linear' }}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

/** Minuteur indépendant par notification. */
function AutoDismiss({ id, onDismiss }: { id: string; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(id), TOAST_DURATION)
    return () => window.clearTimeout(timer)
  }, [id, onDismiss])
  return null
}
