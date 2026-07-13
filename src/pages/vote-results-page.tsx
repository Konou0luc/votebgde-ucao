import { isAxiosError } from 'axios'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ChartBar, 
  CheckCircle, 
  House, 
  TrendUp, 
  Trophy,
  Users,
  Calendar,
  ShieldCheck,
  Lock,
  ArrowRight
} from '@phosphor-icons/react'
import { useActiveScrutinQuery, usePublishedScrutinResultsQuery } from '../modules/student-vote/hooks'
import { CardShell } from '../shared/ui/CardShell'
import { Button } from '../shared/ui/Button'

export function VoteResultsPage() {
  const location = useLocation()
  const fromVote = Boolean((location.state as { fromVote?: boolean } | null)?.fromVote)

  const activeScrutinQuery = useActiveScrutinQuery()
  const scrutinId = activeScrutinQuery.data?.id
  const resultsQuery = usePublishedScrutinResultsQuery(scrutinId)

  const is403 =
    isAxiosError(resultsQuery.error) && resultsQuery.error.response?.status === 403

  const sortedResults = resultsQuery.data?.results
    ? [...resultsQuery.data.results].sort((a, b) => b.votes - a.votes)
    : []

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] as const }
  }

  return (
    <main className="min-h-screen">
      <div className="section-container py-24">
        {fromVote && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 border border-brand-100 bg-brand-50 p-6 text-brand-800 rounded-3xl dark:border-brand-900/30 dark:bg-brand-900/10 dark:text-brand-400">
              <CheckCircle size={32} weight="duotone" className="shrink-0" />
              <div>
                <h3 className="text-sm font-bold">Vote enregistré avec succès</h3>
                <p className="text-xs opacity-90">Votre bulletin a été déposé et chiffré dans l'urne numérique certifiée.</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div {...fadeIn} className="mb-20">
          <div className="flex items-center gap-2 tt-overline text-brand-600">
            <TrendUp size={16} weight="bold" /> Résultats en direct
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            {activeScrutinQuery.data?.title || 'Tableau de bord'} <br />
            <span className="italic text-brand-600">électoral.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
            Consultez les statistiques de participation et la répartition des votes certifiés par le protocole VoteBGDE.
          </p>
        </motion.div>

        {activeScrutinQuery.isLoading && (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-[2rem] bg-slate-100 dark:bg-white/5" />
            ))}
          </div>
        )}

        {activeScrutinQuery.data && is403 && (
          <motion.div {...fadeIn}>
            <CardShell className="flex flex-col items-center justify-center p-16 text-center max-w-2xl mx-auto">
              <div className="flex size-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 dark:bg-white/5 mb-8">
                <Lock size={40} weight="light" />
              </div>
              <h2 className="font-display text-3xl font-semibold text-slate-900 dark:text-white">Publication en attente</h2>
              <p className="mt-6 text-slate-500 dark:text-slate-400 leading-relaxed">
                Les résultats officiels pour <span className="text-slate-900 dark:text-white font-bold">"{activeScrutinQuery.data.title}"</span> n'ont pas encore été rendus publics par la commission électorale.
              </p>
              <Link to="/" className="mt-10">
                <Button variant="ghost" trailing={<House size={18} />}>
                  Retour à l'accueil
                </Button>
              </Link>
            </CardShell>
          </motion.div>
        )}

        {resultsQuery.data && (
          <div className="space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="grid gap-6 sm:grid-cols-3"
            >
              {[
                { label: 'Votes Totaux', value: resultsQuery.data.totalVotes, icon: <Users size={20} weight="light" /> },
                { label: 'Participation', value: '74.2%', icon: <TrendUp size={20} weight="light" /> },
                { label: 'Dernière MAJ', value: new Date(resultsQuery.data.resultsPublishedAt).toLocaleTimeString('fr-FR'), icon: <Calendar size={20} weight="light" /> },
              ].map((stat, i) => (
                <CardShell key={i}>
                  <div className="flex items-center gap-3 tt-overline">
                    {stat.icon}
                    <span>{stat.label}</span>
                  </div>
                  <p className="mt-6 font-display text-4xl font-semibold tabular-nums text-slate-900 dark:text-white">{stat.value}</p>
                </CardShell>
              ))}
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-3 items-start">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="lg:col-span-2"
              >
                <CardShell>
                  <div className="flex items-center justify-between mb-12">
                    <h3 className="tt-overline">Répartition des voix</h3>
                    <ChartBar size={24} weight="light" className="text-slate-300" />
                  </div>
                  <div className="space-y-10">
                    {sortedResults.map((row, i) => (
                      <div key={row.candidateListId} className="group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            {i === 0 ? (
                              <div className="size-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                                <Trophy size={18} weight="fill" />
                              </div>
                            ) : (
                              <div className="size-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 font-bold text-xs">
                                {i + 1}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-lg text-slate-900 dark:text-white">{row.name}</span>
                              <p className="text-xs text-slate-400 font-medium tabular-nums">{row.votes} voix exprimées</p>
                            </div>
                          </div>
                          <span className="font-display text-2xl font-semibold text-brand-600 tabular-nums">{row.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${row.percentage}%` }}
                            transition={{ duration: 1.5, ease: [0.32, 0.72, 0, 1], delay: 0.6 + i * 0.1 }}
                            className={`h-full rounded-full ${i === 0 ? 'bg-brand-600 shadow-lg shadow-brand-500/20' : 'bg-slate-300 dark:bg-slate-600'}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardShell>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="space-y-6"
              >
                <CardShell className="!bg-brand-600 !p-1">
                  <div className="bg-brand-600 rounded-[calc(2rem-0.375rem-0.375rem)] p-8 text-white">
                    <ShieldCheck size={40} weight="duotone" className="text-white/40 mb-8" />
                    <h4 className="font-display text-2xl font-semibold mb-4">Certification</h4>
                    <p className="text-sm text-white/80 leading-relaxed mb-8">
                      Ce vote est certifié par le protocole VoteBGDE. Chaque bulletin est chiffré et stocké de manière immuable.
                    </p>
                    <div className="pt-6 border-t border-white/10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60">
                      Données vérifiées & Certifiées
                    </div>
                  </div>
                </CardShell>
                
                <Link to="/" className="block">
                  <Button variant="ghost" className="w-full !py-4" trailing={<ArrowRight size={18} />}>
                    Retour à l'accueil
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
