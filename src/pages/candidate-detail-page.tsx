import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Users,
  Target,
  Medal,
  ShieldCheck,
  Calendar,
  ShareNetwork,
  ArrowRight,
  WhatsappLogo,
  InstagramLogo,
  LinkedinLogo,
  Copy,
  X,
} from '@phosphor-icons/react'
import { useActiveScrutinQuery } from '../modules/student-vote/hooks'
import { CardShell } from '../shared/ui/CardShell'
import { Button, ButtonLink } from '../shared/ui/Button'
import { useToastStore } from '../shared/ui/toast-store'
import { Backdrop, LoadingBlock } from '../shared/ui/backdrop'
import { EASE_OUT } from '../shared/ui/motion-presets'

type TabId = 'vision' | 'programme' | 'membres'

const endFmt = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
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

  const [activeTab, setActiveTab] = useState<TabId>('vision')
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

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'vision', label: 'Vision', icon: <Target size={16} weight="duotone" /> },
    { id: 'programme', label: 'Programme', icon: <Medal size={16} weight="duotone" /> },
    { id: 'membres', label: 'Membres', icon: <Users size={16} weight="duotone" /> },
  ]

  const tabVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
    transition: { duration: 0.3, ease: EASE_OUT },
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

  const fadeIn = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE_OUT, delay },
  })

  if (isLoading) {
    return <LoadingBlock label="Chargement de la liste…" />
  }

  if (!candidate) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-inset ring-slate-200 dark:bg-white/[0.04] dark:ring-white/10">
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

  return (
    <div className="relative isolate">
      <Backdrop pattern="dots" />

      <div className="section-container relative py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="mb-6 sm:mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 rounded-full py-1 pr-3 text-sm font-medium text-slate-500 transition-colors hover:text-slate-950 dark:hover:text-white"
          >
            <span className="flex size-8 items-center justify-center rounded-full ring-1 ring-inset ring-slate-200 transition-transform duration-300 group-hover:-translate-x-0.5 dark:ring-white/10">
              <ArrowLeft size={14} weight="bold" />
            </span>
            Retour
          </button>
        </motion.div>

        <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-8 lg:col-span-8 sm:space-y-10">
            <motion.div {...fadeIn()}>
              <div className="rounded-3xl border border-slate-200/80 bg-white p-1.5 shadow-lift dark:border-white/[0.08] dark:bg-night-900/70">
                <div className="relative aspect-video w-full overflow-hidden rounded-[1.25rem] bg-slate-100 dark:bg-night-800">
                  {candidate.videoUrl ? (
                    <video src={candidate.videoUrl} controls playsInline preload="metadata" className="h-full w-full object-cover" />
                  ) : candidate.imageUrl ? (
                    <img src={candidate.imageUrl} className="h-full w-full object-cover" alt={candidate.name} />
                  ) : (
                    <div className="bg-grid flex h-full w-full items-center justify-center">
                      <Users size={56} weight="thin" className="text-slate-300 dark:text-white/20" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeIn(0.08)}>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {candidate.order ? (
                  <span className="rounded-full bg-slate-900/[0.04] px-2.5 py-1 font-mono text-xs text-slate-600 ring-1 ring-inset ring-slate-900/[0.06] dark:bg-white/[0.05] dark:text-slate-300 dark:ring-white/10">
                    Liste #{String(candidate.order).padStart(2, '0')}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-aqua-500/10 px-2.5 py-1 text-xs font-medium text-aqua-700 ring-1 ring-inset ring-aqua-500/20 dark:text-aqua-300">
                  <ShieldCheck size={14} weight="fill" /> Liste validée
                </span>
              </div>

              <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-slate-950 dark:text-white lg:text-5xl">
                {candidate.name}
              </h1>

              {candidate.slogan && (
                <p className="mt-4 border-l-2 border-aqua-400/60 pl-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300 sm:text-xl">
                  « {candidate.slogan} »
                </p>
              )}

              <div className="mt-10">
                <div
                  role="tablist"
                  aria-label="Informations de la liste"
                  className="sticky top-20 z-20 mb-6 flex w-full items-center gap-1 rounded-full border border-slate-200/80 bg-white/80 p-1 backdrop-blur-xl dark:border-white/10 dark:bg-night-900/80 sm:relative sm:top-0 sm:w-fit"
                >
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      id={`tab-${tab.id}`}
                      aria-selected={activeTab === tab.id}
                      aria-controls={`panel-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors duration-300 sm:flex-none sm:px-5 ${
                        activeTab === tab.id
                          ? 'text-slate-950 dark:text-white'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {activeTab === tab.id && (
                        <motion.span
                          layoutId="candidate-tab"
                          className="absolute inset-0 rounded-full bg-slate-900/[0.05] ring-1 ring-inset ring-slate-900/[0.06] dark:bg-white/[0.08] dark:ring-white/10"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10 shrink-0">{tab.icon}</span>
                      <span className="relative z-10 truncate">{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="min-h-[200px]" role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
                  <AnimatePresence mode="wait">
                    {activeTab === 'vision' && (
                      <motion.div key="vision" {...tabVariants}>
                        <CardShell className="!p-6">
                          <p className="whitespace-pre-line text-base leading-relaxed text-slate-600 dark:text-slate-400">
                            {candidate.description || "Aucune description détaillée n'a été fournie pour le moment."}
                          </p>
                        </CardShell>
                      </motion.div>
                    )}

                    {activeTab === 'programme' && (
                      <motion.div key="programme" {...tabVariants}>
                        {candidate.actionPlan && candidate.actionPlan.length > 0 ? (
                          <ol className="grid gap-3 sm:grid-cols-2">
                            {candidate.actionPlan.map((item, i) => (
                              <li
                                key={i}
                                className="group flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-aqua-400/50 dark:border-white/[0.07] dark:bg-night-900/60"
                              >
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs text-slate-600 transition-colors duration-300 group-hover:bg-aqua-500 group-hover:text-white dark:bg-white/[0.05] dark:text-slate-300">
                                  {i + 1}
                                </span>
                                <span className="pt-0.5 text-sm leading-snug text-slate-700 dark:text-slate-300">{item}</span>
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-300 py-14 text-center dark:border-white/10">
                            <p className="text-sm text-slate-500">Aucun programme d'action renseigné.</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === 'membres' && (
                      <motion.div key="membres" {...tabVariants}>
                        {candidate.members && candidate.members.length > 0 ? (
                          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {candidate.members.map((member, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-soft dark:border-white/[0.07] dark:bg-night-900/60"
                              >
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/15 to-aqua-400/15 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-500/15 dark:text-aqua-200">
                                  {initials(member.name) || <Users size={16} />}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-slate-950 dark:text-white">{member.name}</p>
                                  <p className="truncate text-xs text-slate-500">{member.role}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-300 py-14 text-center dark:border-white/10">
                            <p className="text-sm text-slate-500">Aucun membre renseigné.</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:col-span-4">
            <motion.div {...fadeIn(0.2)}>
              <div className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-night-950 p-6 text-white shadow-lift">
                <div className="dark">
                  <Backdrop pattern="grid" glow />
                </div>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-aqua-400/60 to-transparent" aria-hidden />
                <div className="relative">
                  <div className="mb-6 flex size-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <Calendar size={20} weight="duotone" className="text-aqua-300" />
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight">{scrutin?.title || 'Vote'}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {endsLabel ? (
                      <>
                        Le vote est ouvert jusqu'au <span className="text-white">{endsLabel}</span>. Faites entendre votre
                        voix.
                      </>
                    ) : (
                      'Faites entendre votre voix.'
                    )}
                  </p>

                  <ButtonLink
                    to="/vote"
                    size="lg"
                    className="mt-7 w-full !bg-white !text-night-950"
                    trailing={<ArrowRight size={16} weight="bold" />}
                  >
                    Voter pour cette liste
                  </ButtonLink>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeIn(0.28)}>
              <Button variant="ghost" size="lg" onClick={handleShare} className="w-full" leading={<ShareNetwork size={16} />}>
                Partager ce profil
              </Button>
            </motion.div>
          </aside>
        </div>
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
              className="relative w-full max-w-md"
            >
              <CardShell className="!p-6 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.35)] dark:!bg-night-900">
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
                      className="group flex flex-col items-center gap-2.5 rounded-2xl border border-slate-200/80 p-4 transition-[border-color,background-color] hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.07] dark:hover:bg-white/[0.04]"
                    >
                      <span className="transition-transform duration-300 group-hover:scale-110">{link.icon}</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">{link.name}</span>
                    </a>
                  ))}
                </div>

                <div className="space-y-2">
                  <label htmlFor="share-url" className="tt-label">Ou copier le lien</label>
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
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-night-950"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </CardShell>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
