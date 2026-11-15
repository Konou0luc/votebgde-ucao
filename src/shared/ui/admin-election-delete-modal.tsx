import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Loader2 } from 'lucide-react'
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
      <div className="pointer-events-none absolute inset-0 bg-slate-950/40 backdrop-blur-sm dark:bg-black/60" aria-hidden />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-[1] w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-night-900 dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7)] sm:p-7"
      >

        <div className="flex gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 ring-1 ring-inset ring-rose-500/20 dark:text-rose-400">
            <AlertTriangle className="size-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-slate-400">Étape {step} sur 2</p>
            <h2 id={titleId} className="mt-0.5 text-base font-semibold tracking-tight text-slate-950 dark:text-white">
              {step === 1 ? 'Supprimer l’élection ?' : 'Confirmation finale'}
            </h2>
            <p id={descId} className="mt-1.5 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
              {step === 1 ? (
                <>
                  L’élection « <span className="font-medium text-slate-900 dark:text-slate-200">{election.title}</span> » sera
                  archivée. Cette action est irréversible et impactera les votes en cours.
                </>
              ) : (
                <>Pour confirmer, saisissez le titre exact de l’élection ci-dessous.</>
              )}
            </p>
          </div>
        </div>

        {step === 2 ? (
          <div className="mt-6 space-y-1.5">
            <label htmlFor="delete-confirm-title" className="block text-[15px] font-medium text-slate-700 dark:text-slate-300">
              Titre de l&apos;élection
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
              className="tt-field-outline h-10 w-full rounded-lg px-3 focus:!border-rose-500 focus:!ring-rose-500/15"
            />
            {!titleMatches && confirmInput.length > 0 && <p className="text-[13px] text-rose-600 dark:text-rose-400">Le titre ne correspond pas.</p>}
          </div>
        ) : null}

        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            ref={firstBtnRef}
            onClick={() => !isDeleting && (step === 1 ? onClose() : setStep(1))}
            className="h-10 rounded-full px-5 text-[15px] font-medium text-slate-700 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-white/5"
            disabled={isDeleting}
          >
            {step === 1 ? 'Annuler' : 'Retour'}
          </button>
          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="h-10 rounded-full bg-rose-600 px-5 text-[15px] font-medium text-white transition-colors hover:bg-rose-500 disabled:opacity-50"
              disabled={isDeleting}
            >
              Continuer
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleFinalDelete()}
              disabled={!titleMatches || isDeleting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-rose-600 px-5 text-[15px] font-medium text-white transition-colors hover:bg-rose-500 disabled:opacity-50"
            >
              {isDeleting && <Loader2 className="size-4 animate-spin" />}
              {isDeleting ? 'Suppression…' : 'Confirmer la suppression'}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
