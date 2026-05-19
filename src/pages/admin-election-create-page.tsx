import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { getAdminErrorMessage } from '../modules/admin-dashboard/api'
import { useCreateElectionMutation } from '../modules/admin-dashboard/hooks'
import { canWriteElection } from '../modules/admin-dashboard/permissions'
import { useAdminAuthStore } from '../modules/admin-dashboard/auth-store'
import type { ScrutinStatus } from '../modules/admin-dashboard/types'
import { ADMIN_PRIVATE_PATH } from '../shared/constants/routes'
import { toIsoFromDatetimeLocal } from '../shared/utils/datetime-local'

const statuses: { value: ScrutinStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'SCHEDULED', label: 'Planifié' },
  { value: 'OPEN', label: 'Ouvert' },
  { value: 'CLOSED', label: 'Clôturé' },
  { value: 'ARCHIVED', label: 'Archivé' },
]

export function AdminElectionCreatePage() {
  const navigate = useNavigate()
  const admin = useAdminAuthStore((s) => s.admin)
  const createMutation = useCreateElectionMutation()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [status, setStatus] = useState<ScrutinStatus>('DRAFT')
  const [error, setError] = useState<string | null>(null)

  const canWrite = canWriteElection(admin)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!title.trim() || title.trim().length < 3) {
      setError('Le titre doit contenir au moins 3 caractères.')
      return
    }
    if (!startsAt || !endsAt) {
      setError('Renseignez les dates de début et de fin.')
      return
    }
    try {
      const startsIso = toIsoFromDatetimeLocal(startsAt)
      const endsIso = toIsoFromDatetimeLocal(endsAt)
      if (new Date(endsIso) <= new Date(startsIso)) {
        setError('La date de fin doit être après la date de début.')
        return
      }
      const created = await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        startsAt: startsIso,
        endsAt: endsIso,
        status,
      })
      navigate(`${ADMIN_PRIVATE_PATH}/scrutins/${created.id}`, { replace: true })
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Création impossible.'))
    }
  }

  if (!canWrite) {
    return (
      <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-6 py-8 text-sm text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
        <p>Vous n&apos;avez pas la permission de créer une élection.</p>
        <Link to={`${ADMIN_PRIVATE_PATH}/scrutins`} className="mt-4 inline-block font-medium text-blue-600 underline dark:text-blue-400">
          Retour à la liste
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="border-b border-slate-200/90 pb-8 dark:border-white/[0.06]">
        <Link
          to={`${ADMIN_PRIVATE_PATH}/scrutins`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" strokeWidth={1.25} />
          Retour aux élections
        </Link>
        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Création</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-4xl">Nouvelle élection</h1>
        <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Définissez l&apos;intitulé, la période et le statut initial. Les dates sont en heure locale du navigateur.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="mx-auto max-w-xl space-y-5 rounded-[2rem] border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.06] dark:bg-slate-950/40 dark:shadow-none md:p-8"
      >
        <div>
          <label htmlFor="ce-title" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Titre
          </label>
          <input
            id="ce-title"
            value={title}
            onChange={(ev) => setTitle(ev.target.value)}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/[0.1] dark:bg-slate-900 dark:text-slate-100"
            maxLength={180}
            required
          />
        </div>
        <div>
          <label htmlFor="ce-desc" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Description (optionnel)
          </label>
          <textarea
            id="ce-desc"
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/[0.1] dark:bg-slate-900 dark:text-slate-100"
            maxLength={1500}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ce-start" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">
              Début
            </label>
            <input
              id="ce-start"
              type="datetime-local"
              value={startsAt}
              onChange={(ev) => setStartsAt(ev.target.value)}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/[0.1] dark:bg-slate-900 dark:text-slate-100"
              required
            />
          </div>
          <div>
            <label htmlFor="ce-end" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">
              Fin
            </label>
            <input
              id="ce-end"
              type="datetime-local"
              value={endsAt}
              onChange={(ev) => setEndsAt(ev.target.value)}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/[0.1] dark:bg-slate-900 dark:text-slate-100"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="ce-status" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Statut initial
          </label>
          <select
            id="ce-status"
            value={status}
            onChange={(ev) => setStatus(ev.target.value as ScrutinStatus)}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/[0.1] dark:bg-slate-900 dark:text-slate-100"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Création...
            </>
          ) : (
            "Créer l'élection"
          )}
        </button>
      </form>
    </div>
  )
}
