import { useEffect, useId, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Loader2, HelpCircle } from 'lucide-react'

type ConfirmModalProps = {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'primary'
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
  variant = 'primary',
  isLoading = false,
}: ConfirmModalProps) {
  const titleId = useId()
  const descId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)

  // Échap pour fermer + focus initial sur "Annuler" (choix le plus sûr)
  useEffect(() => {
    if (!isOpen) return
    const t = window.setTimeout(() => cancelRef.current?.focus(), 50)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, isLoading, onCancel])

  const danger = variant === 'danger'

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onCancel}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm dark:bg-black/60"
          />

          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: 'spring', damping: 30, stiffness: 420 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-night-900 dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)] sm:p-7"
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              aria-label="Fermer"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <X className="size-4" />
            </button>

            <div className="flex gap-4">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${
                  danger
                    ? 'bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-400'
                    : 'bg-brand-500/10 text-brand-600 ring-brand-500/20 dark:text-brand-300'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : danger ? (
                  <AlertTriangle className="size-5" strokeWidth={1.75} />
                ) : (
                  <HelpCircle className="size-5" strokeWidth={1.75} />
                )}
              </div>
              <div className="min-w-0 pr-6">
                <h3 id={titleId} className="text-base font-semibold tracking-tight text-slate-950 dark:text-white">
                  {title}
                </h3>
                <p id={descId} className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {message}
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                ref={cancelRef}
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="h-10 rounded-full px-5 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-white/5"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium text-white transition-[background-color,box-shadow] active:scale-[0.98] disabled:opacity-70 ${
                  danger
                    ? 'bg-rose-600 hover:bg-rose-500 hover:shadow-[0_8px_24px_-8px_rgba(225,29,72,0.6)]'
                    : 'bg-brand-600 hover:bg-brand-700'
                }`}
              >
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
