import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
  Copy
} from '@phosphor-icons/react'
import { useActiveScrutinQuery } from '../modules/student-vote/hooks'
import { CardShell } from '../shared/ui/CardShell'
import { Button } from '../shared/ui/Button'
import { useToastStore } from '../shared/ui/toast-store'

export function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { pushToast } = useToastStore()
  const { data: scrutin, isLoading } = useActiveScrutinQuery()
  
  const candidate = scrutin?.candidateLists.find(l => l.id === id)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

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
    // Fallback if no native share or error
    setIsShareModalOpen(true)
  }

  const [activeTab, setActiveTab] = useState<'vision' | 'programme' | 'membres'>('vision')
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  const tabs = [
    { id: 'vision', label: 'Vision', icon: <Target size={18} weight="duotone" /> },
    { id: 'programme', label: 'Programme', icon: <Medal size={18} weight="duotone" /> },
    { id: 'membres', label: 'Membres', icon: <Users size={18} weight="duotone" /> },
  ]

  const tabVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] as const }
  }

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: <WhatsappLogo size={24} weight="fill" className="text-[#25D366]" />,
      url: `https://wa.me/?text=${encodeURIComponent(
        `Découvrez le programme de la liste "${candidate?.name}" pour l'élection UCAO 2026 ! ${window.location.href}`
      )}`,
    },
    {
      name: 'Instagram',
      icon: <InstagramLogo size={24} weight="fill" className="text-[#E4405F]" />,
      url: `https://www.instagram.com/`, 
    },
    {
      name: 'LinkedIn',
      icon: <LinkedinLogo size={24} weight="fill" className="text-[#0077B5]" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
    },
  ]

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(window.location.href)
    pushToast('Lien du profil copié !', 'success')
  }

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] as const }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin border-2 border-slate-200 border-t-brand-600 dark:border-white/10 dark:border-t-brand-500 rounded-full" />
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Candidature introuvable</h2>
        <p className="mt-4 text-slate-500 dark:text-slate-400">Le profil demandé n'existe pas ou a été retiré.</p>
        <Link to="/" className="mt-10">
          <Button variant="ghost">Retour à l'accueil</Button>
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-[100dvh] bg-white dark:bg-night-950 relative overflow-hidden">
      {/* Background visual flair */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] size-[40%] bg-brand-600/5 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[-5%] size-[30%] bg-brand-400/5 blur-[100px] rounded-full" />
      </div>

      <div className="section-container relative z-10 py-8 sm:py-12 lg:py-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 sm:mb-8"
        >
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-500 ease-premium"
          >
            <div className="flex size-7 sm:size-8 items-center justify-center rounded-full bg-slate-50 dark:bg-white/5 ring-1 ring-slate-900/5 dark:ring-white/5 transition-transform group-hover:-translate-x-1">
              <ArrowLeft size={14} weight="bold" />
            </div>
            Retour
          </button>
        </motion.div>

        <div className="grid gap-8 lg:gap-12 lg:grid-cols-12 items-start">
          <div className="lg:col-span-8 space-y-8 sm:space-y-10">
            <motion.div {...fadeIn}>
              {/* Double-Bezel Architecture for the main asset */}
              <div className="p-1 sm:p-1.5 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-50 dark:bg-white/5 ring-1 ring-slate-900/[0.05] dark:ring-white/[0.05] shadow-sm">
                <div className="relative aspect-video w-full overflow-hidden rounded-[calc(1.5rem-0.25rem)] sm:rounded-[calc(2rem-0.375rem)] bg-brand-950 shadow-inner-highlight">
                  {candidate.videoUrl ? (
                    <video src={candidate.videoUrl} controls className="h-full w-full object-cover" />
                  ) : candidate.imageUrl ? (
                    <img src={candidate.imageUrl} className="h-full w-full object-cover" alt={candidate.name} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-brand-950/10">
                      <Users size={64} weight="light" className="text-brand-950/20 dark:text-white/20" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.1 }}>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <span className="text-[9px] sm:tt-overline-sm bg-brand-50 dark:bg-brand-900/20 px-2.5 py-1 rounded-full text-brand-700 dark:text-brand-400 border border-brand-100 dark:border-brand-900/30">
                  Liste #{candidate.order}
                </span>
                <span className="flex items-center gap-1 text-[9px] sm:tt-overline-sm text-emerald-600 dark:text-emerald-500">
                  <ShieldCheck size={16} weight="fill" /> Profil Vérifié
                </span>
              </div>
              
              <h1 className="text-3xl sm:tt-page-title sm:text-4xl lg:text-5xl tracking-tight leading-[1.1] font-display font-semibold text-slate-900 dark:text-white">
                {candidate.name}
              </h1>
              
              <div className="mt-4 sm:mt-6 flex items-start gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl text-brand-600 dark:text-brand-400 font-display opacity-50">“</span>
                <p className="text-base sm:text-xl font-medium text-slate-600 dark:text-slate-300 italic font-display leading-relaxed">
                  {candidate.slogan}
                </p>
                <span className="text-xl sm:text-2xl text-brand-600 dark:text-brand-400 font-display opacity-50 self-end">”</span>
              </div>
               
              <div className="mt-8 sm:mt-10">
                <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-50/80 dark:bg-white/5 backdrop-blur-md border border-slate-200/50 dark:border-white/10 w-full sm:w-fit mb-6 sm:mb-8 sticky top-4 sm:relative z-20">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`relative flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-2 rounded-xl text-[10px] sm:text-sm font-bold transition-all duration-500 ${
                        activeTab === tab.id 
                          ? 'text-brand-600 dark:text-white' 
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                    >
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-white dark:bg-white/10 rounded-xl shadow-sm ring-1 ring-slate-900/[0.05] dark:ring-white/[0.05]"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 shrink-0">{tab.icon}</span>
                      <span className="relative z-10 truncate">{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="min-h-[200px]">
                  <AnimatePresence mode="wait">
                    {activeTab === 'vision' && (
                      <motion.div
                        key="vision"
                        {...tabVariants}
                      >
                        <div className="p-1 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-50/50 dark:bg-white/[0.02] ring-1 ring-slate-900/[0.05] dark:ring-white/[0.05]">
                          <div className="relative overflow-hidden rounded-[calc(1.5rem-0.25rem)] sm:rounded-[calc(2rem-0.25rem)] bg-white dark:bg-night-900 p-5 sm:p-6 shadow-sm border border-slate-100 dark:border-white/5">
                            <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400 font-sans">
                              {candidate.description || "Aucune description détaillée n'a été fournie pour le moment."}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'programme' && (
                      <motion.div
                        key="programme"
                        {...tabVariants}
                      >
                        {candidate.actionPlan && candidate.actionPlan.length > 0 ? (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {candidate.actionPlan.map((item, i) => (
                              <motion.div
                                key={i}
                                whileHover={{ y: -2 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="p-1 rounded-xl bg-slate-50 dark:bg-white/5 ring-1 ring-slate-900/[0.05] dark:ring-white/[0.05]"
                              >
                                <div className="h-full rounded-[calc(0.75rem+0.25rem)] bg-white dark:bg-night-900 p-4 shadow-sm border border-slate-100 dark:border-white/5 group hover:border-brand-600/30 transition-colors duration-500">
                                  <div className="flex items-start gap-3">
                                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-white/5 text-[10px] font-bold text-brand-600 ring-1 ring-slate-900/[0.05] dark:ring-white/[0.05] group-hover:bg-brand-600 group-hover:text-white transition-all duration-500">
                                      {i + 1}
                                    </span>
                                    <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-snug pt-1">{item}</span>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-12 sm:py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                            <p className="text-xs sm:text-sm text-slate-400 italic">Aucun programme d'action renseigné.</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === 'membres' && (
                      <motion.div
                        key="membres"
                        {...tabVariants}
                      >
                        <div className="grid gap-3 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3">
                          {candidate.members?.map((member, i) => (
                            <div key={i} className="p-1 rounded-xl bg-slate-50 dark:bg-white/5 ring-1 ring-slate-900/[0.05] dark:ring-white/[0.05]">
                              <div className="flex items-center gap-3 p-3 rounded-[calc(0.75rem+0.25rem)] bg-white dark:bg-night-900 shadow-sm border border-slate-100 dark:border-white/5">
                                <div className="size-8 sm:size-9 rounded-lg bg-slate-50 dark:bg-night-950 border border-slate-100 dark:border-white/10 flex items-center justify-center">
                                  <Users size={16} weight="light" className="text-slate-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white truncate">{member.name}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{member.role}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>

          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.3 }}>
              <div className="p-1 rounded-[1.5rem] sm:rounded-[2rem] bg-brand-600 ring-1 ring-brand-700 shadow-xl shadow-brand-500/20">
                <div className="relative overflow-hidden rounded-[calc(1.5rem-0.25rem)] sm:rounded-[calc(2rem-0.25rem)] bg-brand-600 p-5 sm:p-6 text-white">
                  <div className="absolute -right-8 -top-8 size-48 rounded-full bg-white/10 blur-3xl" />
                  
                  <div className="relative z-10">
                    <div className="mb-4 sm:mb-6 flex size-10 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
                      <Calendar size={20} weight="duotone" />
                    </div>
                    <h4 className="font-display text-lg sm:text-xl font-semibold mb-2 sm:mb-3 tracking-tight">Scrutin 2026</h4>
                    <p className="text-xs text-white/80 leading-relaxed mb-6 sm:mb-8">
                      Le vote est ouvert jusqu'au 30 Juin 2026 à 18:00. Faites entendre votre voix.
                    </p>
                    
                    <Link to="/vote" className="block">
                      <Button 
                        className="w-full !h-11 sm:!h-12 !rounded-full !bg-white !text-brand-600 hover:!bg-brand-50 !shadow-none !border-none text-xs font-bold" 
                        trailing={
                          <div className="size-6 rounded-full bg-brand-600/10 flex items-center justify-center">
                            <ArrowRight size={14} weight="bold" />
                          </div>
                        }
                      >
                        Voter pour cette liste
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeIn} transition={{ ...fadeIn.transition, delay: 0.4 }}>
              <button 
                onClick={handleShare}
                className="group flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 dark:border-white/10 py-3 text-xs font-bold text-slate-400 dark:text-slate-500 transition-all duration-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white active:scale-[0.98]"
              >
                <ShareNetwork size={18} weight="light" className="text-brand-600 transition-transform group-hover:scale-110" /> 
                Partager ce profil
              </button>
            </motion.div>
          </aside>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2"
            >
              <CardShell className="!p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-display text-2xl font-bold">Partager le profil</h3>
                  <button 
                    onClick={() => setIsShareModalOpen(false)}
                    className="size-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <ArrowRight size={20} className="rotate-180" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  {shareLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-brand-600/30 transition-all group"
                    >
                      <div className="transition-transform group-hover:scale-110">
                        {link.icon}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{link.name}</span>
                    </a>
                  ))}
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ou copier le lien</p>
                  <div className="flex gap-2 p-2 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <input 
                      readOnly 
                      value={window.location.href}
                      className="flex-1 bg-transparent px-3 text-xs text-slate-500 outline-none"
                    />
                    <button 
                      onClick={copyToClipboard}
                      className="size-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-colors"
                    >
                      <Copy size={18} weight="bold" />
                    </button>
                  </div>
                </div>
              </CardShell>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  )
}
