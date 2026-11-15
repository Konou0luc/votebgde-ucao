import { useEffect, useMemo, useState } from 'react'
import { Eye, Pencil, Plus, Search, Trash2, ChartPie } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAdminScrutinsQuery, useArchiveElectionMutation } from '../modules/admin-dashboard/hooks'
import { useAdminAuthStore } from '../modules/admin-dashboard/auth-store'
import { getAdminErrorMessage } from '../modules/admin-dashboard/api'
import { canWriteElection } from '../modules/admin-dashboard/permissions'
import type { ScrutinRecord } from '../modules/admin-dashboard/types'
import { ADMIN_PRIVATE_PATH } from '../shared/constants/routes'
import { AdminElectionDeleteModal } from '../shared/ui/admin-election-delete-modal'
import { useToastStore } from '../shared/ui/toast-store'
import { electionStatusLabelFr } from '../shared/utils/election-status-fr'
import {
  AdminButtonLink,
  EmptyState,
  ErrorState,
  IconButton,
  IconLink,
  LoadingState,
  PageHeader,
  Pagination,
  Panel,
  StatusBadge,
} from '../shared/ui/admin-ui'
import { adminInput, formatDateTime, table, tableWrap, td, th, trClickable } from '../shared/ui/admin-ui-classes'

const STATUS_FILTERS = ['ALL', 'OPEN', 'SCHEDULED', 'DRAFT', 'CLOSED', 'ARCHIVED'] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]

const PAGE_SIZE = 10

export function AdminScrutinsPage() {
  const scrutinsQuery = useAdminScrutinsQuery()
  const archiveElection = useArchiveElectionMutation()
  const pushToast = useToastStore((s) => s.pushToast)
  const admin = useAdminAuthStore((s) => s.admin)
  const canCreate = canWriteElection(admin)
  const canMutate = canWriteElection(admin)

  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<ScrutinRecord | null>(null)

  async function handleConfirmDeleteElection() {
    if (!deleteTarget) return
    try {
      await archiveElection.mutateAsync(deleteTarget.id)
      pushToast('Élection supprimée avec succès.', 'success')
      setDeleteTarget(null)
    } catch (err) {
      pushToast(getAdminErrorMessage(err, 'La suppression a échoué.'), 'error')
    }
  }

  const filteredRows = useMemo(() => {
    const all = scrutinsQuery.data ?? []
    const rows = statusFilter === 'ALL' ? all : all.filter((r) => r.status.toUpperCase() === statusFilter)
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => {
      const title = row.title.toLowerCase()
      const statusFr = electionStatusLabelFr(row.status).toLowerCase()
      const statusRaw = row.status.toLowerCase()
      const desc = (row.description ?? '').toLowerCase()
      const start = new Date(row.startsAt).toLocaleString('fr-FR').toLowerCase()
      const end = new Date(row.endsAt).toLocaleString('fr-FR').toLowerCase()
      return (
        title.includes(q) ||
        statusFr.includes(q) ||
        statusRaw.includes(q) ||
        desc.includes(q) ||
        start.includes(q) ||
        end.includes(q)
      )
    })
  }, [scrutinsQuery.data, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const rangeStart = filteredRows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = filteredRows.length === 0 ? 0 : Math.min(safePage * PAGE_SIZE, filteredRows.length)
  const pageRows = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const hasRemoteData = Boolean(scrutinsQuery.data?.length)

  useEffect(() => {
    setPage(1)
  }, [search])

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages, filteredRows.length])

  const counts = (scrutinsQuery.data ?? []).reduce<Record<string, number>>((acc, r) => {
    const k = r.status.toUpperCase()
    acc[k] = (acc[k] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="pb-12">
      <AdminElectionDeleteModal
        election={deleteTarget}
        isDeleting={archiveElection.isPending}
        onClose={() => !archiveElection.isPending && setDeleteTarget(null)}
        onConfirmDelete={handleConfirmDeleteElection}
      />

      <PageHeader
        title="Élections"
        description="Toutes les élections : dates, statut et publication des résultats."
        actions={
          canCreate && (
            <AdminButtonLink to={`${ADMIN_PRIVATE_PATH}/scrutins/nouveau`} variant="primary" icon={Plus}>
              Nouvelle élection
            </AdminButtonLink>
          )
        }
      />

      {scrutinsQuery.isLoading ? (
        <LoadingState label="Chargement des élections…" />
      ) : scrutinsQuery.isError ? (
        <ErrorState>Erreur de chargement.</ErrorState>
      ) : !scrutinsQuery.data?.length ? (
        <Panel>
          <EmptyState
            icon={ChartPie}
            title="Aucune élection pour le moment"
            description={canCreate ? 'Créez une élection pour commencer.' : 'Contactez un administrateur.'}
            action={
              canCreate && (
                <AdminButtonLink to={`${ADMIN_PRIVATE_PATH}/scrutins/nouveau`} icon={Plus}>
                  Créer une élection
                </AdminButtonLink>
              )
            }
          />
        </Panel>
      ) : (
        <Panel
          bodyClassName="!py-0"
          title={
            <div className="-mb-px flex gap-1 overflow-x-auto" role="tablist" aria-label="Filtrer par statut">
              {STATUS_FILTERS.map((f) => {
                const count = f === 'ALL' ? scrutinsQuery.data!.length : (counts[f] ?? 0)
                const active = statusFilter === f
                return (
                  <button
                    key={f}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setStatusFilter(f)
                      setPage(1)
                    }}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[15px] font-medium transition-colors ${
                      active
                        ? 'bg-slate-900/[0.06] text-slate-950 dark:bg-white/[0.08] dark:text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {f === 'ALL' ? 'Toutes' : electionStatusLabelFr(f)}
                    <span className="rounded-md bg-slate-100 px-1.5 text-[13px] tabular-nums text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          }
          actions={
            <div className="relative w-full sm:w-64">
              <label htmlFor="election-search" className="sr-only">
                Rechercher
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
              <input
                id="election-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une élection…"
                autoComplete="off"
                className={`${adminInput} h-10 pl-9`}
              />
            </div>
          }
          footer={
            hasRemoteData && filteredRows.length > 0 ? (
              <Pagination
                page={safePage}
                totalPages={totalPages}
                onChange={(p) => setPage(Math.min(totalPages, Math.max(1, p)))}
                from={rangeStart}
                to={rangeEnd}
                total={filteredRows.length}
                unit={filteredRows.length > 1 ? 'élections' : 'élection'}
              />
            ) : undefined
          }
        >
          {pageRows.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Aucun résultat"
              description={search.trim() ? `Aucune élection ne correspond à « ${search.trim()} ».` : 'Aucune élection avec ce statut.'}
            />
          ) : (
            <div className={tableWrap}>
              <table className={`${table} min-w-[760px]`}>
                <thead>
                  <tr>
                    <th className={th}>Élection</th>
                    <th className={th}>Statut</th>
                    <th className={th}>Début</th>
                    <th className={th}>Fin</th>
                    <th className={th}>Résultats</th>
                    <th className={`${th} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row) => (
                    <tr
                      key={row.id}
                      className={trClickable}
                      onClick={() => navigate(`${ADMIN_PRIVATE_PATH}/scrutins/${row.id}`)}
                    >
                      <td className={td}>
                        <p className="max-w-[18rem] truncate font-medium text-slate-950 dark:text-white">{row.title}</p>
                        {row.description && <p className="max-w-[18rem] truncate text-[13px] text-slate-500">{row.description}</p>}
                      </td>
                      <td className={td}>
                        <StatusBadge status={row.status} />
                      </td>
                      <td className={`${td} whitespace-nowrap text-[13px] tabular-nums text-slate-500`}>{formatDateTime(row.startsAt)}</td>
                      <td className={`${td} whitespace-nowrap text-[13px] tabular-nums text-slate-500`}>{formatDateTime(row.endsAt)}</td>
                      <td className={`${td} whitespace-nowrap text-[13px]`}>
                        {row.resultsPublishedAt ? (
                          <span className="text-emerald-700 dark:text-emerald-400">Publiés · {formatDateTime(row.resultsPublishedAt)}</span>
                        ) : (
                          <span className="text-slate-400">Non publiés</span>
                        )}
                      </td>
                      <td className={`${td} text-right`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5">
                          <IconLink to={`${ADMIN_PRIVATE_PATH}/scrutins/${row.id}`} label={`Ouvrir ${row.title}`} icon={canMutate ? Pencil : Eye} />
                          {canMutate && (
                            <IconButton label={`Supprimer ${row.title}`} icon={Trash2} tone="danger" onClick={() => setDeleteTarget(row)} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}
    </div>
  )
}
