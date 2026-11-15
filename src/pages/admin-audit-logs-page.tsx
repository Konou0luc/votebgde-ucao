import { useState, useMemo } from 'react'
import { AlertCircle, AlertTriangle, Info, ScrollText, Search, Shield, Trash2 } from 'lucide-react'
import { useAdminAuthStore } from '../modules/admin-dashboard/auth-store'
import { useAdminAuditLogsQuery, usePurgeAuditLogsMutation } from '../modules/admin-dashboard/hooks'
import { useToastStore } from '../shared/ui/toast-store'
import { ADMIN_PRIVATE_PATH } from '../shared/constants/routes'
import { ConfirmModal } from '../shared/ui/confirm-modal'
import {
  AdminButton,
  AdminButtonLink,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Pagination,
  Panel,
} from '../shared/ui/admin-ui'
import { adminInput, adminSelect, table, tableWrap, td, th, tr } from '../shared/ui/admin-ui-classes'

const PAGE_SIZE = 15

const timeFmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
const dayFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

function SeverityIcon({ severity }: { severity: string }) {
  switch (severity.toUpperCase()) {
    case 'ERROR':
    case 'CRITICAL':
      return <AlertCircle className="size-4 shrink-0 text-rose-500" aria-label="Erreur" />
    case 'WARNING':
      return <AlertTriangle className="size-4 shrink-0 text-amber-500" aria-label="Attention" />
    default:
      return <Info className="size-4 shrink-0 text-brand-500" aria-label="Info" />
  }
}

export function AdminAuditLogsPage() {
  const admin = useAdminAuthStore((s) => s.admin)
  const pushToast = useToastStore((s) => s.pushToast)
  const logsQuery = useAdminAuditLogsQuery()
  const purgeMutation = usePurgeAuditLogsMutation()

  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('ALL')
  const [page, setPage] = useState(1)
  const [isConfirmPurgeOpen, setIsConfirmPurgeOpen] = useState(false)

  const filteredLogs = useMemo(() => {
    const q = searchTerm.toLowerCase()
    return (
      logsQuery.data?.filter((log) => {
        const matchesSearch =
          log.action.toLowerCase().includes(q) ||
          log.admin?.email.toLowerCase().includes(q) ||
          log.entity.toLowerCase().includes(q)
        const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter
        return matchesSearch && matchesSeverity
      }) || []
    )
  }, [logsQuery.data, searchTerm, severityFilter])

  if (admin?.role !== 'SUPER_ADMIN') {
    return (
      <Panel>
        <EmptyState
          icon={Shield}
          title="Accès restreint"
          description="Seuls les super administrateurs peuvent accéder au journal d'audit."
          action={<AdminButtonLink to={ADMIN_PRIVATE_PATH}>Retour au tableau de bord</AdminButtonLink>}
        />
      </Panel>
    )
  }

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const rangeStart = filteredLogs.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = filteredLogs.length === 0 ? 0 : Math.min(safePage * PAGE_SIZE, filteredLogs.length)
  const pageRows = filteredLogs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handlePurge = async () => {
    try {
      await purgeMutation.mutateAsync()
      pushToast("Le journal d'audit a été vidé.", 'success')
      setIsConfirmPurgeOpen(false)
    } catch {
      pushToast('Erreur lors de la suppression des logs.', 'error')
    }
  }

  return (
    <div className="pb-12">
      <PageHeader
        title="Journal d'audit"
        description="Historique complet des actions effectuées sur la plateforme."
        actions={
          <AdminButton
            variant="danger"
            icon={Trash2}
            loading={purgeMutation.isPending}
            onClick={() => setIsConfirmPurgeOpen(true)}
            disabled={!logsQuery.data || logsQuery.data.length === 0}
          >
            Vider le journal
          </AdminButton>
        }
      />

      <Panel
        bodyClassName={pageRows.length ? '!py-0' : ''}
        title={
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-72">
              <label htmlFor="audit-search" className="sr-only">
                Rechercher
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
              <input
                id="audit-search"
                type="search"
                placeholder="Action, e-mail, entité…"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className={`${adminInput} h-10 pl-9`}
              />
            </div>
            <label htmlFor="audit-severity" className="sr-only">
              Sévérité
            </label>
            <select
              id="audit-severity"
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value)
                setPage(1)
              }}
              className={`${adminSelect} h-10 sm:w-44`}
            >
              <option value="ALL">Toutes sévérités</option>
              <option value="INFO">Info</option>
              <option value="WARNING">Attention</option>
              <option value="ERROR">Erreur</option>
            </select>
          </div>
        }
        footer={
          filteredLogs.length > 0 ? (
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onChange={(p) => setPage(Math.min(totalPages, Math.max(1, p)))}
              from={rangeStart}
              to={rangeEnd}
              total={filteredLogs.length}
              unit="entrées"
            />
          ) : undefined
        }
      >
        {logsQuery.isLoading ? (
          <LoadingState compact />
        ) : logsQuery.isError ? (
          <ErrorState>Impossible de charger le journal.</ErrorState>
        ) : pageRows.length === 0 ? (
          <EmptyState icon={ScrollText} title="Aucune entrée trouvée" />
        ) : (
          <div className={tableWrap}>
            <table className={`${table} min-w-[860px]`}>
              <thead>
                <tr>
                  <th className={th}>Date</th>
                  <th className={th}>Action</th>
                  <th className={th}>Auteur</th>
                  <th className={th}>Entité</th>
                  <th className={th}>Détails</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((log) => {
                  const d = new Date(log.createdAt)
                  const details = log.metadata ? JSON.stringify(log.metadata) : ''
                  return (
                    <tr key={log.id} className={tr}>
                      <td className={`${td} whitespace-nowrap`}>
                        <p className="text-[15px] text-slate-900 dark:text-white">{dayFmt.format(d)}</p>
                        <p className="text-[13px] tabular-nums text-slate-500">{timeFmt.format(d)}</p>
                      </td>
                      <td className={td}>
                        <span className="flex items-center gap-2">
                          <SeverityIcon severity={log.severity} />
                          <span className="font-medium text-slate-800 dark:text-slate-200">{log.action.replace(/_/g, ' ').toLowerCase()}</span>
                        </span>
                      </td>
                      <td className={td}>
                        <span className="flex items-center gap-2">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500 dark:bg-white/[0.06]">
                            {log.admin?.email.charAt(0).toUpperCase() || 'S'}
                          </span>
                          <span className="truncate text-[15px]">{log.admin?.email || 'Système'}</span>
                        </span>
                      </td>
                      <td className={td}>
                        <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                          {log.entity}
                        </code>
                      </td>
                      <td className={td}>
                        <p className="max-w-xs truncate font-mono text-[13px] text-slate-500" title={details}>
                          {details || '—'}
                        </p>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <ConfirmModal
        isOpen={isConfirmPurgeOpen}
        title="Vider le journal d'audit"
        message="Voulez-vous vraiment supprimer définitivement tous les logs d'audit ? Cette action est irréversible."
        confirmLabel="Vider le journal"
        variant="danger"
        isLoading={purgeMutation.isPending}
        onConfirm={handlePurge}
        onCancel={() => setIsConfirmPurgeOpen(false)}
      />
    </div>
  )
}
