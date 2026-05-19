import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAdminScrutinsQuery, useArchiveElectionMutation } from '../modules/admin-dashboard/hooks'
import { useAdminAuthStore } from '../modules/admin-dashboard/auth-store'
import { getAdminErrorMessage } from '../modules/admin-dashboard/api'
import { canWriteElection } from '../modules/admin-dashboard/permissions'
import type { ScrutinRecord } from '../modules/admin-dashboard/types'
import { ADMIN_PRIVATE_PATH } from '../shared/constants/routes'
import { AdminElectionDeleteModal } from '../shared/ui/admin-election-delete-modal'
import { useToastStore } from '../shared/ui/toast-store'
import { electionStatusLabelFr } from '../shared/utils/election-status-fr'

const ease = [0.32, 0.72, 0, 1] as const

const PAGE_SIZE = 10

function statusStyles(status: string) {
  const s = status.toUpperCase()
  if (s === 'OPEN')
    return 'bg-emerald-50 text-emerald-900 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/25'
  if (s === 'DRAFT')
    return 'bg-slate-100 text-slate-800 ring-slate-200 dark:bg-slate-500/15 dark:text-slate-200 dark:ring-slate-500/25'
  if (s === 'SCHEDULED')
    return 'bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-100 dark:ring-amber-500/25'
  if (s === 'CLOSED')
    return 'bg-blue-50 text-blue-900 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-100 dark:ring-blue-500/25'
  if (s === 'ARCHIVED')
    return 'bg-slate-100 text-slate-700 ring-slate-300 dark:bg-slate-600/20 dark:text-slate-300 dark:ring-slate-500/20'
  return 'bg-slate-100 text-slate-800 ring-slate-200 dark:bg-slate-500/15 dark:text-slate-200 dark:ring-slate-500/25'
}

export function AdminScrutinsPage() {
  const scrutinsQuery = useAdminScrutinsQuery()
  const archiveElection = useArchiveElectionMutation()
  const pushToast = useToastStore((s) => s.pushToast)
  const admin = useAdminAuthStore((s) => s.admin)
  const canCreate = canWriteElection(admin)
  const canMutate = canWriteElection(admin)

  const [search, setSearch] = useState('')
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
    const rows = scrutinsQuery.data ?? []
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
  }, [scrutinsQuery.data, search])

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

  return (
    <div className="space-y-8 pb-12">
      <AdminElectionDeleteModal
        election={deleteTarget}
        isDeleting={archiveElection.isPending}
        onClose={() => !archiveElection.isPending && setDeleteTarget(null)}
        onConfirmDelete={handleConfirmDeleteElection}
      />

      <header className="flex flex-col gap-6 border-b border-slate-200/90 pb-8 dark:border-white/[0.06] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Gestion</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-4xl">Élections</h1>
          <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Liste issue de la base de données : intitulé, dates, statut et publication des résultats.
          </p>
        </div>
        {canCreate ? (
          <Link
            to={`${ADMIN_PRIVATE_PATH}/scrutins/nouveau`}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 md:self-auto"
          >
            <Plus className="size-4" strokeWidth={2} />
            Nouvelle élection
          </Link>
        ) : null}
      </header>

      <div className="rounded-[2rem] border border-slate-200/90 bg-white p-1.5 shadow-sm dark:border-white/[0.06] dark:bg-slate-950/35 dark:shadow-none">
        <div className="overflow-hidden rounded-[calc(2rem-6px)] border border-slate-100 bg-slate-50/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:border-white/[0.05] dark:bg-slate-900/45 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          {scrutinsQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-20">
              <Loader2 className="size-8 animate-spin text-blue-600 dark:text-blue-400" strokeWidth={1.25} />
              <p className="text-sm text-slate-600 dark:text-slate-400">Chargement des élections...</p>
            </div>
          ) : scrutinsQuery.isError ? (
            <p className="px-6 py-12 text-sm text-rose-700 dark:text-rose-200">Impossible de charger la liste des élections.</p>
          ) : !scrutinsQuery.data?.length ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">Aucune élection pour le moment.</p>
              {canCreate ? (
                <Link
                  to={`${ADMIN_PRIVATE_PATH}/scrutins/nouveau`}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Plus className="size-4" />
                  Créer une élection
                </Link>
              ) : (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-600">
                  Contactez un super-administrateur pour créer une élection.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="border-b border-slate-200 px-4 py-4 dark:border-white/[0.06] md:px-6">
                <label htmlFor="election-search" className="sr-only">
                  Rechercher une élection
                </label>
                <div className="relative max-w-md">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-slate-400"
                    strokeWidth={1.25}
                  />
                  <input
                    id="election-search"
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher par titre, statut, dates…"
                    autoComplete="off"
                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none ring-blue-500/0 transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/[0.1] dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] uppercase tracking-[0.15em] text-slate-500 dark:border-white/[0.06]">
                      <th className="px-6 py-4 font-medium">Titre</th>
                      <th className="px-6 py-4 font-medium">Statut</th>
                      <th className="px-6 py-4 font-medium">Début</th>
                      <th className="px-6 py-4 font-medium">Fin</th>
                      <th className="px-6 py-4 font-medium">Résultats</th>
                      <th className="px-6 py-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-600 dark:text-slate-400">
                          Aucun résultat pour « {search.trim()} ».
                        </td>
                      </tr>
                    ) : (
                      pageRows.map((row, i) => (
                        <motion.tr
                          key={row.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.4), ease }}
                          className="border-b border-slate-100 last:border-0 dark:border-white/[0.04]"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                            <Link
                              to={`${ADMIN_PRIVATE_PATH}/scrutins/${row.id}`}
                              className="text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
                            >
                              {row.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusStyles(row.status)}`}
                            >
                              {electionStatusLabelFr(row.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">
                            {new Date(row.startsAt).toLocaleString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">
                            {new Date(row.endsAt).toLocaleString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-400">
                            {row.resultsPublishedAt ? new Date(row.resultsPublishedAt).toLocaleString('fr-FR') : '—'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {canMutate ? (
                              <div className="flex flex-wrap items-center justify-end gap-1.5">
                                <Link
                                  to={`${ADMIN_PRIVATE_PATH}/scrutins/${row.id}`}
                                  className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-white/[0.1] dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/15 dark:hover:text-blue-200"
                                  title="Modifier l’élection"
                                  aria-label={`Modifier ${row.title}`}
                                >
                                  <Pencil className="size-[15px]" strokeWidth={1.75} />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(row)}
                                  className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-white/[0.1] dark:bg-slate-900 dark:text-slate-300 dark:hover:border-rose-500/40 dark:hover:bg-rose-500/15 dark:hover:text-rose-200"
                                  title="Supprimer l’élection"
                                  aria-label={`Supprimer ${row.title}`}
                                >
                                  <Trash2 className="size-[15px]" strokeWidth={1.75} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 dark:text-slate-600">—</span>
                            )}
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {hasRemoteData ? (
                <div className="flex flex-col gap-4 border-t border-slate-200 px-4 py-4 dark:border-white/[0.06] md:flex-row md:items-center md:justify-between md:px-6">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {filteredRows.length === 0 ? (
                      <>
                        Aucune ligne ne correspond au filtre ({scrutinsQuery.data?.length ?? 0} élection
                        {(scrutinsQuery.data?.length ?? 0) > 1 ? 's' : ''} au total).
                      </>
                    ) : (
                      <>
                        Affichage{' '}
                        <span className="font-medium tabular-nums text-slate-700 dark:text-slate-300">
                          {rangeStart}–{rangeEnd}
                        </span>{' '}
                        sur{' '}
                        <span className="font-medium tabular-nums text-slate-700 dark:text-slate-300">{filteredRows.length}</span>
                        {search.trim() ? ` (filtré parmi ${scrutinsQuery.data?.length ?? 0})` : null}
                      </>
                    )}
                  </p>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage <= 1 || filteredRows.length === 0}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 dark:border-white/[0.1] dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-white/[0.06]"
                    >
                      <ChevronLeft className="size-4" strokeWidth={1.25} />
                      Précédent
                    </button>
                    <span className="px-2 text-xs tabular-nums text-slate-600 dark:text-slate-400">
                      Page {filteredRows.length === 0 ? 0 : safePage} / {filteredRows.length === 0 ? 0 : totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage >= totalPages || filteredRows.length === 0}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 dark:border-white/[0.1] dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-white/[0.06]"
                    >
                      Suivant
                      <ChevronRight className="size-4" strokeWidth={1.25} />
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
