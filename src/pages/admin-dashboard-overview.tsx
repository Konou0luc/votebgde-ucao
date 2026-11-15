import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Archive,
  ArrowRight,
  CalendarClock,
  CircleDot,
  FileEdit,
  Layers,
  Plus,
  ScrollText,
  Users,
  Vote,
  Activity,
  ChartPie,
} from 'lucide-react'
import { useAdminDashboardQuery, useAdminScrutinsQuery } from '../modules/admin-dashboard/hooks'
import { useAdminAuthStore } from '../modules/admin-dashboard/auth-store'
import { canWriteElection } from '../modules/admin-dashboard/permissions'
import { ADMIN_PRIVATE_PATH } from '../shared/constants/routes'
import {
  AdminButtonLink,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  Panel,
  ProgressBar,
  StatCard,
  StatusBadge,
} from '../shared/ui/admin-ui'
import { formatDate, formatNumber, table, tableWrap, td, th, trClickable } from '../shared/ui/admin-ui-classes'

function greeting() {
  const h = new Date().getHours()
  return h < 18 ? 'Bonjour' : 'Bonsoir'
}

export function AdminDashboardOverview() {
  const navigate = useNavigate()
  const dashboardQuery = useAdminDashboardQuery()
  const scrutinsQuery = useAdminScrutinsQuery()
  const admin = useAdminAuthStore((s) => s.admin)
  const showCreate = canWriteElection(admin)

  const recent = useMemo(
    () =>
      [...(scrutinsQuery.data ?? [])]
        .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
        .slice(0, 5),
    [scrutinsQuery.data],
  )

  if (dashboardQuery.isLoading) {
    return <LoadingState label="Chargement du tableau de bord…" />
  }

  if (dashboardQuery.isError) {
    return <ErrorState>Impossible de charger les indicateurs. Vérifiez la session et le serveur API.</ErrorState>
  }

  const d = dashboardQuery.data!
  const scr = d.scrutins
  const totalScrutins = scr.draft + scr.scheduled + scr.open + scr.closed + scr.archived
  const firstName = admin?.email?.split('@')[0]

  const statusRows = [
    { key: 'open', label: 'Ouvert', value: scr.open, Icon: CircleDot, dot: 'bg-emerald-500' },
    { key: 'scheduled', label: 'Planifié', value: scr.scheduled, Icon: CalendarClock, dot: 'bg-amber-500' },
    { key: 'draft', label: 'Brouillon', value: scr.draft, Icon: FileEdit, dot: 'bg-slate-400' },
    { key: 'closed', label: 'Clôturé', value: scr.closed, Icon: ScrollText, dot: 'bg-brand-500' },
    { key: 'archived', label: 'Archivé', value: scr.archived, Icon: Archive, dot: 'bg-slate-300 dark:bg-slate-600' },
  ]

  return (
    <div className="pb-12">
      <PageHeader
        eyebrow={`${greeting()}${firstName ? `, ${firstName}` : ''}`}
        title="Vue d'ensemble"
        description="Indicateurs calculés en direct : effectifs, votes et répartition des élections par statut."
        actions={
          <>
            <AdminButtonLink to={`${ADMIN_PRIVATE_PATH}/scrutins`} icon={ChartPie}>
              Toutes les élections
            </AdminButtonLink>
            {showCreate && (
              <AdminButtonLink to={`${ADMIN_PRIVATE_PATH}/scrutins/nouveau`} variant="primary" icon={Plus}>
                Nouvelle élection
              </AdminButtonLink>
            )}
          </>
        }
      />

      {/* Indicateurs clés */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Étudiants éligibles" value={formatNumber(d.students.eligible)} icon={Users} accent="brand" />
        <StatCard
          label="Votes enregistrés"
          value={formatNumber(d.votes.total)}
          icon={Vote}
          accent="crimson"
          hint="Toutes élections confondues"
          delay={0.04}
        />
        <StatCard
          label="Élections en cours"
          value={formatNumber(scr.open)}
          icon={Activity}
          accent="emerald"
          hint={scr.scheduled ? `${scr.scheduled} planifiée${scr.scheduled > 1 ? 's' : ''}` : 'Aucune planifiée'}
          delay={0.08}
        />
        <StatCard label="Élections au total" value={formatNumber(totalScrutins)} icon={Layers} accent="slate" delay={0.12} />
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-3">
        {/* Élections récentes */}
        <Panel
          className="xl:col-span-2"
          title="Élections récentes"
          icon={ChartPie}
          delay={0.1}
          bodyClassName={recent.length ? '!py-0' : ''}
          actions={
            <AdminButtonLink to={`${ADMIN_PRIVATE_PATH}/scrutins`} variant="ghost" size="sm">
              Tout voir
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </AdminButtonLink>
          }
        >
          {scrutinsQuery.isLoading ? (
            <LoadingState compact />
          ) : scrutinsQuery.isError ? (
            <ErrorState>Erreur de chargement des élections.</ErrorState>
          ) : recent.length === 0 ? (
            <EmptyState
              title="Aucune élection"
              description="Créez une première élection pour commencer."
              action={
                showCreate && (
                  <AdminButtonLink to={`${ADMIN_PRIVATE_PATH}/scrutins/nouveau`} icon={Plus} size="sm">
                    Nouvelle élection
                  </AdminButtonLink>
                )
              }
            />
          ) : (
            <div className={tableWrap}>
              <table className={table}>
                <thead>
                  <tr>
                    <th className={th}>Élection</th>
                    <th className={th}>Statut</th>
                    <th className={th}>Période</th>
                    <th className={`${th} w-10`} aria-label="Ouvrir" />
                  </tr>
                </thead>
                <tbody>
                  {recent.map((row) => (
                    <tr
                      key={row.id}
                      className={trClickable}
                      onClick={() => navigate(`${ADMIN_PRIVATE_PATH}/scrutins/${row.id}`)}
                    >
                      <td className={td}>
                        <p className="font-medium text-slate-950 dark:text-white">{row.title}</p>
                        {row.resultsPublishedAt && <p className="text-[13px] text-emerald-600 dark:text-emerald-400">Résultats publiés</p>}
                      </td>
                      <td className={td}>
                        <StatusBadge status={row.status} />
                      </td>
                      <td className={`${td} whitespace-nowrap text-[13px] tabular-nums text-slate-500`}>
                        {formatDate(row.startsAt)} → {formatDate(row.endsAt)}
                      </td>
                      <td className={`${td} text-right`}>
                        <ArrowRight className="ml-auto size-4 text-slate-300 dark:text-slate-600" strokeWidth={1.75} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* Répartition */}
        <Panel
          title="Élections par statut"
          icon={Layers}
          delay={0.15}
          description={totalScrutins === 0 ? 'Aucune élection' : `${totalScrutins} élection${totalScrutins > 1 ? 's' : ''}`}
        >
          {totalScrutins > 0 && (
            <div className="mb-6 flex h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
              {statusRows
                .filter((r) => r.value > 0)
                .map((r) => (
                  <span
                    key={r.key}
                    className={`${r.dot} h-full first:rounded-l-full last:rounded-r-full`}
                    style={{ width: `${(r.value / totalScrutins) * 100}%` }}
                    title={`${r.label} : ${r.value}`}
                  />
                ))}
            </div>
          )}
          <ul className="space-y-4">
            {statusRows.map((row, i) => {
              const pct = totalScrutins > 0 ? Math.round((row.value / totalScrutins) * 100) : 0
              return (
                <li key={row.key}>
                  <div className="mb-1.5 flex items-center justify-between text-[15px]">
                    <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span className={`size-2 rounded-full ${row.dot}`} />
                      {row.label}
                    </span>
                    <span className="tabular-nums text-slate-500">
                      <span className="font-medium text-slate-950 dark:text-white">{row.value}</span> · {pct} %
                    </span>
                  </div>
                  <ProgressBar value={pct} tone="slate" delay={0.15 + i * 0.05} />
                </li>
              )
            })}
          </ul>
        </Panel>
      </div>
    </div>
  )
}
