import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Pencil,
  Megaphone,
  Archive,
  BarChart3,
  PieChart,
  Users,
} from 'lucide-react'
import { getAdminErrorMessage } from '../modules/admin-dashboard/api'
import { useAdminAuthStore } from '../modules/admin-dashboard/auth-store'
import {
  useAdminScrutinsQuery,
  useArchiveElectionMutation,
  useCandidateListsQuery,
  useCreateCandidateListMutation,
  useDeactivateCandidateListMutation,
  useElectionParticipationQuery,
  useElectionResultsAdminQuery,
  usePublishElectionResultsMutation,
  useUpdateElectionMutation,
} from '../modules/admin-dashboard/hooks'
import { canPublishResults, canWriteCandidateList, canWriteElection } from '../modules/admin-dashboard/permissions'
import type { ScrutinStatus } from '../modules/admin-dashboard/types'
import { ADMIN_PRIVATE_PATH } from '../shared/constants/routes'
import { electionStatusLabelFr } from '../shared/utils/election-status-fr'
import { isoToDatetimeLocalValue, toIsoFromDatetimeLocal } from '../shared/utils/datetime-local'

function statusBadgeClass(status: string) {
  const s = status.toUpperCase()
  if (s === 'OPEN') return 'bg-emerald-50 text-emerald-900 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/25'
  if (s === 'DRAFT') return 'bg-slate-100 text-slate-800 ring-slate-200 dark:bg-slate-500/15 dark:text-slate-200 dark:ring-slate-500/25'
  if (s === 'SCHEDULED') return 'bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-100 dark:ring-amber-500/25'
  if (s === 'CLOSED') return 'bg-blue-50 text-blue-900 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-100 dark:ring-blue-500/25'
  if (s === 'ARCHIVED') return 'bg-slate-100 text-slate-700 ring-slate-300 dark:bg-slate-600/20 dark:text-slate-300 dark:ring-slate-500/20'
  return 'bg-slate-100 text-slate-800 ring-slate-200'
}

const statusOptions: { value: ScrutinStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Brouillon' },
  { value: 'SCHEDULED', label: 'Planifié' },
  { value: 'OPEN', label: 'Ouvert' },
  { value: 'CLOSED', label: 'Clôturé' },
  { value: 'ARCHIVED', label: 'Archivé' },
]

export function AdminElectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const admin = useAdminAuthStore((s) => s.admin)

  const scrutinsQuery = useAdminScrutinsQuery()
  const election = useMemo(
    () => scrutinsQuery.data?.find((s) => s.id === id),
    [scrutinsQuery.data, id],
  )

  const participationQuery = useElectionParticipationQuery(id)
  const resultsAllowed = Boolean(election && ['CLOSED', 'ARCHIVED'].includes(election.status.toUpperCase()))
  const resultsQuery = useElectionResultsAdminQuery(id, resultsAllowed)
  const listsQuery = useCandidateListsQuery(id)

  const updateMutation = useUpdateElectionMutation(id ?? '')
  const archiveMutation = useArchiveElectionMutation()
  const publishMutation = usePublishElectionResultsMutation()
  const createListMutation = useCreateCandidateListMutation(id ?? '')
  const deactivateListMutation = useDeactivateCandidateListMutation(id ?? '')

  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [status, setStatus] = useState<ScrutinStatus>('DRAFT')
  const [formError, setFormError] = useState<string | null>(null)

  const [newListName, setNewListName] = useState('')
  const [newListOrder, setNewListOrder] = useState(1)
  const [newListSlogan, setNewListSlogan] = useState('')
  const [listError, setListError] = useState<string | null>(null)

  useEffect(() => {
    if (!election) return
    setTitle(election.title)
    setDescription(election.description ?? '')
    setStartsAt(isoToDatetimeLocalValue(election.startsAt))
    setEndsAt(isoToDatetimeLocalValue(election.endsAt))
    setStatus(election.status.toUpperCase() as ScrutinStatus)
  }, [election])

  const canWrite = canWriteElection(admin)
  const canPublish = canPublishResults(admin)
  const canListWrite = canWriteCandidateList(admin)

  const canPublishNow =
    canPublish &&
    election &&
    ['CLOSED', 'ARCHIVED'].includes(election.status.toUpperCase()) &&
    !election.resultsPublishedAt

  async function onSaveElection(e: FormEvent) {
    e.preventDefault()
    if (!election || !id) return
    setFormError(null)
    try {
      const startsIso = toIsoFromDatetimeLocal(startsAt)
      const endsIso = toIsoFromDatetimeLocal(endsAt)
      if (new Date(endsIso) <= new Date(startsIso)) {
        setFormError('La date de fin doit être après la date de début.')
        return
      }
      await updateMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        startsAt: startsIso,
        endsAt: endsIso,
        status,
      })
      setEditing(false)
    } catch (err) {
      setFormError(getAdminErrorMessage(err, 'Enregistrement impossible.'))
    }
  }

  async function onArchive() {
    if (!election || !id) return
    if (
      !window.confirm(
        'Archiver cette élection ? Elle passera au statut Archivé. Les données de vote sont conservées.',
      )
    ) {
      return
    }
    try {
      await archiveMutation.mutateAsync(id)
      navigate(`${ADMIN_PRIVATE_PATH}/scrutins`)
    } catch (err) {
      alert(getAdminErrorMessage(err, 'Archivage impossible.'))
    }
  }

  async function onPublish() {
    if (!id) return
    if (!window.confirm('Publier officiellement les résultats pour les étudiants et le grand public ?')) return
    try {
      await publishMutation.mutateAsync(id)
    } catch (err) {
      alert(getAdminErrorMessage(err, 'Publication impossible.'))
    }
  }

  async function onAddList(e: FormEvent) {
    e.preventDefault()
    if (!id) return
    setListError(null)
    if (!newListName.trim() || newListName.trim().length < 2) {
      setListError('Nom de liste trop court.')
      return
    }
    try {
      await createListMutation.mutateAsync({
        scrutinId: id,
        name: newListName.trim(),
        order: newListOrder,
        slogan: newListSlogan.trim() || undefined,
      })
      setNewListName('')
      setNewListSlogan('')
      setNewListOrder((o) => o + 1)
    } catch (err) {
      setListError(getAdminErrorMessage(err, 'Création de liste impossible.'))
    }
  }

  async function onDeactivateList(listId: string) {
    if (!window.confirm('Désactiver cette liste candidate ? Elle ne sera plus proposée au vote.')) return
    try {
      await deactivateListMutation.mutateAsync(listId)
    } catch (err) {
      alert(getAdminErrorMessage(err, 'Mise à jour impossible.'))
    }
  }

  if (scrutinsQuery.isLoading || !id) {
    return (
      <div className="flex min-h-[40dvh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-sm text-slate-600 dark:text-slate-400">Chargement...</p>
      </div>
    )
  }

  if (scrutinsQuery.isError || !election) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-8 text-sm text-rose-900 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-100">
        <p>Élection introuvable ou liste non à jour.</p>
        <Link to={`${ADMIN_PRIVATE_PATH}/scrutins`} className="mt-4 inline-block font-medium text-blue-600 dark:text-blue-400">
          Retour aux élections
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-12">
      <header className="border-b border-slate-200/90 pb-8 dark:border-white/[0.06]">
        <Link
          to={`${ADMIN_PRIVATE_PATH}/scrutins`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" strokeWidth={1.25} />
          Retour aux élections
        </Link>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Détail</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-4xl">
              {election.title}
            </h1>
            <span
              className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusBadgeClass(election.status)}`}
            >
              {electionStatusLabelFr(election.status)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {canWrite && (
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
              >
                <Pencil className="size-3.5" strokeWidth={1.25} />
                {editing ? 'Fermer' : 'Modifier'}
              </button>
            )}
            {canWrite && (
              <button
                type="button"
                onClick={onArchive}
                disabled={archiveMutation.isPending}
                className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-medium text-rose-800 hover:bg-rose-100 disabled:opacity-60 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100 dark:hover:bg-rose-500/20"
              >
                <Archive className="size-3.5" strokeWidth={1.25} />
                Archiver
              </button>
            )}
            {canPublishNow && (
              <button
                type="button"
                onClick={onPublish}
                disabled={publishMutation.isPending}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                <Megaphone className="size-3.5" strokeWidth={1.25} />
                Publier les résultats
              </button>
            )}
          </div>
        </div>
        {election.resultsPublishedAt && (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            Résultats publiés le {new Date(election.resultsPublishedAt).toLocaleString('fr-FR')}.
          </p>
        )}
      </header>

      {editing && canWrite && (
        <form
          onSubmit={onSaveElection}
          className="space-y-4 rounded-[2rem] border border-slate-200/90 bg-white p-6 dark:border-white/[0.06] dark:bg-slate-950/40"
        >
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Modifier l&apos;élection</h2>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-slate-500">Titre</label>
            <input
              value={title}
              onChange={(ev) => setTitle(ev.target.value)}
              className="min-h-11 w-full max-w-xl rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-white/[0.1] dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-slate-500">Description</label>
            <textarea
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
              rows={3}
              className="w-full max-w-xl rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-white/[0.1] dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase text-slate-500">Début</label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(ev) => setStartsAt(ev.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-white/[0.1] dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase text-slate-500">Fin</label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(ev) => setEndsAt(ev.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-white/[0.1] dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase text-slate-500">Statut</label>
            <select
              value={status}
              onChange={(ev) => setStatus(ev.target.value as ScrutinStatus)}
              className="min-h-11 w-full max-w-sm rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-white/[0.1] dark:bg-slate-900 dark:text-slate-100"
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          {formError ? (
            <p className="text-sm text-rose-600 dark:text-rose-300">{formError}</p>
          ) : null}
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      )}

      {!editing && election.description && (
        <p className="max-w-[72ch] text-sm leading-relaxed text-slate-600 dark:text-slate-400">{election.description}</p>
      )}

      {/* Participation */}
      <section className="rounded-[2rem] border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.06] dark:bg-slate-950/35 dark:shadow-none">
        <div className="mb-4 flex items-center gap-2">
          <Users className="size-5 text-blue-600 dark:text-blue-400" strokeWidth={1.25} />
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Participation</h2>
        </div>
        {participationQuery.isLoading ? (
          <Loader2 className="size-6 animate-spin text-slate-400" />
        ) : participationQuery.isError ? (
          <p className="text-sm text-rose-600 dark:text-rose-300">Impossible de charger les statistiques.</p>
        ) : participationQuery.data ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Éligibles" value={participationQuery.data.eligibleStudents} />
            <StatCard label="Participants (OTP)" value={participationQuery.data.participants} />
            <StatCard label="Ont voté" value={participationQuery.data.voters} />
            <StatCard label="Taux participation" value={`${participationQuery.data.participationRate} %`} />
          </div>
        ) : null}
      </section>

      {/* Résultats agrégés */}
      {resultsAllowed && (
        <section className="rounded-[2rem] border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.06] dark:bg-slate-950/35 dark:shadow-none">
          <div className="mb-4 flex items-center gap-2">
            <PieChart className="size-5 text-blue-600 dark:text-blue-400" strokeWidth={1.25} />
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Résultats agrégés</h2>
          </div>
          {resultsQuery.isLoading ? (
            <Loader2 className="size-6 animate-spin text-slate-400" />
          ) : resultsQuery.isError ? (
            <p className="text-sm text-rose-600 dark:text-rose-300">
              {resultsQuery.error ? getAdminErrorMessage(resultsQuery.error, 'Résultats indisponibles.') : 'Erreur.'}
            </p>
          ) : resultsQuery.data ? (
            <div className="overflow-x-auto">
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                Total bulletins enregistrés :{' '}
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{resultsQuery.data.totalVotes}</span>
              </p>
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-white/[0.06]">
                    <th className="py-2 pr-4">Liste</th>
                    <th className="py-2 pr-4">Voix</th>
                    <th className="py-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsQuery.data.results.map((row) => (
                    <tr key={row.candidateListId} className="border-b border-slate-100 dark:border-white/[0.04]">
                      <td className="py-3 font-medium text-slate-900 dark:text-slate-100">{row.name}</td>
                      <td className="py-3 font-mono tabular-nums">{row.votes}</td>
                      <td className="py-3 font-mono tabular-nums">{row.percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      )}

      {/* Listes candidates */}
      <section className="rounded-[2rem] border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.06] dark:bg-slate-950/35 dark:shadow-none">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="size-5 text-blue-600 dark:text-blue-400" strokeWidth={1.25} />
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Listes candidates</h2>
        </div>

        {listsQuery.isLoading ? (
          <Loader2 className="size-6 animate-spin text-slate-400" />
        ) : listsQuery.isError ? (
          <p className="text-sm text-rose-600">Liste indisponible.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-white/[0.06]">
                    <th className="py-2 text-left">Nom</th>
                    <th className="py-2 text-left">Ordre</th>
                    <th className="py-2 text-left">Active</th>
                    {canListWrite ? <th className="py-2 text-right">Actions</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {(listsQuery.data ?? []).map((row) => (
                    <tr key={row.id} className="border-b border-slate-100 dark:border-white/[0.04]">
                      <td className="py-3 font-medium text-slate-900 dark:text-slate-100">{row.name}</td>
                      <td className="py-3 font-mono">{row.order}</td>
                      <td className="py-3">{row.isActive ? 'Oui' : 'Non'}</td>
                      {canListWrite ? (
                        <td className="py-3 text-right">
                          {row.isActive ? (
                            <button
                              type="button"
                              onClick={() => onDeactivateList(row.id)}
                              className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
                            >
                              <Trash2 className="size-3.5" />
                              Désactiver
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {canListWrite && (
              <form onSubmit={onAddList} className="mt-8 space-y-3 rounded-xl border border-dashed border-slate-200 p-4 dark:border-white/[0.08]">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Ajouter une liste</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                  <div className="min-w-[160px] flex-1">
                    <label className="mb-1 block text-xs text-slate-500">Nom</label>
                    <input
                      value={newListName}
                      onChange={(ev) => setNewListName(ev.target.value)}
                      className="min-h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/[0.1] dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="w-24">
                    <label className="mb-1 block text-xs text-slate-500">Ordre</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={newListOrder}
                      onChange={(ev) => setNewListOrder(Number(ev.target.value) || 1)}
                      className="min-h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/[0.1] dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="min-w-[200px] flex-1">
                    <label className="mb-1 block text-xs text-slate-500">Slogan (optionnel)</label>
                    <input
                      value={newListSlogan}
                      onChange={(ev) => setNewListSlogan(ev.target.value)}
                      className="min-h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/[0.1] dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={createListMutation.isPending}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    <Plus className="size-4" />
                    Ajouter
                  </button>
                </div>
                {listError ? <p className="text-sm text-rose-600">{listError}</p> : null}
              </form>
            )}
          </>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-white/[0.06] dark:bg-slate-900/40">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-slate-950 dark:text-white">{value}</p>
    </div>
  )
}
