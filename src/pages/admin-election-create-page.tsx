import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarClock, FileText, Plus } from 'lucide-react'
import { AdminButton, AdminButtonLink, ErrorState, Field, FormError, PageHeader, Panel } from '../shared/ui/admin-ui'
import { adminInput, adminSelect, adminTextarea } from '../shared/ui/admin-ui-classes'
import { getAdminErrorMessage } from '../modules/admin-dashboard/api'
import { useCreateElectionMutation } from '../modules/admin-dashboard/hooks'
import { canWriteElection } from '../modules/admin-dashboard/permissions'
import { useAdminAuthStore } from '../modules/admin-dashboard/auth-store'
import { useToastStore } from '../shared/ui/toast-store'
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
  const pushToast = useToastStore((s) => s.pushToast)
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
      pushToast('Élection créée avec succès.', 'success')
      navigate(`${ADMIN_PRIVATE_PATH}/scrutins/${created.id}`, { replace: true })
    } catch (err) {
      setError(getAdminErrorMessage(err, 'Création impossible.'))
    }
  }

  if (!canWrite) {
    return (
      <ErrorState
        action={
          <AdminButtonLink to={`${ADMIN_PRIVATE_PATH}/scrutins`} size="sm">
            Retour à la liste
          </AdminButtonLink>
        }
      >
        Vous n&apos;avez pas la permission de créer une élection.
      </ErrorState>
    )
  }

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <PageHeader
        back={{ to: `${ADMIN_PRIVATE_PATH}/scrutins`, label: 'Élections' }}
        title="Nouvelle élection"
        description="Définissez l'intitulé, la période et le statut initial. Les dates sont en heure locale."
      />

      <form onSubmit={onSubmit} className="space-y-6">
        <Panel title="Informations générales" icon={FileText}>
          <div className="space-y-5">
            <Field label="Titre" htmlFor="ce-title" required hint={`${title.length}/180 caractères`}>
              <input
                id="ce-title"
                value={title}
                onChange={(ev) => setTitle(ev.target.value)}
                className={adminInput}
                placeholder="Ex : Élection BGDE 2027"
                maxLength={180}
                required
              />
            </Field>
            <Field label="Description" htmlFor="ce-desc" hint="Optionnel">
              <textarea
                id="ce-desc"
                value={description}
                onChange={(ev) => setDescription(ev.target.value)}
                rows={4}
                className={adminTextarea}
                maxLength={1500}
              />
            </Field>
            <Field label="Statut initial" htmlFor="ce-status" className="sm:max-w-xs">
              <select id="ce-status" value={status} onChange={(ev) => setStatus(ev.target.value as ScrutinStatus)} className={adminSelect}>
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Panel>

        <Panel title="Période de vote" icon={CalendarClock} delay={0.05}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Début" htmlFor="ce-start" required>
              <input id="ce-start" type="datetime-local" value={startsAt} onChange={(ev) => setStartsAt(ev.target.value)} className={adminInput} required />
            </Field>
            <Field label="Fin" htmlFor="ce-end" required>
              <input id="ce-end" type="datetime-local" value={endsAt} onChange={(ev) => setEndsAt(ev.target.value)} className={adminInput} required />
            </Field>
          </div>
        </Panel>

        {error ? <FormError>{error}</FormError> : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AdminButtonLink to={`${ADMIN_PRIVATE_PATH}/scrutins`} variant="ghost">
            Annuler
          </AdminButtonLink>
          <AdminButton type="submit" variant="primary" icon={Plus} loading={createMutation.isPending}>
            {createMutation.isPending ? 'Création…' : "Créer l'élection"}
          </AdminButton>
        </div>
      </form>
    </div>
  )
}
