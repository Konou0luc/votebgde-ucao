import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Plus,
  Trash2,
  Pencil,
  Megaphone,
  Archive,
  PieChart,
  Users,
  Video,
  Image as ImageIcon,
  ListChecks,
  CalendarClock,
  FileText,
  Trophy,
  X,
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
import { isoToDatetimeLocalValue, toIsoFromDatetimeLocal } from '../shared/utils/datetime-local'
import {
  AdminButton,
  AdminButtonLink,
  Badge,
  EmptyState,
  ErrorState,
  Field,
  FormError,
  IconButton,
  IconLink,
  LoadingState,
  PageHeader,
  Pagination,
  Panel,
  ProgressBar,
  StatusBadge,
} from '../shared/ui/admin-ui'
import {
  adminInput,
  adminSelect,
  adminTextarea,
  formatDateTime,
  formatNumber,
  table,
  tableWrap,
  td,
  th,
  tr,
} from '../shared/ui/admin-ui-classes'

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
    return <LoadingState label="Chargement de l'élection…" />
  }

  if (scrutinsQuery.isError || !election) {
    return (
      <ErrorState
        action={
          <AdminButtonLink to={`${ADMIN_PRIVATE_PATH}/scrutins`} size="sm">
            Retour aux élections
          </AdminButtonLink>
        }
      >
        Élection introuvable ou liste non à jour.
      </ErrorState>
    )
  }

  const participation = participationQuery.data
  const rate = participation ? Number(participation.participationRate) || 0 : 0
  const sortedResults = resultsQuery.data ? [...resultsQuery.data.results].sort((a, b) => b.votes - a.votes) : []

  return (
    <div className="pb-12">
      <PageHeader
        back={{ to: `${ADMIN_PRIVATE_PATH}/scrutins`, label: 'Élections' }}
        title={election.title}
        meta={
          <>
            <StatusBadge status={election.status} />
            {election.resultsPublishedAt && (
              <Badge tone="success" icon={Megaphone}>
                Résultats publiés
              </Badge>
            )}
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-4 text-slate-400" strokeWidth={1.75} />
              {formatDateTime(election.startsAt)} → {formatDateTime(election.endsAt)}
            </span>
          </>
        }
        actions={
          <>
            {canPublishNow && (
              <AdminButton variant="primary" icon={Megaphone} onClick={onPublish} loading={publishMutation.isPending}>
                Publier les résultats
              </AdminButton>
            )}
            {canWrite && (
              <AdminButton icon={editing ? X : Pencil} onClick={() => setEditing((v) => !v)}>
                {editing ? 'Fermer' : 'Modifier'}
              </AdminButton>
            )}
            {canWrite && (
              <AdminButton variant="danger" icon={Archive} onClick={onArchive} disabled={archiveMutation.isPending}>
                Archiver
              </AdminButton>
            )}
          </>
        }
      />

      {editing && canWrite && (
        <Panel title="Modifier l'élection" icon={Pencil} className="mb-6">
          <form onSubmit={onSaveElection} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Titre" htmlFor="ed-title" required>
                <input id="ed-title" required value={title} onChange={(e) => setTitle(e.target.value)} className={adminInput} />
              </Field>
              <Field label="Statut" htmlFor="ed-status">
                <select
                  id="ed-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ScrutinStatus)}
                  className={adminSelect}
                >
                  <option value="DRAFT">Brouillon</option>
                  <option value="SCHEDULED">Planifié</option>
                  <option value="OPEN">Ouvert</option>
                  <option value="CLOSED">Clôturé</option>
                  <option value="ARCHIVED">Archivé</option>
                </select>
              </Field>
            </div>
            <Field label="Description" htmlFor="ed-desc">
              <textarea id="ed-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={adminTextarea} />
            </Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Début" htmlFor="ed-start" required>
                <input id="ed-start" type="datetime-local" required value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={adminInput} />
              </Field>
              <Field label="Fin" htmlFor="ed-end" required>
                <input id="ed-end" type="datetime-local" required value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className={adminInput} />
              </Field>
            </div>
            {formError && <FormError>{formError}</FormError>}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end dark:border-white/[0.06]">
              <AdminButton variant="ghost" onClick={() => setEditing(false)}>
                Annuler
              </AdminButton>
              <AdminButton type="submit" variant="primary" loading={updateMutation.isPending}>
                {updateMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
              </AdminButton>
            </div>
          </form>
        </Panel>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-6 xl:col-span-2">
          <Panel
            title="Listes candidates"
            description={`${activeLists.length} liste${activeLists.length > 1 ? 's' : ''} active${activeLists.length > 1 ? 's' : ''}`}
            icon={ListChecks}
            bodyClassName={activeLists.length ? '!py-0' : ''}
            actions={
              canListWrite && (
                <AdminButtonLink to={`${ADMIN_PRIVATE_PATH}/scrutins/${id}/listes/nouveau`} variant="primary" size="sm" icon={Plus}>
                  Nouvelle liste
                </AdminButtonLink>
              )
            }
            footer={
              activeLists.length > CANDIDATE_LIST_PAGE_SIZE ? (
                <Pagination
                  page={candidateListPage}
                  totalPages={totalCandidateListPages}
                  onChange={(p) => setCandidateListPage(Math.min(totalCandidateListPages, Math.max(1, p)))}
                  from={(candidateListPage - 1) * CANDIDATE_LIST_PAGE_SIZE + 1}
                  to={Math.min(candidateListPage * CANDIDATE_LIST_PAGE_SIZE, activeLists.length)}
                  total={activeLists.length}
                  unit="listes"
                />
              ) : undefined
            }
          >
            {listsQuery.isLoading ? (
              <LoadingState compact />
            ) : listsQuery.isError ? (
              <ErrorState>Liste indisponible.</ErrorState>
            ) : activeLists.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="Aucune liste candidate"
                description="Ajoutez les listes qui seront proposées aux étudiants."
                action={
                  canListWrite && (
                    <AdminButtonLink to={`${ADMIN_PRIVATE_PATH}/scrutins/${id}/listes/nouveau`} icon={Plus} size="sm">
                      Ajouter une liste
                    </AdminButtonLink>
                  )
                }
              />
            ) : (
              <div className={tableWrap}>
                <table className={table}>
                  <thead>
                    <tr>
                      <th className={`${th} w-12`}>N°</th>
                      <th className={th}>Liste</th>
                      <th className={th}>Médias</th>
                      {canListWrite ? <th className={`${th} w-24 text-right`}>Actions</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCandidateLists.map((row) => (
                      <tr key={row.id} className={tr}>
                        <td className={td}>
                          <span className="flex size-7 items-center justify-center rounded-md bg-slate-100 text-[13px] font-medium tabular-nums text-slate-600 dark:bg-white/[0.05] dark:text-slate-300">
                            {row.order}
                          </span>
                        </td>
                        <td className={td}>
                          <div className="flex items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-white/[0.05]">
                              {row.imageUrl ? (
                                <img src={row.imageUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <Users className="size-4 text-slate-400" strokeWidth={1.75} />
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-950 dark:text-white">{row.name}</p>
                              {row.slogan && <p className="truncate text-[13px] text-slate-500">« {row.slogan} »</p>}
                              {row.members && row.members.length > 0 && (
                                <p className="mt-0.5 truncate text-[13px] text-slate-400">
                                  {row.members.length} membre{row.members.length > 1 ? 's' : ''} ·{' '}
                                  {row.members
                                    .slice(0, 3)
                                    .map((m) => m.name)
                                    .join(', ')}
                                  {row.members.length > 3 ? '…' : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className={td}>
                          <div className="flex flex-wrap gap-1.5">
                            {row.videoUrl && (
                              <Badge tone="success" icon={Video}>
                                Vidéo
                              </Badge>
                            )}
                            {row.imageUrl && (
                              <Badge tone="brand" icon={ImageIcon}>
                                Image
                              </Badge>
                            )}
                            {!row.videoUrl && !row.imageUrl && <span className="text-[13px] text-slate-400">—</span>}
                          </div>
                        </td>
                        {canListWrite ? (
                          <td className={`${td} text-right`}>
                            <div className="flex items-center justify-end gap-0.5">
                              <IconLink
                                to={`${ADMIN_PRIVATE_PATH}/scrutins/${id}/listes/${row.id}/modifier`}
                                label="Modifier la liste"
                                icon={Pencil}
                              />
                              <IconButton
                                label="Supprimer la liste"
                                icon={Trash2}
                                tone="danger"
                                onClick={() => onDeactivateList(row.id)}
                                disabled={deactivateListMutation.isPending}
                              />
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          {resultsAllowed && (
            <Panel
              title="Résultats"
              icon={PieChart}
              delay={0.05}
              description={resultsQuery.data ? `${formatNumber(resultsQuery.data.totalVotes)} bulletins dépouillés` : undefined}
            >
              {resultsQuery.isLoading ? (
                <LoadingState compact />
              ) : resultsQuery.isError ? (
                <ErrorState>
                  {resultsQuery.error ? getAdminErrorMessage(resultsQuery.error, 'Résultats indisponibles.') : 'Erreur.'}
                </ErrorState>
              ) : sortedResults.length ? (
                <ol className="space-y-5">
                  {sortedResults.map((row, i) => (
                    <li key={row.candidateListId}>
                      <div className="mb-2 flex items-center justify-between gap-4 text-[15px]">
                        <span className="flex min-w-0 items-center gap-2.5">
                          {i === 0 ? (
                            <Trophy className="size-4 shrink-0 text-amber-500" strokeWidth={1.75} />
                          ) : (
                            <span className="w-4 shrink-0 text-center text-[13px] tabular-nums text-slate-400">{i + 1}</span>
                          )}
                          <span className="truncate font-medium text-slate-900 dark:text-white">{row.name}</span>
                        </span>
                        <span className="shrink-0 tabular-nums text-slate-500">
                          {formatNumber(row.votes)} voix ·{' '}
                          <span className="font-semibold text-slate-950 dark:text-white">{formatNumber(row.percentage, 1)} %</span>
                        </span>
                      </div>
                      <ProgressBar value={row.percentage} tone={i === 0 ? 'brand' : 'slate'} delay={0.1 + i * 0.05} />
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState icon={PieChart} title="Aucun vote enregistré" />
              )}
            </Panel>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          <Panel title="Participation" icon={Users} delay={0.05}>
            {participationQuery.isLoading ? (
              <LoadingState compact />
            ) : participationQuery.isError ? (
              <ErrorState>Impossible de charger les statistiques.</ErrorState>
            ) : participation ? (
              <div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[15px] text-slate-500 dark:text-slate-400">Taux de participation</p>
                    <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums text-slate-950 dark:text-white">
                      {formatNumber(rate, 1)}
                      <span className="ml-0.5 text-xl text-slate-400">%</span>
                    </p>
                  </div>
                </div>
                <ProgressBar value={rate} className="mt-4 !h-2" />
                <dl className="mt-6 grid grid-cols-3 divide-x divide-slate-100 rounded-lg border border-slate-100 dark:divide-white/[0.06] dark:border-white/[0.06]">
                  {[
                    { label: 'Éligibles', value: participation.eligibleStudents },
                    { label: 'Participants', value: participation.participants },
                    { label: 'Ont voté', value: participation.voters },
                  ].map((s) => (
                    <div key={s.label} className="px-3 py-3 text-center">
                      <dd className="text-lg font-semibold tabular-nums text-slate-950 dark:text-white">{formatNumber(s.value)}</dd>
                      <dt className="mt-0.5 text-[13px] text-slate-500">{s.label}</dt>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </Panel>

          <Panel title="Informations" icon={FileText} delay={0.1}>
            <p
              className={`whitespace-pre-wrap text-[15px] leading-relaxed ${
                election.description ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400'
              }`}
            >
              {election.description || 'Aucune description fournie pour cette élection.'}
            </p>
            <dl className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-[15px] dark:border-white/[0.06]">
              {[
                { label: 'Début', value: formatDateTime(election.startsAt) },
                { label: 'Fin', value: formatDateTime(election.endsAt) },
                ...(election.resultsPublishedAt
                  ? [{ label: 'Résultats publiés', value: formatDateTime(election.resultsPublishedAt) }]
                  : []),
                { label: 'Créée le', value: formatDateTime(election.createdAt) },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">{row.label}</dt>
                  <dd className="text-right font-medium tabular-nums text-slate-900 dark:text-white">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>
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
