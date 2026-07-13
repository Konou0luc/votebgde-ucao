import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Archive,
  CircleDot,
  FileEdit,
  Layers,
  Loader2,
  ScrollText,
  Users,
  Vote,
  CalendarClock,
} from 'lucide-react'
import { useAdminDashboardQuery } from '../modules/admin-dashboard/hooks'
import { useAdminAuthStore } from '../modules/admin-dashboard/auth-store'
import { canWriteElection } from '../modules/admin-dashboard/permissions'
import { ADMIN_PRIVATE_PATH } from '../shared/constants/routes'

const ease = [0.32, 0.72, 0, 1] as const

function KpiShell({
  label,
  value,
  hint,
  icon: Icon,
  delay,
}: {
  label: string
  value: string | number
  hint?: string
  icon: typeof Users
  delay: number
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease }}
      className="rounded-[1.5rem] border border-slate-200/90 bg-white p-1 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.15)] dark:border-white/[0.06] dark:bg-slate-950/40 dark:shadow-[0_24px_60px_-36px_rgba(0,0,0,0.55)] md:rounded-[2rem] md:p-1.5"
    >
      <div className="rounded-[calc(1.5rem-4px)] border border-slate-100 bg-slate-50/80 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-white/[0.05] dark:bg-slate-900/60 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:rounded-[calc(2rem-6px)] md:px-5 md:py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 md:text-[11px]">{label}</p>
            <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-slate-950 tabular-nums dark:text-white md:mt-3 md:text-3xl">{value}</p>
            {hint ? <p className="mt-1.5 text-[10px] text-slate-500 md:mt-2 md:text-xs">{hint}</p> : null}
          </div>
          <div className="rounded-xl bg-blue-600/10 p-2 ring-1 ring-blue-600/20 dark:bg-blue-500/12 dark:ring-blue-500/20 md:p-2.5">
            <Icon className="size-4 text-blue-600 dark:text-blue-400 md:size-5" strokeWidth={1.25} />
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export function AdminDashboardOverview() {
  const dashboardQuery = useAdminDashboardQuery()
  const admin = useAdminAuthStore((s) => s.admin)
  const showCreate = canWriteElection(admin)

  if (dashboardQuery.isLoading) {
    return (
      <div className="flex min-h-[40dvh] flex-col items-center justify-center gap-3 rounded-[2rem] border border-slate-200/90 bg-white/80 px-6 py-16 dark:border-white/[0.06] dark:bg-slate-950/30">
        <Loader2 className="size-8 animate-spin text-blue-600 dark:text-blue-400" strokeWidth={1.25} />
        <p className="text-sm text-slate-600 dark:text-slate-400">Chargement du tableau de bord...</p>
      </div>
    )
  }

  if (dashboardQuery.isError) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-8 text-sm text-rose-900 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-100">
        Impossible de charger les indicateurs. Vérifiez la session et le serveur API.
      </div>
    )
  }

  const d = dashboardQuery.data!
  const scr = d.scrutins
  const totalScrutins = scr.draft + scr.scheduled + scr.open + scr.closed + scr.archived

  const statusRows = [
    {
      key: 'draft',
      label: 'Brouillon',
      value: scr.draft,
      Icon: FileEdit,
      tone:
        'bg-slate-100 text-slate-800 ring-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:ring-slate-500/25',
    },
    {
      key: 'scheduled',
      label: 'Planifié',
      value: scr.scheduled,
      Icon: CalendarClock,
      tone:
        'bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/25',
    },
    {
      key: 'open',
      label: 'Ouvert',
      value: scr.open,
      Icon: CircleDot,
      tone:
        'bg-emerald-50 text-emerald-900 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/25',
    },
    {
      key: 'closed',
      label: 'Clôturé',
      value: scr.closed,
      Icon: ScrollText,
      tone: 'bg-blue-50 text-blue-900 ring-blue-200 dark:bg-blue-500/15 dark:text-blue-200 dark:ring-blue-500/25',
    },
    {
      key: 'archived',
      label: 'Archivé',
      value: scr.archived,
      Icon: Archive,
      tone:
        'bg-slate-100 text-slate-800 ring-slate-300 dark:bg-slate-600/25 dark:text-slate-300 dark:ring-slate-500/20',
    },
  ]

  return (
    <div className="max-w-full space-y-6 pb-12 md:space-y-10">
      <header className="border-b border-slate-200/90 pb-6 dark:border-white/[0.06] md:pb-8">
        <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 md:text-[11px]">Pilotage</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white md:text-4xl">Vue d&apos;ensemble</h1>
        <p className="mt-3 max-w-[62ch] text-xs leading-relaxed text-slate-600 dark:text-slate-400 md:text-sm">
          Indicateurs calculés en direct : effectifs, votes et répartition par statut.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to={`${ADMIN_PRIVATE_PATH}/scrutins`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-slate-200 md:text-xs"
          >
            Toutes les élections
            <span className="text-blue-600 dark:text-blue-400">&#8594;</span>
          </Link>
          {showCreate ? (
            <Link
              to={`${ADMIN_PRIVATE_PATH}/scrutins/nouveau`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-[11px] font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 md:text-xs"
            >
              Nouvelle élection
            </Link>
          ) : null}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiShell label="Étudiants éligibles" value={d.students.eligible} icon={Users} delay={0} />
        <KpiShell label="Votes enregistrés (total)" value={d.votes.total} icon={Vote} delay={0.06} hint="Toutes élections confondues" />
        <KpiShell label="Élections (tous statuts)" value={totalScrutins} icon={Layers} delay={0.12} />
      </div>

      <section className="rounded-[1.5rem] border border-slate-200/90 bg-white p-1 shadow-sm dark:border-white/[0.06] dark:bg-slate-950/35 dark:shadow-none md:rounded-[2rem] md:p-1.5">
        <div className="rounded-[calc(1.5rem-4px)] border border-slate-100 bg-slate-50/50 p-4 dark:border-white/[0.05] dark:bg-slate-900/50 md:p-8">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 md:text-[11px]">Répartition</p>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white md:text-xl">Élections par statut</h2>
            </div>
            <p className="text-[10px] text-slate-500 md:text-xs">
              {totalScrutins === 0 ? 'Aucune élection' : `${totalScrutins} élection${totalScrutins > 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="space-y-3 md:space-y-4">
            {statusRows.map((row, i) => {
              const pct = totalScrutins > 0 ? Math.round((row.value / totalScrutins) * 100) : 0
              return (
                <motion.div
                  key={row.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 * i, ease }}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex min-w-[120px] items-center gap-2 md:min-w-[140px]">
                    <span className={`inline-flex size-7 items-center justify-center rounded-lg ring-1 md:size-8 ${row.tone}`}>
                      <row.Icon className="size-3.5 md:size-4" strokeWidth={1.25} />
                    </span>
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 md:text-sm">{row.label}</span>
                  </div>
                  <div className="flex flex-1 items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 md:h-2.5">
                      <motion.div
                        className="h-full rounded-full bg-blue-600/90 dark:bg-blue-500/85"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: 0.15 + i * 0.05, ease }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300 md:w-14 md:text-sm">{row.value}</span>
                    <span className="w-8 text-right text-[10px] text-slate-500 md:w-10 md:text-xs">{pct}%</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
