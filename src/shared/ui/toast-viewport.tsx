import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CircleAlert, CircleCheck, X } from 'lucide-react'
import { useToastStore, type ToastItem } from './toast-store'

/** Durée d'affichage (ms) : un peu plus longue pour les erreurs, souvent plus longues à lire. */
const DURATION = { success: 5000, error: 7000 } as const

// `theme` conservé pour compatibilité ; le style suit la classe `.dark`.
export function ToastViewport(props: { theme: 'light' | 'dark' }) {
  void props
  const { toasts, removeToast } = useToastStore()

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[110] mx-auto flex w-[min(calc(100vw-1.5rem),420px)] flex-col gap-2"
      aria-live="polite"
      aria-relevant="additions"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const success = toast.type === 'success'
  const duration = DURATION[toast.type]
  const [paused, setPaused] = useState(false)
  const remaining = useRef<number>(duration)

  // Décompte qui se met en pause au survol / focus et reprend ensuite où il s'était arrêté.
  useEffect(() => {
    if (paused) return
    const startedAt = Date.now()
    const timer = window.setTimeout(() => onDismiss(toast.id), remaining.current)
    return () => {
      window.clearTimeout(timer)
      remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt))
    }
  }, [paused, toast.id, onDismiss])

  const pause = () => setPaused(true)
  const resume = () => setPaused(false)

  return (
    <motion.div
      layout
      role={success ? 'status' : 'alert'}
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      className={`pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-xl border bg-white p-3.5 pr-10 text-sm text-slate-800 shadow-lift dark:bg-night-800 dark:text-slate-100 ${
        success ? 'border-emerald-500/30' : 'border-rose-500/30'
      }`}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${success ? 'bg-emerald-500' : 'bg-rose-600'}`} aria-hidden />
      <span
        className={`ml-1 mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
          success ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
        }`}
      >
        {success ? <CircleCheck size={14} /> : <CircleAlert size={14} />}
      </span>
      <div className="min-w-0">
        <p className="font-medium leading-snug">{success ? 'Succès' : 'Erreur'}</p>
        <p className="mt-0.5 leading-snug text-slate-600 dark:text-slate-300">{toast.message}</p>
        {paused && <p className="mt-1 text-xs text-slate-400">En pause — retirez le curseur pour continuer</p>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fermer la notification"
        className="absolute right-2 top-2 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <X size={14} />
      </button>
      {/* Barre de temps restant : se fige pendant la pause */}
      <span
        aria-hidden
        className={`absolute bottom-0 left-0 h-0.5 w-full origin-left ${success ? 'bg-emerald-500/70' : 'bg-rose-500/70'}`}
        style={{
          animation: `toast-progress ${duration}ms linear forwards`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      />
    </motion.div>
  )
}
