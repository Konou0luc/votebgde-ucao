import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarBlank,
  Copy,
  Crown,
  InstagramLogo,
  LinkedinLogo,
  ListChecks,
  Quotes,
  ShareNetwork,
  ShieldCheck,
  Target,
  Users,
  WhatsappLogo,
  X,
} from '@phosphor-icons/react'
import { useActiveScrutinQuery } from '../modules/student-vote/hooks'
import type { CandidateListMember } from '../modules/student-vote/types'
import { Button, ButtonLink } from '../shared/ui/Button'
import { useToastStore } from '../shared/ui/toast-store'
import { LoadingBlock } from '../shared/ui/backdrop'
import { Reveal } from '../shared/ui/motion'
import { EASE_OUT } from '../shared/ui/motion-presets'

const endFmt = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** Ordre d'affichage des fonctions dans l'équipe (les autres suivent). */
const ROLE_ORDER = [
  'président',
  'vice-président',
  'secrétaire',
  'secrétaire adjoint',
  'trésorier',
  'trésorier adjoint',
  'commissaire au compte',
]

function roleRank(role: string) {
  const i = ROLE_ORDER.indexOf(role.trim().toLowerCase())
  return i === -1 ? ROLE_ORDER.length : i
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

function Section({ id, icon, title, count, children }: { id: string; icon: ReactNode; title: string; count?: number; children: ReactNode }) {
  return (
    <Reveal>
      <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100 dark:bg-brand-500/15 dark:text-brand-300 dark:ring-brand-400/20">
            {icon}
          </span>
          <h2 id={`${id}-title`} className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {title}
          </h2>
          {count !== undefined && (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs tabular-nums text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
              {count}
            </span>
          )}
        </div>
        {children}
      </section>
    </Reveal>
  )
}

function MemberCard({ member, lead }: { member: CandidateListMember; lead: boolean }) {
  return (
    <li
      className={`flex items-center gap-3 rounded-xl border p-3.5 ${
        lead
          ? 'border-brand-700 bg-brand-600 text-white sm:col-span-2 lg:col-span-1'
          : 'border-slate-200/80 bg-white dark:border-white/[0.07] dark:bg-night-900/60'
      }`}
    >
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
          lead ? 'bg-white text-brand-700' : 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200'
        }`}
      >
        {initials(member.name) || <Users size={16} />}
      </span>
      <div className="min-w-0">
        <p className={`truncate font-medium ${lead ? 'text-white' : 'text-slate-950 dark:text-white'}`}>{member.name}</p>
        <p className={`flex items-center gap-1 truncate text-sm ${lead ? 'text-brand-100' : 'text-slate-500'}`}>
          {lead && <Crown size={13} weight="fill" className="shrink-0 text-white" />}
          {member.role}
        </p>
      </div>
    </li>
  )
}

export function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { pushToast } = useToastStore()
  const { data: scrutin, isLoading } = useActiveScrutinQuery()

  const candidate = scrutin?.candidateLists.find((l) => l.id === id)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  useEffect(() => {
    if (!isShareModalOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsShareModalOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isShareModalOpen])

  async function handleShare() {
    const shareData = {
      title: `VoteBGDE — ${candidate?.name}`,
      text: `Découvrez le programme de la liste "${candidate?.name}" pour l'élection UCAO 2026 !`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (error) {
        console.error('Erreur lors du partage natif :', error)
      }
    }
    // Repli si pas de partage natif ou erreur
    setIsShareModalOpen(true)
  }

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: <WhatsappLogo size={22} weight="fill" className="text-[#25D366]" />,
      url: `https://wa.me/?text=${encodeURIComponent(
        `Découvrez le programme de la liste "${candidate?.name}" pour l'élection UCAO 2026 ! ${window.location.href}`,
      )}`,
    },
    {
      name: 'Instagram',
      icon: <InstagramLogo size={22} weight="fill" className="text-[#E4405F]" />,
      url: `https://www.instagram.com/`,
    },
    {
      name: 'LinkedIn',
      icon: <LinkedinLogo size={22} weight="fill" className="text-[#0077B5]" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
    },
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      pushToast('Lien du profil copié !', 'success')
    } catch {
      pushToast('Impossible de copier le lien.', 'error')
    }
  }

  if (isLoading) {
    return <LoadingBlock label="Chargement de la liste…" />
  }

  if (!candidate) {
    return (
      <div className="section-container flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 dark:bg-brand-500/15 dark:text-brand-300 dark:ring-brand-400/20">
          <Users size={26} />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Candidature introuvable</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">Le profil demandé n'existe pas ou a été retiré.</p>
        <ButtonLink to="/" variant="ghost" className="mt-8">
          Retour à l'accueil
        </ButtonLink>
      </div>
    )
  }

  const endsAt = scrutin?.endsAt ? new Date(scrutin.endsAt) : null
  const endsLabel = endsAt && !Number.isNaN(endsAt.getTime()) ? endFmt.format(endsAt) : null
  const members = [...(candidate.members ?? [])].sort((a, b) => roleRank(a.role) - roleRank(b.role))
  const plan = candidate.actionPlan ?? []
  const description = candidate.description?.trim()
  const hasDetails = Boolean(description) || plan.length > 0 || members.length > 0
  const others = (scrutin?.candidateLists ?? []).filter((l) => l.id !== candidate.id).sort((a, b) => (a.order || 0) - (b.order || 0))
  const number = String(candidate.order || 1).padStart(2, '0')

  const sectionLinks = [
    description && { href: '#vision', label: 'Vision' },
    plan.length > 0 && { href: '#programme', label: 'Programme' },
    members.length > 0 && { href: '#equipe', label: 'Équipe' },
  ].filter(Boolean) as { href: string; label: string }[]

  return (
    <div className="pb-16">
      {/* ─── En-tête ─── */}
      <div className="border-b border-slate-200/70 bg-white dark:border-white/[0.06] dark:bg-night-900/40">
        <div className="section-container py-6 md:py-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-950 dark:hover:text-white"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Retour
          </button>

          <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Média */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT }}
              className="lg:col-span-7"
            >
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200/80 bg-brand-700 shadow-lift dark:border-white/10">
                {candidate.videoUrl ? (
                  <video
                    src={candidate.videoUrl}
                    poster={candidate.imageUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full bg-black object-cover"
                  />
                ) : candidate.imageUrl ? (
                  <img src={candidate.imageUrl} className="h-full w-full object-cover" alt={candidate.name} />
                ) : (
                  // Pas de média : visuel aux couleurs UCAO plutôt qu'un bloc vide
                  <div className="relative flex h-full w-full items-center justify-center">
                    <div className="bg-grid absolute inset-0 opacity-40 [--grid-color:rgba(255,255,255,0.08)]" aria-hidden />
                    <span className="relative text-[clamp(4rem,12vw,8rem)] font-semibold tracking-tighter text-white/90">
                      {initials(candidate.name)}
                    </span>
                    <span className="absolute bottom-4 left-4 rounded-md bg-crimson-700 px-2 py-1 font-mono text-xs text-white">
                      Liste n°{number}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Identité */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: EASE_OUT }}
              className="lg:col-span-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-crimson-700 px-2 py-1 font-mono text-xs text-white">Liste n°{number}</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">
                  <ShieldCheck size={13} weight="fill" /> Liste validée
                </span>
              </div>

              <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-slate-950 dark:text-white md:text-5xl">
                {candidate.name}
              </h1>

              {candidate.slogan && (
                <p className="mt-4 flex gap-2 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                  <Quotes size={20} weight="fill" className="mt-1 shrink-0 text-crimson-700 dark:text-crimson-500" />
                  {candidate.slogan}
                </p>
              )}

              {(members.length > 0 || plan.length > 0) && (
                <dl className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200/80 px-4 py-3 dark:border-white/[0.08]">
                    <dt className="text-xs text-slate-500">Membres</dt>
                    <dd className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-950 dark:text-white">{members.length}</dd>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 px-4 py-3 dark:border-white/[0.08]">
                    <dt className="text-xs text-slate-500">Engagements</dt>
                    <dd className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-950 dark:text-white">{plan.length}</dd>
                  </div>
                </dl>
              )}

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <ButtonLink to="/vote" size="lg" variant="accent" className="sm:flex-1" trailing={<ArrowRight size={16} weight="bold" />}>
                  Voter pour cette liste
                </ButtonLink>
                <Button variant="ghost" size="lg" onClick={handleShare} leading={<ShareNetwork size={16} />}>
                  Partager
                </Button>
              </div>

              {endsLabel && (
                <p className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <CalendarBlank size={16} className="shrink-0" />
                  {scrutin?.title ? `${scrutin.title} · ` : ''}vote ouvert jusqu'au{' '}
                  <span className="font-medium text-slate-900 dark:text-white">{endsLabel}</span>
                </p>
              )}
            </motion.div>
          </div>
        </div>

        {/* Navigation interne */}
        {sectionLinks.length > 1 && (
          <nav aria-label="Sections de la liste" className="section-container">
            <ul className="-mb-px flex gap-6 overflow-x-auto text-sm">
              {sectionLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="inline-block border-b-2 border-transparent pb-3 font-medium text-slate-500 transition-colors hover:border-brand-600 hover:text-slate-950 dark:hover:border-brand-400 dark:hover:text-white"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* ─── Contenu ─── */}
      <div className="section-container space-y-12 pt-10 md:space-y-14 md:pt-14">
        {!hasDetails && (
          <p className="rounded-xl border border-dashed border-slate-300 px-5 py-6 text-center text-sm text-slate-500 dark:border-white/10">
            Cette liste n’a pas encore publié de présentation détaillée.
          </p>
        )}

        {description && (
          <Section id="vision" icon={<Target size={18} weight="duotone" />} title="Notre vision">
            <p className="max-w-3xl whitespace-pre-line text-base leading-relaxed text-slate-700 dark:text-slate-300 md:text-lg">
              {description}
            </p>
          </Section>
        )}

        {plan.length > 0 && (
          <Section id="programme" icon={<ListChecks size={18} weight="duotone" />} title="Programme" count={plan.length}>
            <ol className="grid gap-3 md:grid-cols-2">
              {plan.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 rounded-xl border border-slate-200/80 bg-white p-4 dark:border-white/[0.07] dark:bg-night-900/60"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-crimson-700 font-mono text-sm text-white">
                    {i + 1}
                  </span>
                  <p className="pt-1 text-[15px] leading-snug text-slate-700 dark:text-slate-300">{item}</p>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {members.length > 0 && (
          <Section id="equipe" icon={<Users size={18} weight="duotone" />} title="L'équipe" count={members.length}>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((m, i) => (
                <MemberCard key={`${m.name}-${i}`} member={m} lead={i === 0 && roleRank(m.role) === 0} />
              ))}
            </ul>
          </Section>
        )}

        {others.length > 0 && (
          <Reveal>
            <section aria-labelledby="autres-titre" className="border-t border-slate-200/70 pt-10 dark:border-white/[0.06]">
              <div className="mb-5 flex items-end justify-between gap-4">
                <h2 id="autres-titre" className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  Les autres listes
                </h2>
                <Link to="/vote" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">
                  Aller voter
                </Link>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {others.map((l) => (
                  <li key={l.id}>
                    <Link
                      to={`/candidat/${l.id}`}
                      className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 transition-colors hover:border-brand-300 dark:border-white/[0.07] dark:bg-night-900/60 dark:hover:border-brand-400/50"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-600 text-sm font-semibold text-white">
                        {l.imageUrl ? <img src={l.imageUrl} alt="" className="h-full w-full object-cover" /> : initials(l.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-slate-950 dark:text-white">{l.name}</span>
                        {l.slogan && <span className="block truncate text-sm text-slate-500">« {l.slogan} »</span>}
                      </span>
                      <ArrowUpRight size={16} className="shrink-0 text-slate-400 transition-colors group-hover:text-brand-600" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        )}
      </div>

      {/* Modale de partage */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm dark:bg-black/60"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-title"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ type: 'spring', damping: 30, stiffness: 420 }}
              className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-night-900"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 id="share-title" className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                  Partager le profil
                </h3>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  aria-label="Fermer"
                  className="flex size-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mb-6 grid grid-cols-3 gap-3">
                {shareLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center gap-2.5 rounded-xl border border-slate-200/80 p-4 transition-colors hover:border-brand-300 hover:bg-slate-50 dark:border-white/[0.07] dark:hover:bg-white/[0.04]"
                  >
                    <span className="transition-transform duration-300 group-hover:scale-110">{link.icon}</span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{link.name}</span>
                  </a>
                ))}
              </div>

              <div className="space-y-2">
                <label htmlFor="share-url" className="tt-label">
                  Ou copier le lien
                </label>
                <div className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 dark:border-white/10 dark:bg-white/[0.03]">
                  <input
                    id="share-url"
                    readOnly
                    value={window.location.href}
                    onFocus={(e) => e.currentTarget.select()}
                    className="min-w-0 flex-1 bg-transparent px-2 font-mono text-xs text-slate-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    aria-label="Copier le lien"
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition-colors hover:bg-brand-700"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
