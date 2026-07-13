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
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose()
      }}
    >
      {/* Backdrop haut de gamme */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md dark:bg-black/60" aria-hidden />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-[1] w-full max-w-[440px] overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/90 p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90 dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
      >
        <div className="flex flex-col items-center text-center">
          {/* Icone avec aura lumineuse */}
          <div className="relative mb-6 flex size-16 items-center justify-center rounded-[1.5rem] bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <div className="absolute inset-0 animate-pulse rounded-[1.5rem] bg-rose-500 blur-xl opacity-20" />
            <AlertTriangle className="relative size-8" strokeWidth={1.5} />
          </div>

          <h2 id={titleId} className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
            {step === 1 ? 'Supprimer l’élection ?' : 'Confirmation finale'}
          </h2>
          
          <p id={descId} className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {step === 1 ? (
              <>
                L’élection « <span className="font-semibold text-slate-900 dark:text-slate-200">{election.title}</span> » sera archivée. 
                Cette action est irréversible et impactera les votes en cours.
              </>
            ) : (
              <>
                Pour confirmer, veuillez saisir le titre exact de l’élection ci-dessous.
              </>
            )}
          </p>
        </div>

        {step === 2 ? (
          <div className="mt-8 space-y-3">
            <label htmlFor="delete-confirm-title" className="block px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white/50 px-4 text-sm font-medium outline-none transition focus:border-rose-500 focus:bg-white dark:border-white/10 dark:bg-slate-950/50"
            />
            {!titleMatches && confirmInput.length > 0 && (
              <p className="px-1 text-[10px] font-bold text-rose-500">Le titre ne correspond pas.</p>
            )}
          </div>
        ) : null}

        <div className="mt-10 flex flex-col gap-3">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-rose-600 text-sm font-bold text-white shadow-lg shadow-rose-600/25 transition-all hover:bg-rose-700 active:scale-[0.98]"
                disabled={isDeleting}
              >
                Continuer la suppression
              </button>
              <button
                type="button"
                ref={firstBtnRef}
                onClick={() => !isDeleting && onClose()}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200 active:scale-[0.98] dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                disabled={isDeleting}
              >
                Annuler
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => void handleFinalDelete()}
                disabled={!titleMatches || isDeleting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 text-sm font-bold text-white shadow-lg shadow-rose-600/25 transition-all hover:bg-rose-700 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Suppression…
                  </>
                ) : (
                  'Confirmer la suppression'
                )}
              </button>
              <button
                type="button"
                ref={firstBtnRef}
                onClick={() => !isDeleting && setStep(1)}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200 active:scale-[0.98] dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                disabled={isDeleting}
              >
                Retour
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
