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
  Video,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { getAdminErrorMessage } from '../modules/admin-dashboard/api'
import { useAdminAuthStore } from '../modules/admin-dashboard/auth-store'
import { useToastStore } from '../shared/ui/toast-store'
import { ConfirmModal } from '../shared/ui/confirm-modal'
import {
  useAdminScrutinsQuery,
  useArchiveElectionMutation,
  useCandidateListsQuery,
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



function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 dark:border-white/[0.06] dark:bg-slate-900/40 md:rounded-2xl md:px-4 md:py-3">
      <p className="text-[9px] uppercase tracking-wide text-slate-500 md:text-[10px]">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-slate-950 dark:text-white md:text-xl">{value}</p>
    </div>
  )
}

export function AdminElectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const admin = useAdminAuthStore((s) => s.admin)
  const pushToast = useToastStore((s) => s.pushToast)

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
  const deactivateListMutation = useDeactivateCandidateListMutation(id ?? '')

  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [status, setStatus] = useState<ScrutinStatus>('DRAFT')
  const [formError, setFormError] = useState<string | null>(null)
  const [candidateListPage, setCandidateListPage] = useState(1)
  const CANDIDATE_LIST_PAGE_SIZE = 5

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmLabel?: string
    variant?: 'danger' | 'primary'
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })



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

  const activeLists = useMemo(
    () => (listsQuery.data ?? []).filter((l) => l.isActive),
    [listsQuery.data],
  )

  const totalCandidateListPages = Math.max(1, Math.ceil(activeLists.length / CANDIDATE_LIST_PAGE_SIZE))
  const paginatedCandidateLists = useMemo(() => {
    const start = (candidateListPage - 1) * CANDIDATE_LIST_PAGE_SIZE
    return activeLists.slice(start, start + CANDIDATE_LIST_PAGE_SIZE)
  }, [activeLists, candidateListPage])

  useEffect(() => {
    if (candidateListPage > totalCandidateListPages) {
      setCandidateListPage(totalCandidateListPages)
    }
  }, [totalCandidateListPages, candidateListPage])

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
      pushToast('Modification enregistrée.', 'success')
      setEditing(false)
    } catch (err) {
      setFormError(getAdminErrorMessage(err, 'Enregistrement impossible.'))
    }
  }

  async function onArchive() {
    if (!election || !id) return
    setConfirmModal({
      isOpen: true,
      title: 'Archiver l\'élection',
      message: 'Voulez-vous vraiment archiver cette élection ? Elle passera au statut Archivé.',
      confirmLabel: 'Archiver',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await archiveMutation.mutateAsync(id)
          pushToast('Élection archivée.', 'success')
          navigate(`${ADMIN_PRIVATE_PATH}/scrutins`)
        } catch (err) {
          pushToast(getAdminErrorMessage(err, 'Archivage impossible.'), 'error')
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }))
        }
      },
    })
  }

  async function onPublish() {
    if (!id) return
    setConfirmModal({
      isOpen: true,
      title: 'Publier les résultats',
      message: 'Voulez-vous vraiment publier officiellement les résultats ? Cette action est irréversible.',
      confirmLabel: 'Publier',
      onConfirm: async () => {
        try {
          await publishMutation.mutateAsync(id)
          pushToast('Résultats publiés avec succès.', 'success')
        } catch (err) {
          pushToast(getAdminErrorMessage(err, 'Publication impossible.'), 'error')
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }))
        }
      },
    })
  }

  async function onDeactivateList(listId: string) {
    setConfirmModal({
      isOpen: true,
      title: 'Désactiver la liste',
      message: 'Voulez-vous vraiment désactiver cette liste candidate ? Elle ne sera plus proposée au vote.',
      confirmLabel: 'Désactiver',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deactivateListMutation.mutateAsync(listId)
          pushToast('Liste désactivée avec succès.', 'success')
        } catch (err) {
          pushToast(getAdminErrorMessage(err, 'Mise à jour impossible.'), 'error')
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }))
        }
      },
    })
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
    <div className="max-w-full pb-12 overflow-x-hidden">
      <div className="space-y-6 md:space-y-10">
        <header className="border-b border-slate-200/90 pb-6 dark:border-white/[0.06] md:pb-8">
        <Link
          to={`${ADMIN_PRIVATE_PATH}/scrutins`}
          className="mb-4 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="size-3" strokeWidth={2} />
          Retour
        </Link>
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">Détails de l'élection</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">
                {election.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${statusBadgeClass(election.status)}`}
                >
                  {electionStatusLabelFr(election.status)}
                </span>
                {election.resultsPublishedAt && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-400 dark:ring-white/10">
                    Résultats publiés
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {canWrite && (
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-95 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] md:h-10 md:px-5"
              >
                <Pencil className="size-3.5" strokeWidth={1.5} />
                {editing ? 'Fermer' : 'Modifier'}
              </button>
            )}
            {canWrite && (
              <button
                type="button"
                onClick={onArchive}
                disabled={archiveMutation.isPending}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-xs font-bold text-rose-800 transition hover:bg-rose-100 active:scale-95 disabled:opacity-60 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100 dark:hover:bg-rose-500/20 md:h-10 md:px-5"
              >
                <Archive className="size-3.5" strokeWidth={1.5} />
                Archiver
              </button>
            )}
            {canPublishNow && (
              <button
                type="button"
                onClick={onPublish}
                disabled={publishMutation.isPending}
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95 disabled:opacity-60 md:h-10 md:px-5"
              >
                <Megaphone className="size-3.5" strokeWidth={1.5} />
                Publier
              </button>
            )}
          </div>
        </div>
      </header>

      {editing && canWrite ? (
        <form
          onSubmit={onSaveElection}
          className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 dark:border-white/[0.08] dark:bg-slate-900 dark:shadow-none md:rounded-[2.5rem] md:p-10"
        >
          <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Titre</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-medium outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Statut</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ScrutinStatus)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-base font-medium outline-none focus:border-blue-500 dark:border-white/10 dark:bg-slate-900"
                >
                  <option value="DRAFT">Brouillon</option>
                  <option value="SCHEDULED">Planifié</option>
                  <option value="OPEN">Ouvert</option>
                  <option value="CLOSED">Clôturé</option>
                  <option value="ARCHIVED">Archivé</option>
                </select>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-4 text-base font-medium outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Début</label>
                <input
                  type="datetime-local"
                  required
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-medium outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Fin</label>
                <input
                  type="datetime-local"
                  required
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-medium outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-slate-900"
                />
              </div>
            </div>

            {formError && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20">
                {formError}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="h-11 rounded-xl bg-slate-100 px-8 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 md:h-12 md:rounded-2xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="h-11 rounded-xl bg-blue-600 px-8 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95 disabled:opacity-50 md:h-12 md:rounded-2xl"
              >
                {updateMutation.isPending ? 'Enregistrement...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-slate-900 md:rounded-[2.5rem] md:p-10">
          <h2 className="mb-4 text-lg font-bold tracking-tight text-slate-950 dark:text-white md:mb-6 md:text-xl">À propos de l'élection</h2>
          <div className="prose prose-slate max-w-none dark:prose-invert">
            {election.description ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-400 md:text-base">{election.description}</p>
            ) : (
              <p className="text-sm italic text-slate-400 md:text-base">Aucune description fournie pour cette élection.</p>
            )}
          </div>
        </div>
      )}

      {/* Participation */}
      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200/90 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-slate-950/35 dark:shadow-none md:rounded-[2rem] md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-blue-600/10 p-2 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
            <Users className="size-5" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">Participation</h2>
        </div>
        {participationQuery.isLoading ? (
          <div className="flex h-20 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-blue-600" />
          </div>
        ) : participationQuery.isError ? (
          <p className="text-xs text-rose-600 dark:text-rose-300 md:text-sm">Impossible de charger les statistiques.</p>
        ) : participationQuery.data ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Éligibles" value={participationQuery.data.eligibleStudents} />
            <StatCard label="Participants" value={participationQuery.data.participants} />
            <StatCard label="Ont voté" value={participationQuery.data.voters} />
            <StatCard label="Taux" value={`${participationQuery.data.participationRate} %`} />
          </div>
        ) : null}
      </section>

      {/* Résultats agrégés */}
      {resultsAllowed && (
        <section className="overflow-hidden rounded-[1.5rem] border border-slate-200/90 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-slate-950/35 dark:shadow-none md:rounded-[2rem] md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-blue-600/10 p-2 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
              <PieChart className="size-5" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">Résultats agrégés</h2>
          </div>
          {resultsQuery.isLoading ? (
            <div className="flex h-20 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-blue-600" />
            </div>
          ) : resultsQuery.isError ? (
            <p className="text-xs text-rose-600 dark:text-rose-300 md:text-sm">
              {resultsQuery.error ? getAdminErrorMessage(resultsQuery.error, 'Résultats indisponibles.') : 'Erreur.'}
            </p>
          ) : resultsQuery.data ? (
            <div className="w-full">
              <p className="mb-6 inline-flex items-center rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-400 dark:ring-white/10">
                Total : {resultsQuery.data.totalVotes} bulletins
              </p>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[320px] text-left text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-400 dark:border-white/[0.06]">
                      <th className="pb-4 font-bold">Liste</th>
                      <th className="pb-4 font-bold">Voix</th>
                      <th className="pb-4 font-bold">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultsQuery.data.results.map((row) => (
                      <tr key={row.candidateListId} className="border-b border-slate-50 transition hover:bg-slate-50/50 dark:border-white/[0.02] dark:hover:bg-white/[0.02]">
                        <td className="py-4 font-bold text-slate-900 dark:text-slate-100">{row.name}</td>
                        <td className="py-4 font-mono tabular-nums text-slate-600 dark:text-slate-400">{row.votes}</td>
                        <td className="py-4 font-mono tabular-nums font-bold text-blue-600 dark:text-blue-400">{row.percentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>
      )}

      {/* Listes candidates */}
      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200/90 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-slate-950/35 dark:shadow-none md:rounded-[2rem] md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-600/10 p-2 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
              <BarChart3 className="size-5" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">Listes candidates</h2>
          </div>
          {canListWrite && (
            <Link
              to={`${ADMIN_PRIVATE_PATH}/scrutins/${id}/listes/nouveau`}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95 md:h-10 md:px-5"
            >
              <Plus className="size-3.5" />
              Nouvelle liste
            </Link>
          )}
        </div>

        {listsQuery.isLoading ? (
          <div className="flex h-20 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-blue-600" />
          </div>
        ) : listsQuery.isError ? (
          <p className="text-xs text-rose-600 md:text-sm">Liste indisponible.</p>
        ) : (
          <div className="space-y-10">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full min-w-[580px] text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-400 dark:border-white/[0.06]">
                    <th className="pb-4 text-left w-10 font-bold">#</th>
                    <th className="pb-4 text-left font-bold">Informations</th>
                    <th className="pb-4 text-left w-20 font-bold">Média</th>
                    <th className="pb-4 text-left w-20 font-bold">Statut</th>
                    {canListWrite ? <th className="pb-4 text-right w-20 font-bold">Actions</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {paginatedCandidateLists.map((row) => (
                    <tr
                      key={row.id}
                      className="group border-b border-slate-50 transition last:border-0 hover:bg-slate-50/50 dark:border-white/[0.02] dark:hover:bg-white/[0.02]"
                    >
                      <td className="py-5 pr-3 text-sm font-bold text-slate-400">{row.order}</td>
                      <td className="py-5 px-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-slate-950 dark:text-white">
                            {row.name}
                          </span>
                          {row.slogan && (
                            <span className="text-xs italic text-slate-500">« {row.slogan} »</span>
                          )}
                          {row.members && row.members.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {row.members.map((m, i) => (
                                <span
                                  key={i}
                                  className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:bg-white/5 dark:text-slate-400"
                                >
                                  {m.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-3">
                        <div className="flex flex-col gap-1.5">
                          {row.videoUrl ? (
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                              <Video className="size-3" />
                              Vidéo
                            </div>
                          ) : null}
                          {row.imageUrl ? (
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
                              <ImageIcon className="size-3" />
                              Image
                            </div>
                          ) : null}
                          {!row.videoUrl && !row.imageUrl && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                              Aucun
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-3">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
                          Active
                        </span>
                      </td>
                      {canListWrite ? (
                        <td className="py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`${ADMIN_PRIVATE_PATH}/scrutins/${id}/listes/${row.id}/modifier`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-blue-400"
                              title="Modifier la liste"
                            >
                              <Pencil className="size-3.5" strokeWidth={2} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => onDeactivateList(row.id)}
                              disabled={deactivateListMutation.isPending}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50 px-2.5 text-[10px] font-bold uppercase tracking-widest text-rose-600 transition hover:bg-rose-100 hover:text-rose-700 active:scale-95 disabled:opacity-50 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                              title="Supprimer la liste"
                            >
                              {deactivateListMutation.isPending &&
                              deactivateListMutation.variables === row.id ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="size-3.5" strokeWidth={2} />
                              )}
                              <span className="hidden sm:inline">Supprimer</span>
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {activeLists.length > CANDIDATE_LIST_PAGE_SIZE && (
              <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Affichage{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {(candidateListPage - 1) * CANDIDATE_LIST_PAGE_SIZE + 1}–
                    {Math.min(candidateListPage * CANDIDATE_LIST_PAGE_SIZE, activeLists.length)}
                  </span>{' '}
                  sur <span className="font-semibold text-slate-900 dark:text-white">{activeLists.length}</span> listes
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCandidateListPage((p) => Math.max(1, p - 1))}
                    disabled={candidateListPage === 1}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    <ChevronLeft className="size-3.5" strokeWidth={2.5} />
                    Précédent
                  </button>
                  <span className="min-w-[80px] text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Page {candidateListPage} / {totalCandidateListPages}
                  </span>
                  <button
                    onClick={() => setCandidateListPage((p) => Math.min(totalCandidateListPages, p + 1))}
                    disabled={candidateListPage === totalCandidateListPages}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    Suivant
                    <ChevronRight className="size-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        variant={confirmModal.variant}
        isLoading={deactivateListMutation.isPending || archiveMutation.isPending || publishMutation.isPending}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
