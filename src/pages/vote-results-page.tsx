import { isAxiosError } from 'axios'
import { Link, useLocation } from 'react-router-dom'
import { BarChart3, CheckCircle2, Home, Info } from 'lucide-react'
import { useActiveScrutinQuery, usePublishedScrutinResultsQuery } from '../modules/student-vote/hooks'
import { useSiteTheme } from '../shared/ui/site-theme'

export function VoteResultsPage() {
  const { theme } = useSiteTheme()
  const isDark = theme === 'dark'
  const location = useLocation()
  const fromVote = Boolean((location.state as { fromVote?: boolean } | null)?.fromVote)

  const activeScrutinQuery = useActiveScrutinQuery()
  const scrutinId = activeScrutinQuery.data?.id
  const resultsQuery = usePublishedScrutinResultsQuery(scrutinId)

  const is403 =
    isAxiosError(resultsQuery.error) && resultsQuery.error.response?.status === 403

  return (
    <main className="mx-auto w-full max-w-[980px] px-4 pb-16 pt-4 md:px-8">
      {fromVote && (
        <div
          className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${
            isDark
              ? 'border-emerald-800/60 bg-emerald-950/35 text-emerald-100'
              : 'border-emerald-200 bg-emerald-50 text-emerald-900'
          }`}
        >
          <CheckCircle2 className="mt-0.5 shrink-0" size={22} />
          <div>
            <p className="font-semibold">Vote enregistre</p>
            <p className="mt-1 text-sm opacity-90">
              Merci. Votre participation est prise en compte. Vous ne pouvez pas voter une seconde fois pour ce
              scrutin.
            </p>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Resultats publics</p>
          <h1
            className={`mt-2 text-2xl font-semibold tracking-tight md:text-3xl ${
              isDark ? 'text-slate-100' : 'text-slate-950'
            }`}
          >
            Evolution des votes
          </h1>
          <p className={`mt-2 max-w-[60ch] text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Repartition des suffrages par liste candidate lorsque l administration a publie les resultats.
          </p>
        </div>
        <BarChart3 className={`hidden h-10 w-10 sm:block ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
      </div>

      {activeScrutinQuery.isLoading && (
        <div className="space-y-3">
          <div className={`h-8 w-48 animate-pulse rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <div className={`h-40 animate-pulse rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
        </div>
      )}

      {activeScrutinQuery.isError && (
        <p className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
          Impossible de charger le scrutin actif. Reessayez plus tard.
        </p>
      )}

      {activeScrutinQuery.data && resultsQuery.isLoading && (
        <div className="space-y-3">
          <div className={`h-6 w-64 animate-pulse rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <div className={`h-4 w-full max-w-md animate-pulse rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <div className={`h-4 w-full max-w-sm animate-pulse rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
        </div>
      )}

      {activeScrutinQuery.data && is403 && (
        <section
          className={`rounded-2xl border p-6 ${
            isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex gap-3">
            <Info className="mt-0.5 shrink-0 text-blue-500" size={22} />
            <div>
              <p className={`font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                Statistiques detaillees a venir
              </p>
              <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Les resultats complets ne sont pas encore publies pour le scrutin actif :{' '}
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {activeScrutinQuery.data.title}
                </span>
                . Revenez sur cette page apres la publication par l equipe d administration.
              </p>
            </div>
          </div>
        </section>
      )}

      {activeScrutinQuery.data && resultsQuery.isError && !is403 && (
        <p className={`text-sm ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>
          Impossible de charger les resultats. Verifiez la connexion ou reessayez plus tard.
        </p>
      )}

      {resultsQuery.data && (
        <section
          className={`rounded-2xl border p-6 shadow-sm ${
            isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
              {resultsQuery.data.title}
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {resultsQuery.data.totalVotes} vote{resultsQuery.data.totalVotes === 1 ? '' : 's'} enregistre
              {resultsQuery.data.totalVotes === 1 ? '' : 's'}
            </p>
          </div>
          <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            Publie le {new Date(resultsQuery.data.resultsPublishedAt).toLocaleString('fr-FR')}
          </p>

          <ul className="mt-6 space-y-4">
            {resultsQuery.data.results
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((row) => (
                <li key={row.candidateListId}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {row.name}
                    </span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                      {row.votes} suffrages · {row.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div
                    className={`h-2.5 w-full overflow-hidden rounded-full ${
                      isDark ? 'bg-slate-800' : 'bg-slate-100'
                    }`}
                  >
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, row.percentage))}%` }}
                    />
                  </div>
                </li>
              ))}
          </ul>
        </section>
      )}

      <div className="mt-8">
        <Link
          to="/"
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition ${
            isDark
              ? 'border-slate-600 bg-slate-950 text-slate-200 hover:bg-slate-800'
              : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Home size={16} />
          Retour a l accueil
        </Link>
      </div>
    </main>
  )
}
