import type { ReactNode } from 'react'
import { isAxiosError } from 'axios'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChartBar,
  CheckCircle,
  House,
  Trophy,
  Users,
  Calendar,
  ShieldCheck,
  Lock,
  ArrowRight,
  ListChecks,
} from '@phosphor-icons/react'
import { useActiveScrutinQuery, usePublishedScrutinResultsQuery } from '../modules/student-vote/hooks'
import { CardShell } from '../shared/ui/CardShell'
import { ButtonLink } from '../shared/ui/Button'
import { Backdrop } from '../shared/ui/backdrop'
import { Reveal, RevealGroup, RevealItem } from '../shared/ui/motion'
import { EASE_OUT } from '../shared/ui/motion-presets'

function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <Reveal immediate delay={0.1}>
      <CardShell className="edge-highlight flex flex-col items-center !rounded-3xl !p-8 text-center sm:!p-12">
        <div className="relative flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200 dark:bg-white/[0.04] dark:text-slate-400 dark:ring-white/10">
          {icon}
        </div>
        <h2 className="mt-6 text-xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-2xl">{title}</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">{children}</p>
        <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          {action}
          <ButtonLink to="/" variant="ghost" leading={<House size={16} />}>
            Retour à l'accueil
          </ButtonLink>
        </div>
      </CardShell>
    </Reveal>
  )
}

function SuccessBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      role="status"
      className="mb-8 flex items-center gap-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-4 text-left text-emerald-800 dark:text-emerald-200"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
        <CheckCircle size={22} weight="duotone" />
      </span>
      <div>
        <h3 className="text-sm font-semibold">Vote enregistré avec succès</h3>
        <p className="text-sm opacity-80">Votre vote a bien été pris en compte. Merci pour votre participation !</p>
      </div>
    </motion.div>
  )
}

export function VoteResultsPage() {
  const location = useLocation()
  const fromVote = Boolean((location.state as { fromVote?: boolean } | null)?.fromVote)

  const activeScrutinQuery = useActiveScrutinQuery()
  const scrutinId = activeScrutinQuery.data?.id
  const resultsQuery = usePublishedScrutinResultsQuery(scrutinId)

  const is403 = isAxiosError(resultsQuery.error) && resultsQuery.error.response?.status === 403

  const sortedResults = resultsQuery.data?.results
    ? [...resultsQuery.data.results].sort((a, b) => b.votes - a.votes)
    : []

  const publishedAt = resultsQuery.data?.resultsPublishedAt ? new Date(resultsQuery.data.resultsPublishedAt) : null
  const resultsLoading = Boolean(scrutinId) && resultsQuery.isLoading
  const isLoading = activeScrutinQuery.isLoading || resultsLoading
  const hasResults = Boolean(resultsQuery.data) && sortedResults.length > 0
  const voteTitle = activeScrutinQuery.data?.title

  /* ─── Chargement ou pas de résultats : même composition centrée (aucun saut de mise en page) ─── */
  if (!hasResults) {
    let empty: ReactNode
    if (isLoading) {
      empty = (
        <CardShell
          role="status"
          aria-live="polite"
          className="flex min-h-[19rem] flex-col items-center justify-center gap-4 !rounded-3xl !p-10 text-sm text-slate-500 dark:text-slate-400"
        >
          <span className="relative flex size-10 items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-slate-200 dark:border-white/10" />
            <span className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-brand-600" />
          </span>
          Chargement des résultats…
        </CardShell>
      )
    } else if (!activeScrutinQuery.data) {
      empty = (
        <EmptyState icon={<Calendar size={26} />} title="Aucun vote en cours">
          Il n’y a actuellement aucun vote ouvert. Les résultats apparaîtront ici à la fin du prochain vote.
        </EmptyState>
      )
    } else if (is403) {
      empty = (
        <EmptyState
          icon={<Lock size={26} />}
          title="Résultats pas encore disponibles"
          action={
            <ButtonLink to="/vote" trailing={<ArrowRight size={16} weight="bold" />}>
              Voter maintenant
            </ButtonLink>
          }
        >
          Les résultats de <span className="font-medium text-slate-900 dark:text-white">« {voteTitle} »</span> seront
          affichés à la fin du vote.
        </EmptyState>
      )
    } else {
      empty = (
        <EmptyState icon={<ChartBar size={26} />} title="Aucun résultat disponible">
          Les résultats de ce vote ne sont pas encore disponibles. Réessayez plus tard.
        </EmptyState>
      )
    }

    return (
      <div className="relative isolate">
        <Backdrop pattern="grid" />
        <div className="relative mx-auto flex min-h-[calc(100dvh-7rem)] w-full max-w-xl flex-col justify-center px-4 py-12 text-center sm:px-6">
          {fromVote && <SuccessBanner />}
          <Reveal immediate className="mb-8">
            <h1 className="text-4xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-5xl">
              Résultats <span className="text-gradient">du vote.</span>
            </h1>
          </Reveal>
          {empty}
        </div>
      </div>
    )
  }

  /* ─── Résultats : mise en page alignée sur une grille ─── */
  return (
    <div className="relative isolate">
      <Backdrop pattern="grid" />
      <div className="section-container relative py-10 md:py-16">
        {fromVote && <SuccessBanner />}

        <Reveal immediate className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
              {voteTitle || 'Résultats'} <span className="text-gradient">du vote.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400 md:text-lg">
              Consultez la participation et la répartition des votes.
            </p>
          </div>
        </Reveal>


        {resultsQuery.data ? (
          sortedResults.length > 0 ? (
            <div className="space-y-6">
              <RevealGroup immediate className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    label: 'Nombre de votes',
                    value: resultsQuery.data.totalVotes.toLocaleString('fr-FR'),
                    icon: <Users size={16} />,
                  },
                  { label: 'Listes candidates', value: String(sortedResults.length), icon: <ListChecks size={16} /> },
                  {
                    label: 'Résultats affichés à',
                    value: publishedAt ? publishedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—',
                    sub: publishedAt?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
                    icon: <Calendar size={16} />,
                  },
                ].map((stat) => (
                  <RevealItem key={stat.label}>
                    <CardShell className="!p-5">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        {stat.icon}
                        <span>{stat.label}</span>
                      </div>
                      <p className="mt-4 flex items-baseline gap-2 text-3xl font-semibold tabular-nums tracking-tight text-slate-950 dark:text-white">
                        {stat.value}
                        {stat.sub && <span className="text-sm font-normal text-slate-500">{stat.sub}</span>}
                      </p>
                    </CardShell>
                  </RevealItem>
                ))}
              </RevealGroup>

              <div className="grid items-start gap-6 lg:grid-cols-3">
                <Reveal immediate delay={0.15} className="lg:col-span-2">
                  <CardShell className="!p-6 sm:!p-8">
                    <div className="mb-8 flex items-center justify-between">
                      <h2 className="text-base font-semibold tracking-tight text-slate-950 dark:text-white">Répartition des voix</h2>
                      <ChartBar size={20} className="text-slate-400" />
                    </div>
                    <ol className="space-y-7">
                      {sortedResults.map((row, i) => {
                        const leader = i === 0
                        return (
                          <li key={row.candidateListId}>
                            <div className="mb-3 flex items-center justify-between gap-4">
                              <div className="flex min-w-0 items-center gap-3">
                                {leader ? (
                                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 ring-1 ring-inset ring-amber-500/25 dark:text-amber-400">
                                    <Trophy size={16} weight="fill" />
                                  </span>
                                ) : (
                                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 font-mono text-xs text-slate-500 dark:bg-white/[0.05]">
                                    {i + 1}
                                  </span>
                                )}
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-slate-950 dark:text-white">{row.name}</p>
                                  <p className="text-xs tabular-nums text-slate-500">
                                    {row.votes.toLocaleString('fr-FR')} votes
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`shrink-0 text-xl font-semibold tabular-nums tracking-tight ${
                                  leader ? 'text-slate-950 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {row.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div
                              className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.05]"
                              role="progressbar"
                              aria-label={row.name}
                              aria-valuenow={Math.round(row.percentage)}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${row.percentage}%` }}
                                transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.3 + i * 0.08 }}
                                className={`h-full rounded-full ${
                                  leader
                                    ? 'bg-brand-600 dark:bg-brand-400'
                                    : 'bg-slate-300 dark:bg-white/20'
                                }`}
                              />
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                  </CardShell>
                </Reveal>

                <Reveal immediate delay={0.25} className="space-y-4">
                  <div className="relative isolate overflow-hidden rounded-2xl border border-brand-700 bg-brand-600 p-7 text-white shadow-lift">
                    <div className="dark">
                      <Backdrop pattern="dots" glow />
                    </div>
                    <div className="relative">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20">
                        <ShieldCheck size={22} weight="duotone" />
                      </div>
                      <h3 className="mt-6 text-xl font-semibold tracking-tight">Vote sécurisé</h3>
                      <p className="mt-2 text-sm leading-relaxed text-brand-100">
                        Chaque vote est compté une seule fois et reste secret : personne ne peut savoir qui a voté pour quelle liste.
                      </p>
                      <div className="mt-6 flex items-center gap-2 border-t border-white/15 pt-5 text-xs text-brand-100">
                        <span className="size-1.5 rounded-full bg-white" /> Un étudiant, un vote
                      </div>
                    </div>
                  </div>

                  <ButtonLink to="/" variant="ghost" size="lg" className="w-full" trailing={<ArrowRight size={16} />}>
                    Retour à l'accueil
                  </ButtonLink>
                </Reveal>
              </div>
            </div>
          ) : null
        ) : null}
      </div>
    </div>
  )
}
