import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Loader2 } from 'lucide-react'

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
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Backdrop avec effet de flou haut de gamme */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onCancel}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md dark:bg-black/60"
          />

          {/* Modal - Dimensions adaptatives (doublées sur desktop) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="relative w-[320px] md:w-[560px] overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/90 p-8 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
          >
            {/* Bouton fermer discret */}
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="absolute right-6 top-6 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5 disabled:opacity-30"
            >
              <X className="size-5 md:size-6" />
            </button>

            <div className="flex flex-col items-center text-center">
              {/* Icone minimaliste */}
              <div
                className={`relative mb-6 flex size-14 md:size-20 items-center justify-center rounded-3xl ${
                  variant === 'danger'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="relative size-7 md:size-10 animate-spin" />
                ) : (
                  <AlertTriangle className="relative size-7 md:size-10" strokeWidth={1.5} />
                )}
              </div>

              <h3 className="text-lg md:text-2xl font-bold tracking-tight text-slate-950 dark:text-white leading-tight">
                {title}
              </h3>
              <p className="mt-4 text-sm md:text-lg leading-relaxed text-slate-500 dark:text-slate-400 max-w-md">
                {message}
              </p>

              {/* Actions compactes horizontales */}
              <div className="mt-10 flex w-full gap-4">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex h-11 md:h-14 flex-1 items-center justify-center rounded-2xl bg-slate-100 text-sm md:text-base font-bold text-slate-600 transition-all duration-300 hover:bg-slate-200 active:scale-[0.98] dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 disabled:opacity-50"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex h-11 md:h-14 flex-1 items-center justify-center gap-2 rounded-2xl text-sm md:text-base font-bold text-white transition-all duration-300 active:scale-[0.98] disabled:opacity-70 ${
                    variant === 'danger'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                  }`}
                >
                  {isLoading && <Loader2 className="size-4 md:size-5 animate-spin" />}
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
