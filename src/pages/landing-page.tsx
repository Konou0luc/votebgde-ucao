import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  Users,
  ShieldCheck,
  ListChecks,
  CheckCircle,
  Fingerprint,
  EnvelopeSimple,
  LockKey,
  Eye,
  CalendarBlank,
  Timer,
} from '@phosphor-icons/react'
import { useActiveScrutinQuery } from '../modules/student-vote/hooks'
import type { ActiveScrutin } from '../modules/student-vote/types'
import campusPhoto from '../../assets/ucao-rassemblement.jpeg'
import { HeroSection } from '../shared/ui/HeroSection'
import { ButtonAnchor, ButtonLink } from '../shared/ui/Button'
import { SpotlightCard } from '../shared/ui/spotlight-card'
import { Reveal, RevealGroup, RevealItem } from '../shared/ui/motion'
import { EASE_OUT } from '../shared/ui/motion-presets'
import { Backdrop } from '../shared/ui/backdrop'
import { voteStatusLabelPublic } from '../shared/utils/election-status-fr'

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

function formatDate(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : dateFmt.format(d)
}

const steps = [
  { title: 'Identification', desc: 'Entrez votre matricule et votre e-mail.', icon: Fingerprint },
  { title: 'Vérification', desc: 'Saisissez le code reçu par e-mail.', icon: EnvelopeSimple },
  { title: 'Choix', desc: 'Choisissez la liste pour laquelle vous votez.', icon: ListChecks },
  { title: 'Confirmation', desc: 'Validez : votre vote est enregistré et reste secret.', icon: CheckCircle },
]

const pillars = [
  {
    icon: LockKey,
    title: 'Votre vote reste secret',
    desc: 'Votre matricule sert seulement à vérifier que vous pouvez voter. Personne ne peut savoir pour quelle liste vous avez voté.',
  },
  {
    icon: EnvelopeSimple,
    title: 'Un code par e-mail',
    desc: 'Vous recevez un code à 6 chiffres sur votre e-mail pour confirmer que c’est bien vous qui votez.',
  },
  {
    icon: Eye,
    title: 'Résultats visibles par tous',
    desc: 'À la fin du vote, les résultats sont affichés sur le site et chacun peut les consulter.',
  },
]

export function LandingPage() {
  const { data: activeScrutin, isLoading } = useActiveScrutinQuery()
  const lists = activeScrutin ? [...activeScrutin.candidateLists].sort((a, b) => (a.order || 0) - (b.order || 0)) : []

  return (
    <div className="w-full">
      {/* ─── Hero ─── */}
      <HeroSection>
        <div className="section-container flex flex-col items-center justify-center pb-20 pt-32 text-center md:min-h-[min(80dvh,760px)] md:pb-24 md:pt-40">
          <RevealGroup immediate step={0.09} className="flex flex-col items-center">
            <RevealItem>
              <Link to={activeScrutin ? '/vote' : '/inscription'} className="eyebrow group transition-colors hover:border-slate-300 dark:hover:border-white/20">
                <span className="relative flex size-2">
                  {activeScrutin && (
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-crimson-500 opacity-70" />
                  )}
                  <span className={`relative inline-flex size-2 rounded-full ${activeScrutin ? 'bg-crimson-500' : 'bg-slate-400'}`} />
                </span>
                {isLoading
                  ? 'Chargement du vote…'
                  : activeScrutin
                    ? `Vote ${voteStatusLabelPublic(activeScrutin.status).toLowerCase()} · ${activeScrutin.title}`
                    : 'Inscriptions ouvertes · aucun vote en cours'}
                <ArrowRight size={12} className="text-slate-400 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </RevealItem>

            <RevealItem>
              <h1 className="mt-8 max-w-4xl text-[clamp(2.75rem,8vw,5.75rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-slate-950 dark:text-white">
                Votre voix,
                <br />
                <span className="text-gradient">notre futur.</span>
              </h1>
            </RevealItem>

            <RevealItem>
              <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-400 md:text-lg">
                Participez à la construction de l'UCAO de demain. Un vote{' '}
                <span className="font-medium text-slate-900 dark:text-white">sécurisé</span>,{' '}
                <span className="font-medium text-slate-900 dark:text-white">secret</span> et accessible en moins de deux minutes.
              </p>
            </RevealItem>

            <RevealItem className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
              <ButtonLink
                to={activeScrutin ? '/vote' : '/inscription'}
                size="lg"
                className="w-full sm:w-auto"
                trailing={<ArrowRight size={16} weight="bold" />}
              >
                {activeScrutin ? 'Voter maintenant' : "S'inscrire maintenant"}
              </ButtonLink>
              {lists.length > 0 ? (
                <ButtonAnchor href="#candidats" variant="ghost" size="lg" className="w-full sm:w-auto">
                  Découvrir les listes
                </ButtonAnchor>
              ) : (
                <ButtonLink to="/resultats" variant="ghost" size="lg" className="w-full sm:w-auto">
                  Voir les résultats
                </ButtonLink>
              )}
            </RevealItem>
          </RevealGroup>

          {activeScrutin ? (
            <ScrutinPanel scrutin={activeScrutin} listCount={lists.length} />
          ) : (
            !isLoading && (
              <motion.ul
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: EASE_OUT }}
                className="mt-12 grid w-full max-w-3xl gap-3 sm:grid-cols-3"
              >
                {[
                  { icon: LockKey, label: 'Votre vote reste secret' },
                  { icon: EnvelopeSimple, label: 'Code reçu par e-mail' },
                  { icon: Timer, label: 'Moins de 2 minutes' },
                ].map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm text-slate-700 backdrop-blur-md dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300"
                  >
                    <Icon size={18} weight="duotone" className="shrink-0 text-crimson-700 dark:text-crimson-500" />
                    {label}
                  </li>
                ))}
              </motion.ul>
            )
          )}
        </div>
      </HeroSection>

      {/* ─── Garanties ─── */}
      <section className="relative py-16 md:py-24">
        <div className="section-container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="tt-overline">Vos garanties</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-5xl">
              Un vote simple, sûr et secret.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600 dark:text-slate-400 md:text-lg">
              À chaque étape, votre vote est protégé et personne ne peut savoir pour qui vous avez voté.
            </p>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-4 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, desc }) => (
              <RevealItem key={title}>
                <SpotlightCard className="h-full p-7">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 dark:bg-brand-500/15 dark:text-brand-300 dark:ring-brand-400/20">
                    <Icon size={22} weight="duotone" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{desc}</p>
                </SpotlightCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ─── Processus ─── */}
      <section className="relative overflow-hidden border-y border-slate-200/70 bg-white py-16 dark:border-white/[0.06] dark:bg-night-900/40 md:py-24">
        <div className="bg-dots mask-radial pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <div className="section-container relative grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Reveal className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 shadow-lift dark:border-white/10">
              <img
                src={campusPhoto}
                alt="Étudiants rassemblés sur le campus de l'UCAO"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover sm:aspect-[4/3] lg:aspect-[4/5]"
              />
              <div className="absolute inset-0 bg-night-950/20" />
              <div className="absolute inset-x-5 bottom-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-brand-950/85 p-4 text-white backdrop-blur-md">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-crimson-700 text-white">
                  <Timer size={20} weight="duotone" />
                </div>
                <p className="text-sm leading-snug text-white/85">
                  Moins de <span className="font-semibold text-white">2 minutes</span> pour faire entendre votre voix.
                </p>
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="tt-overline">Comment voter</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-5xl">
                Voter en <span className="text-gradient">4 étapes simples.</span>
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 dark:text-slate-400 md:text-lg">
                Tout se fait en ligne, depuis votre téléphone ou votre ordinateur, en moins de deux minutes.
              </p>
            </Reveal>

            <RevealGroup step={0.08} className="relative mt-10">
              <div
                className="absolute bottom-6 left-[31px] top-6 w-px bg-slate-200 dark:bg-white/10"
                aria-hidden
              />
              <ol className="space-y-2">
                {steps.map(({ title, desc, icon: Icon }, i) => (
                  <RevealItem key={title}>
                    <li className="relative flex gap-5 rounded-2xl p-3">
                      <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-soft dark:border-white/10 dark:bg-night-900 dark:text-slate-400">
                        <Icon size={18} weight="duotone" />
                      </div>
                      <div className="pt-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-slate-400">0{i + 1}</span>
                          <h3 className="font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h3>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{desc}</p>
                      </div>
                    </li>
                  </RevealItem>
                ))}
              </ol>
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* ─── Listes candidates ─── */}
      {lists.length > 0 && (
        <section id="candidats" className="scroll-mt-24 py-16 md:py-24">
          <div className="section-container">
            <Reveal className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-xl">
                <p className="tt-overline">Le vote</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-5xl">
                  Listes candidates
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400 md:text-lg">
                  Découvrez les programmes et les équipes de chaque liste avant de voter.
                </p>
              </div>
              <ButtonLink to="/vote" variant="ghost" trailing={<ArrowRight size={14} weight="bold" />}>
                Accéder au vote
              </ButtonLink>
            </Reveal>

            <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {lists.map((list, idx) => (
                <RevealItem key={list.id}>
                  <Link
                    to={`/candidat/${list.id}`}
                    className="group block h-full rounded-2xl focus-visible:outline-offset-4"
                  >
                    <SpotlightCard className="flex h-full flex-col p-2 group-hover:-translate-y-1 group-hover:border-brand-300 group-hover:shadow-lift dark:group-hover:border-brand-400/50">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100 dark:bg-night-800">
                        {list.videoUrl ? (
                          <video
                            src={list.videoUrl}
                            className="h-full w-full object-cover"
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            onMouseOver={(e) => void e.currentTarget.play().catch(() => {})}
                            onMouseOut={(e) => e.currentTarget.pause()}
                          />
                        ) : list.imageUrl ? (
                          <img
                            src={list.imageUrl}
                            alt={list.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="bg-grid flex h-full w-full items-center justify-center">
                            <Users size={40} weight="thin" className="text-slate-300 dark:text-white/20" />
                          </div>
                        )}
                        <span className="absolute left-3 top-3 rounded-full border border-white/30 bg-white/80 px-2.5 py-1 font-mono text-[11px] font-medium text-slate-900 backdrop-blur-md dark:bg-night-950/70 dark:text-white">
                          #{String(list.order || idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col px-4 pb-4 pt-5">
                        <h3 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">{list.name}</h3>
                        {list.slogan && (
                          <p className="mt-1.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">« {list.slogan} »</p>
                        )}
                        <div className="mt-auto flex items-center justify-between pt-6 text-sm font-medium text-slate-900 dark:text-white">
                          <span>Découvrir la liste</span>
                          <span className="flex size-8 items-center justify-center rounded-full ring-1 ring-inset ring-slate-200 transition-all duration-300 group-hover:bg-slate-950 group-hover:text-white group-hover:ring-slate-950 dark:ring-white/10 dark:group-hover:bg-white dark:group-hover:text-night-950">
                            <ArrowUpRight size={14} weight="bold" />
                          </span>
                        </div>
                      </div>
                    </SpotlightCard>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ─── Appel à l'action ─── */}
      <section className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-brand-800 bg-brand-700 px-6 py-16 text-center shadow-lift md:px-12 md:py-20">
          <div className="dark">
            <Backdrop pattern="grid" particles forceDark />
          </div>
          <Reveal className="relative">
            <h2 className="mx-auto max-w-2xl text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-white">
              {activeScrutin ? 'Prêt à faire ' : 'Prêt pour le '}
              <span className="underline decoration-crimson-500 decoration-4 underline-offset-[10px]">
                {activeScrutin ? 'votre choix ?' : 'prochain vote ?'}
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-brand-100 md:text-lg">
              {activeScrutin
                ? 'Rejoignez la communauté étudiante de l’UCAO et participez au vote en toute confiance. Le futur du campus commence par votre vote.'
                : 'Inscrivez-vous dès maintenant : seuls les étudiants inscrits et vérifiés pourront voter à l’ouverture du scrutin.'}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink
                to={activeScrutin ? '/vote' : '/inscription'}
                size="lg"
                className="w-full !bg-white !text-brand-800 hover:!bg-brand-50 sm:w-auto"
                trailing={<ArrowRight size={16} weight="bold" />}
              >
                {activeScrutin ? 'Commencer à voter' : "S'inscrire"}
              </ButtonLink>
              <ButtonLink
                to="/resultats"
                variant="outline"
                size="lg"
                className="w-full !text-white !ring-white/30 hover:!bg-white/10 sm:w-auto"
              >
                Voir les résultats
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

function ScrutinPanel({ scrutin, listCount }: { scrutin: ActiveScrutin; listCount: number }) {
  const items = [
    { icon: CalendarBlank, label: 'Début du vote', value: formatDate(scrutin.startsAt) },
    { icon: Timer, label: 'Fin du vote', value: formatDate(scrutin.endsAt) },
    { icon: ListChecks, label: 'Listes candidates', value: String(listCount) },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.45, ease: EASE_OUT }}
      className="mt-12 w-full max-w-3xl rounded-2xl border border-slate-200/80 bg-white/70 p-1.5 shadow-lift backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.03]"
    >
      <div className="rounded-xl border border-slate-200/60 bg-white/80 text-left dark:border-white/[0.06] dark:bg-night-900/70">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200/60 px-5 py-3.5 dark:border-white/[0.06]">
          <div className="flex min-w-0 items-center gap-2.5">
            <ShieldCheck size={16} weight="duotone" className="shrink-0 text-crimson-500" />
            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{scrutin.title}</p>
          </div>
          <span className="shrink-0 rounded-full bg-crimson-700 px-2.5 py-0.5 text-[11px] font-medium text-white">
            {voteStatusLabelPublic(scrutin.status)}
          </span>
        </div>
        <dl className="grid divide-y divide-slate-200/60 dark:divide-white/[0.06] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {items.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-5 py-4">
              <Icon size={18} className="shrink-0 text-slate-400" />
              <div className="min-w-0">
                <dt className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</dt>
                <dd className="mt-0.5 truncate text-sm font-medium tabular-nums text-slate-900 dark:text-white">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </motion.div>
  )
}
