import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Users,
  ShieldCheck,
  CaretRight,
  ListChecks,
  CheckCircle,
  Lightning,
  TrendUp,
} from '@phosphor-icons/react'
import { useActiveScrutinQuery } from '../modules/student-vote/hooks'
import heroCampus from '../../assets/ucao-l1.jpeg'
import { HeroSection } from '../shared/ui/HeroSection'
import { Button } from '../shared/ui/Button'
import { CardShell } from '../shared/ui/CardShell'

export function LandingPage() {
  const { data: activeScrutin } = useActiveScrutinQuery()

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] as const }
  }

  const stagger = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }

  return (
    <main className="w-full">
      {/* Hero Section — Background Image Editorial Design */}
      <HeroSection imageSrc={heroCampus}>
        <div className="section-container pt-12 pb-24 md:pt-32 md:pb-48">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] as const }}
              className="space-y-10"
            >
              <h1 className="font-display leading-[0.9] tracking-tight text-white">
                <span className="block text-[clamp(3rem,10vw,6.5rem)] font-medium">Votre voix,</span>
                <span className="block text-[clamp(3rem,10vw,6.5rem)] font-medium italic text-brand-200">notre futur.</span>
              </h1>

              <p className="max-w-xl text-xl md:text-2xl text-white/80 leading-relaxed font-sans">
                Participez à la construction de l'UCAO de demain. Un système de vote 
                <span className="text-white font-semibold"> certifié</span>, 
                <span className="text-white font-semibold"> anonyme</span> et 
                <span className="text-white font-semibold"> instantané</span>.
              </p>

              <div className="flex flex-wrap gap-5 pt-4">
                <Link to="/vote">
                  <Button
                    className="!h-16 !px-10 !text-lg shadow-xl shadow-brand-500/20"
                    trailing={<ArrowRight size={22} weight="bold" />}
                  >
                    Voter maintenant
                  </Button>
                </Link>
                <a href="#candidats">
                  <Button variant="outline" className="!h-16 !px-10 !text-lg !text-white !border-white/30 !ring-white/20 hover:!bg-white/10">
                    Découvrir les listes
                  </Button>
                </a>
              </div>

              <div className="pt-16 grid grid-cols-2 sm:grid-cols-4 gap-12 border-t border-white/20">
                <div className="space-y-1">
                  <p className="font-display text-4xl font-bold text-white tabular-nums tracking-tighter">2.4k+</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Électeurs</p>
                </div>
                <div className="space-y-1">
                  <p className="font-display text-4xl font-bold text-white tabular-nums tracking-tighter">100%</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Sécurisé</p>
                </div>
                <div className="space-y-1">
                  <p className="font-display text-4xl font-bold text-white tabular-nums tracking-tighter">0.0s</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Latence</p>
                </div>
                <div className="hidden sm:block space-y-1">
                   <div className="flex items-center gap-2 text-brand-200">
                     <TrendUp size={24} weight="bold" />
                     <p className="font-display text-4xl font-bold tabular-nums tracking-tighter">74%</p>
                   </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Participation</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </HeroSection>

      {/* Process Section — Minimalist & Premium */}
      <section className="py-32 bg-white dark:bg-night-950">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-20 xl:gap-32 items-start">
            <motion.div 
              {...fadeIn}
              className="lg:sticky lg:top-40"
            >
              <p className="tt-overline mb-6">L'Expérience de Vote</p>
              <h2 className="font-display text-5xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl leading-[0.95]">
                Un processus <br />
                <span className="text-brand-600 italic">sans friction.</span>
              </h2>
              <p className="mt-8 text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                Nous avons simplifié chaque étape pour garantir une expérience de vote rapide et accessible à tous les étudiants.
              </p>
              <div className="mt-12 flex items-center gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 max-w-sm">
                <div className="size-10 rounded-full bg-brand-600/10 flex items-center justify-center shrink-0">
                  <Lightning size={20} weight="duotone" className="text-brand-600" />
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Moins de <span className="text-slate-900 dark:text-white font-bold">2 minutes</span> pour faire entendre votre voix.
                </p>
              </div>
            </motion.div>

            <motion.div 
              variants={stagger}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="relative"
            >
              {/* Vertical line for the steps */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-100 dark:bg-white/5 hidden sm:block" />

              <div className="space-y-16">
                {[
                  { 
                    step: '01', 
                    title: 'Identification', 
                    desc: 'Connectez-vous avec vos identifiants institutionnels.',
                    icon: <Users size={24} weight="light" />
                  },
                  { 
                    step: '02', 
                    title: 'Vérification', 
                    desc: 'Validez votre identité via un code OTP sécurisé.',
                    icon: <ShieldCheck size={24} weight="light" />
                  },
                  { 
                    step: '03', 
                    title: 'Sélection', 
                    desc: 'Choisissez la liste qui représente vos convictions.',
                    icon: <ListChecks size={24} weight="light" />
                  },
                  { 
                    step: '04', 
                    title: 'Confirmation', 
                    desc: 'Votre vote est crypté et enregistré anonymement.',
                    icon: <CheckCircle size={24} weight="light" />
                  },
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    variants={fadeIn}
                    className="group relative flex flex-col sm:flex-row gap-6 sm:gap-10 items-start"
                  >
                    <div className="relative z-10 flex-shrink-0">
                      <div className="size-12 rounded-full bg-white dark:bg-night-950 border-2 border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:border-brand-600 group-hover:text-brand-600 transition-all duration-500 shadow-sm">
                        {item.icon}
                      </div>
                    </div>
                    <div className="pt-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black text-brand-600/40 uppercase tracking-[0.2em]">{item.step}</span>
                        <div className="h-px w-8 bg-slate-100 dark:bg-white/5" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
                        {item.title}
                      </h3>
                      <p className="text-lg leading-relaxed text-slate-500 dark:text-slate-400 max-w-sm">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Candidate Lists — Asymmetrical Grid with CardShell */}
      {activeScrutin && activeScrutin.candidateLists.length > 0 && (
        <section id="candidats" className="py-32 bg-slate-50 dark:bg-white/[0.01]">
          <div className="section-container">
            <motion.div 
              {...fadeIn}
              className="mb-20 flex flex-col justify-between gap-8 md:flex-row md:items-end"
            >
              <div className="max-w-xl">
                  <p className="tt-overline mb-6">L'Élection</p>
                  <h2 className="font-display text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">Listes candidates</h2>
                <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 leading-relaxed">Découvrez les programmes et les équipes de chaque liste pour faire votre choix en toute conscience.</p>
              </div>
              <Link to="/vote">
                <Button variant="ghost" trailing={<ArrowRight size={16} weight="bold" />}>
                  Accéder au vote
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              variants={stagger}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {activeScrutin.candidateLists.sort((a, b) => (a.order || 0) - (b.order || 0)).map((list, idx) => (
                <motion.div key={list.id} variants={fadeIn}>
                  <Link to={`/candidat/${list.id}`} className="block h-full group">
                    <CardShell className="h-full transition-transform duration-500 group-hover:-translate-y-2">
                      <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-brand-950 dark:bg-slate-900 relative mb-6">
                        {list.videoUrl ? (
                          <video 
                            src={list.videoUrl} 
                            className="h-full w-full object-cover" 
                            muted 
                            loop 
                            onMouseOver={(e) => e.currentTarget.play()}
                            onMouseOut={(e) => e.currentTarget.pause()}
                          />
                        ) : list.imageUrl ? (
                          <img 
                            src={list.imageUrl} 
                            alt={list.name} 
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-brand-950/10">
                            <Users size={48} weight="light" className="text-brand-950/20 dark:text-white/20" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <span className="bg-white/80 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white border border-white/20">
                            #{list.order || idx + 1}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col flex-1">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{list.name}</h3>
                        <p className="mt-2 text-sm font-medium italic text-brand-600/70">« {list.slogan} »</p>
                        
                        <div className="mt-8 pt-6 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
                          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Découvrir la liste</span>
                          <div className="size-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center transition-all group-hover:bg-brand-600 group-hover:border-brand-600 group-hover:text-white">
                            <CaretRight size={16} weight="bold" />
                          </div>
                        </div>
                      </div>
                    </CardShell>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* New CTA Section — Full-Width Impact */}
      <section className="relative py-24 md:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-brand-950 dark:bg-night-950" />
        
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-0 left-0 size-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay opacity-20" />
          <div className="absolute -top-1/2 -right-1/4 size-[1000px] rounded-full bg-brand-600/20 blur-[120px]" />
          <div className="absolute -bottom-1/2 -left-1/4 size-[1000px] rounded-full bg-brand-500/10 blur-[120px]" />
        </div>

        <div className="section-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] as const }}
            >
              <h2 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[0.95] tracking-tight text-white mb-10">
                Prêt à faire <br />
                <span className="italic text-brand-300">votre choix ?</span>
              </h2>
              <p className="text-xl text-white/70 leading-relaxed max-w-lg mb-12">
                Rejoignez la communauté étudiante de l'UCAO et participez au vote en toute confiance. 
                Le futur du campus commence par votre bulletin.
              </p>
              <div className="flex flex-wrap gap-5">
                <Link to="/vote">
                  <Button className="!h-16 !px-10 !text-lg !bg-white !text-brand-950 hover:!bg-brand-50" trailing={<ArrowRight size={20} weight="bold" />}>
                    Commencer à voter
                  </Button>
                </Link>
                <Link to="/resultats">
                  <Button variant="outline" className="!h-16 !px-10 !text-lg !text-white !border-white/30 !ring-white/20 hover:!bg-white/10">
                    Voir les résultats
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] as const }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-square max-w-md ml-auto">
                <div className="absolute inset-0 rounded-[3rem] border border-white/10 rotate-6" />
                <div className="absolute inset-0 rounded-[3rem] border border-white/5 -rotate-3" />
                <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-brand-600/20 to-transparent backdrop-blur-3xl flex items-center justify-center border border-white/20">
                  <div className="text-center space-y-6">
                    <div className="size-24 rounded-3xl bg-white text-brand-600 flex items-center justify-center mx-auto shadow-2xl shadow-brand-500/40">
                      <CheckCircle size={56} weight="duotone" />
                    </div>
                    <div>
                      <p className="text-white font-display text-2xl font-bold">100% Vérifiable</p>
                      <p className="text-white/50 text-sm mt-2">Protocole de vote certifié RSA</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}
