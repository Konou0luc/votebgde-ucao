import { useEffect, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../../../assets/logo.png'
import { Sun, Moon, List, X, ArrowRight, ArrowUpRight, InstagramLogo, LinkedinLogo, ShieldCheck } from '@phosphor-icons/react'
import { getInitialSiteTheme, SiteThemeContext } from './site-theme'
import { ToastViewport } from './toast-viewport'
import { ButtonLink } from './Button'

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/vote', label: 'Voter' },
  { to: '/resultats', label: 'Résultats' },
]

function Brand({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5 rounded-full" aria-label="VoteBGDE — accueil">
      <span
        className={`relative flex items-center justify-center rounded-full bg-white ring-1 ring-slate-200 transition-transform duration-500 group-hover:scale-105 dark:ring-white/15 ${
          size === 'lg' ? 'size-10' : 'size-8'
        }`}
      >
        <img src={logo} alt="" className={`${size === 'lg' ? 'size-7' : 'size-6'} object-contain`} />
      </span>
      <span
        className={`font-semibold tracking-tight text-slate-900 dark:text-white ${size === 'lg' ? 'text-xl' : 'text-[15px]'}`}
      >
        Vote<span className="text-brand-600 dark:text-aqua-300">BGDE</span>
      </span>
    </Link>
  )
}

export function SiteLayout({ children }: PropsWithChildren) {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState(() => getInitialSiteTheme())
  const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > 12)
  const isHome = location.pathname === '/'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Verrouille le scroll + Échap quand le menu mobile est ouvert
  useEffect(() => {
    if (!isMobileMenuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsMobileMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [isMobileMenuOpen])

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    try {
      localStorage.setItem('votebgde-theme', nextTheme)
    } catch {
      /* stockage indisponible */
    }
  }

  return (
    <SiteThemeContext.Provider value={{ theme }}>
      <div className="flex min-h-[100dvh] flex-col bg-[#fafbfd] font-sans antialiased transition-colors duration-500 dark:bg-night-950">
        <div className="grain-overlay" />

        <a
          href="#contenu"
          className="sr-only z-[60] rounded-full bg-slate-950 px-4 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Aller au contenu
        </a>

        {/* Navigation flottante */}
        <header className="pointer-events-none fixed inset-x-0 top-0 z-50 pt-3 md:pt-4">
          <div className="mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto relative flex h-14 w-full items-center justify-between rounded-full border pl-3 pr-2 transition-[background-color,border-color,box-shadow] duration-500 md:pl-4 ${
              scrolled || !isHome
                ? 'border-slate-200/70 bg-white/75 shadow-[0_8px_32px_-12px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-night-900/70 dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]'
                : 'border-transparent bg-transparent'
            }`}
          >
            <Brand />

            <nav aria-label="Navigation principale" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 md:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300 ${
                      isActive
                        ? 'text-slate-950 dark:text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-full bg-slate-900/[0.06] ring-1 ring-inset ring-slate-900/[0.06] dark:bg-white/[0.08] dark:ring-white/10"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10">{link.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex size-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-900/[0.05] hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
                aria-label={theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre'}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={theme}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex"
                  >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  </motion.span>
                </AnimatePresence>
              </button>

              <span className="hidden md:block">
                <ButtonLink to="/vote" size="sm" trailing={<ArrowRight size={14} weight="bold" />}>
                  Voter
                </ButtonLink>
              </span>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((o) => !o)}
                aria-expanded={isMobileMenuOpen}
                aria-controls="menu-mobile"
                aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                className="flex size-9 items-center justify-center rounded-full text-slate-700 ring-1 ring-inset ring-slate-900/10 transition-colors hover:bg-slate-900/[0.04] dark:text-slate-200 dark:ring-white/10 md:hidden"
              >
                {isMobileMenuOpen ? <X size={18} /> : <List size={18} />}
              </button>
            </div>
          </motion.div>
          </div>
        </header>

        {/* Menu mobile */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="menu-mobile"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[45] bg-white/85 backdrop-blur-2xl dark:bg-night-950/90 md:hidden"
            >
              <div className="bg-grid mask-fade-b absolute inset-0 opacity-60" aria-hidden />
              <div className="relative flex h-full flex-col px-6 pb-10 pt-28">
                <nav className="divide-y divide-slate-200/70 dark:divide-white/[0.06]">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <NavLink
                        to={link.to}
                        end={link.to === '/'}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between py-5 text-3xl font-semibold tracking-tight ${
                            isActive ? 'text-slate-950 dark:text-white' : 'text-slate-400 dark:text-slate-500'
                          }`
                        }
                      >
                        {link.label}
                        <ArrowUpRight size={22} className="text-slate-300 dark:text-slate-600" />
                      </NavLink>
                    </motion.div>
                  ))}
                </nav>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mt-auto space-y-4"
                >
                  <ButtonLink to="/vote" size="lg" onClick={() => setIsMobileMenuOpen(false)} className="w-full" trailing={<ArrowRight size={18} weight="bold" />}>
                    Lancer le vote
                  </ButtonLink>
                  <p className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    <ShieldCheck size={14} className="text-aqua-500" /> Votre vote reste secret
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main id="contenu" className={`relative flex-1 ${isHome ? '' : 'pt-20 md:pt-24'}`}>
          {children}
        </main>

        <ToastViewport theme={theme} />

        <footer className="relative overflow-hidden border-t border-slate-200/70 bg-white dark:border-white/[0.06] dark:bg-night-950">
          <div className="bg-dots mask-fade-b pointer-events-none absolute inset-0 opacity-50" aria-hidden />
          <div className="section-container relative py-16 md:py-20">
            <div className="flex flex-col justify-between gap-12 md:flex-row">
              <div className="max-w-sm space-y-5">
                <Brand size="lg" />
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Le site de vote en ligne du BGDE de l'UCAO. Simple, sécurisé, et votre vote reste secret.
                </p>
                <span className="eyebrow">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-aqua-400 opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-aqua-500" />
                  </span>
                  Vote secret · Sécurisé · Un étudiant, un vote
                </span>
              </div>

              <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-16">
                <FooterCol title="Navigation">
                  {navLinks.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} className="footer-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </FooterCol>
                <FooterCol title="Assistance">
                  <li><a href="#" className="footer-link">Centre technique</a></li>
                  <li><a href="#" className="footer-link">Guide de l'électeur</a></li>
                </FooterCol>
                <FooterCol title="Légal">
                  <li><a href="#" className="footer-link">Confidentialité</a></li>
                  <li><a href="#" className="footer-link">Conditions</a></li>
                </FooterCol>
              </div>
            </div>

            <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-slate-200/70 pt-8 dark:border-white/[0.06] sm:flex-row">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                © {new Date().getFullYear()} VoteBGDE — Excellence & Transparence
              </p>
              <div className="flex items-center gap-2">
                <a href="#" aria-label="Instagram" className="flex size-9 items-center justify-center rounded-full text-slate-400 ring-1 ring-inset ring-slate-200 transition-colors hover:text-slate-900 hover:ring-slate-300 dark:ring-white/10 dark:hover:text-white">
                  <InstagramLogo size={16} />
                </a>
                <a href="#" aria-label="LinkedIn" className="flex size-9 items-center justify-center rounded-full text-slate-400 ring-1 ring-inset ring-slate-200 transition-colors hover:text-slate-900 hover:ring-slate-300 dark:ring-white/10 dark:hover:text-white">
                  <LinkedinLogo size={16} />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </SiteThemeContext.Provider>
  )
}

function FooterCol({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-medium text-slate-900 dark:text-white">{title}</h3>
      <ul className="space-y-3 text-sm">{children}</ul>
    </div>
  )
}
