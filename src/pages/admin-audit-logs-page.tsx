import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Loader2,
  Activity,
  Search,
  Calendar,
  Shield,
  Terminal,
  ArrowLeft,
  Filter,
  Info,
  AlertTriangle,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import { useAdminAuthStore } from '../modules/admin-dashboard/auth-store'
import { useAdminAuditLogsQuery, usePurgeAuditLogsMutation } from '../modules/admin-dashboard/hooks'
import { useToastStore } from '../shared/ui/toast-store'
import { ADMIN_PRIVATE_PATH } from '../shared/constants/routes'
import { ConfirmModal } from '../shared/ui/confirm-modal'

const PAGE_SIZE = 15

export function AdminAuditLogsPage() {
  const admin = useAdminAuthStore((s) => s.admin)
  const pushToast = useToastStore((s) => s.pushToast)
  const logsQuery = useAdminAuditLogsQuery()
  const purgeMutation = usePurgeAuditLogsMutation()

  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('ALL')
  const [page, setPage] = useState(1)
  const [isConfirmPurgeOpen, setIsConfirmPurgeOpen] = useState(false)

  if (admin?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-rose-50 p-4 dark:bg-rose-500/10">
          <Shield className="size-12 text-rose-600" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Accès Restreint</h1>
        <p className="mt-2 text-slate-500">Seuls les Super Administrateurs peuvent accéder aux logs d&apos;audit.</p>
        <Link to={ADMIN_PRIVATE_PATH} className="mt-6 font-medium text-blue-600 hover:underline">
          Retour au tableau de bord
        </Link>
      </div>
    )
  }

  const filteredLogs = useMemo(() => {
    return logsQuery.data?.filter((log) => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.admin?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter
      
      return matchesSearch && matchesSeverity
    }) || []
  }, [logsQuery.data, searchTerm, severityFilter])

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const rangeStart = filteredLogs.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = filteredLogs.length === 0 ? 0 : Math.min(safePage * PAGE_SIZE, filteredLogs.length)
  const pageRows = filteredLogs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [searchTerm, severityFilter])

  const getSeverityIcon = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'ERROR':
      case 'CRITICAL':
        return <AlertCircle className="size-4 text-rose-500" />
      case 'WARNING':
        return <AlertTriangle className="size-4 text-amber-500" />
      default:
        return <Info className="size-4 text-blue-500" />
    }
  }

  const handlePurge = async () => {
    try {
      await purgeMutation.mutateAsync()
      pushToast('Le journal d\'audit a été vidé.', 'success')
      setIsConfirmPurgeOpen(false)
    } catch (err) {
      pushToast('Erreur lors de la suppression des logs.', 'error')
    }
  }

  return (
    <div className="mx-auto max-w-6xl pb-24 pt-12">
      <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <Link
            to={ADMIN_PRIVATE_PATH}
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="size-3" strokeWidth={2.5} />
            Dashboard
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tighter text-slate-950 dark:text-white">
              Journal d&apos;Audit
            </h1>
            <p className="text-slate-500">Historique complet des actions effectuées sur la plateforme.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => setIsConfirmPurgeOpen(true)}
            disabled={!logsQuery.data || logsQuery.data.length === 0 || purgeMutation.isPending}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-6 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
          >
            {purgeMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Vider les logs
          </button>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une action, un email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-slate-950 sm:w-64"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-medium outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-slate-950 sm:w-48"
            >
              <option value="ALL">Toutes sévérités</option>
              <option value="INFO">Info</option>
              <option value="WARNING">Attention</option>
              <option value="ERROR">Erreur</option>
            </select>
          </div>
        </div>
      </header>

      {logsQuery.isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date & Heure</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Action</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Entité</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {pageRows.map((log) => (
                  <tr key={log.id} className="group transition hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {new Date(log.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(log.createdAt).toLocaleTimeString('fr-FR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(log.severity)}
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 dark:bg-white/5">
                          {log.admin?.email.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {log.admin?.email || 'Système'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-white/5">
                        {log.entity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-xs text-slate-500">
                        {log.metadata ? JSON.stringify(log.metadata) : '-'}
                      </div>
                    </td>
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Aucun log trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredLogs.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-4 dark:border-white/5 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-slate-500">
                Affichage{' '}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {rangeStart}–{rangeEnd}
                </span>{' '}
                sur{' '}
                <span className="font-semibold text-slate-900 dark:text-white">{filteredLogs.length}</span> logs
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  <ChevronLeft className="size-4" strokeWidth={2} />
                  Précédent
                </button>
                <span className="min-w-[80px] text-center text-xs font-medium text-slate-500">
                  Page {safePage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  Suivant
                  <ChevronRight className="size-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmPurgeOpen}
        title="Vider le journal d'audit"
        message="Voulez-vous vraiment supprimer définitivement tous les logs d'audit ? Cette action est irréversible."
        confirmLabel="Vider les logs"
        variant="danger"
        onConfirm={handlePurge}
        onCancel={() => setIsConfirmPurgeOpen(false)}
      />
    </div>
  )
}
