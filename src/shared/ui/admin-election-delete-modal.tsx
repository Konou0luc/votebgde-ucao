import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import type { ScrutinRecord } from '../../modules/admin-dashboard/types'

type Props = {
  election: ScrutinRecord | null
  isDeleting: boolean
  onClose: () => void
  onConfirmDelete: () => Promise<void>
}

export function AdminElectionDeleteModal({ election, isDeleting, onClose, onConfirmDelete }: Props) {
  const open = Boolean(election)
  const titleId = useId()
  const descId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const firstBtnRef = useRef<HTMLButtonElement>(null)
  const confirmInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<1 | 2>(1)
  const [confirmInput, setConfirmInput] = useState('')

  useEffect(() => {
    if (!open) {
      setStep(1)
      setConfirmInput('')
      return
    }
    setStep(1)
    setConfirmInput('')
  }, [open, election?.id])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => {
      if (step === 2) confirmInputRef.current?.focus()
      else firstBtnRef.current?.focus()
    }, 0)
    return () => window.clearTimeout(t)
  }, [open, step])

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isDeleting) {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, isDeleting, onClose])

  useEffect(() => {
    if (!open) return
    function onFocusIn(e: FocusEvent) {
      const panel = panelRef.current
      if (!panel || panel.contains(e.target as Node)) return
      firstBtnRef.current?.focus()
    }
    document.addEventListener('focusin', onFocusIn)
    return () => document.removeEventListener('focusin', onFocusIn)
  }, [open])

  if (!election) return null

  const titleMatches = confirmInput.trim() === election.title.trim()

  async function handleFinalDelete() {
    if (!titleMatches || isDeleting) return
    await onConfirmDelete()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose()
      }}
    >
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm dark:bg-black/70" aria-hidden />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-[1] w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/[0.12] dark:bg-slate-950"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200">
              <AlertTriangle className="size-5" strokeWidth={1.5} />
            </span>
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-semibold text-slate-900 dark:text-white">
                {step === 1 ? 'Supprimer cette élection ?' : 'Confirmation finale'}
              </h2>
              <p id={descId} className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {step === 1 ? (
                  <>
                    L’élection « <span className="font-medium text-slate-800 dark:text-slate-200">{election.title}</span>{' '}
                    » sera archivée et retirée des flux actifs. Cette action est défavorable aux votants si l’élection est
                    encore en cours — vérifiez les dates avant de continuer.
                  </>
                ) : (
                  <>
                    Saisissez le titre exact de l’élection pour confirmer la suppression définitive (archivage côté
                    serveur).
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !isDeleting && onClose()}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 dark:hover:bg-white/[0.08] dark:hover:text-slate-200"
            aria-label="Fermer"
            disabled={isDeleting}
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>

        {step === 2 ? (
          <div className="mt-6 space-y-2">
            <label htmlFor="delete-confirm-title" className="block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-500">
              Titre à recopier
            </label>
            <input
              ref={confirmInputRef}
              id="delete-confirm-title"
              type="text"
              autoComplete="off"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={election.title}
              disabled={isDeleting}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-blue-500/0 transition placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 disabled:opacity-60 dark:border-white/[0.12] dark:bg-slate-900 dark:text-slate-100"
            />
            {!titleMatches && confirmInput.length > 0 ? (
              <p className="text-xs text-rose-600 dark:text-rose-300">Le titre ne correspond pas exactement.</p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          {step === 1 ? (
            <>
              <button
                type="button"
                ref={firstBtnRef}
                onClick={() => !isDeleting && onClose()}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 dark:border-white/[0.12] dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-white/[0.06]"
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-rose-600 px-5 text-sm font-semibold text-white transition hover:bg-rose-700"
                disabled={isDeleting}
              >
                Continuer vers la suppression
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                ref={firstBtnRef}
                onClick={() => !isDeleting && setStep(1)}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 dark:border-white/[0.12] dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-white/[0.06]"
                disabled={isDeleting}
              >
                Retour
              </button>
              <button
                type="button"
                onClick={() => void handleFinalDelete()}
                disabled={!titleMatches || isDeleting}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-rose-600 px-5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:pointer-events-none disabled:opacity-40"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" strokeWidth={2} />
                    Suppression…
                  </>
                ) : (
                  'Supprimer définitivement'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
