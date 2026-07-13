import { useEffect, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../../../assets/logo.png'
import { 
  Sun, 
  Moon, 
  List, 
  X, 
  ArrowRight,
  CaretRight,
  InstagramLogo,
  LinkedinLogo
} from '@phosphor-icons/react'
import { getInitialSiteTheme, SiteThemeContext } from './site-theme'
import { ToastViewport } from './toast-viewport'
import { Button } from './Button'

export function SiteLayout({ children }: PropsWithChildren) {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState(() => getInitialSiteTheme())
  const [scrolled, setScrolled] = useState(false)
  const isVotePage = location.pathname.startsWith('/vote')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('votebgde-theme', nextTheme)
  }

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/vote', label: 'Voter' },
    { to: '/resultats', label: 'Résultats' },
  ]

  const navTransition = {
     type: "spring" as const,
     stiffness: 300,
     damping: 30
   }

  return (
    <SiteThemeContext.Provider value={{ theme }}>
      <div className="flex min-h-screen flex-col font-sans antialiased bg-white dark:bg-night-950 transition-colors duration-500">
        <div className="grain-overlay" />
        {/* Premium Floating Navigation Pill */}
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 md:p-6 pointer-events-none">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className={`
              pointer-events-auto
              relative flex items-center justify-between
              w-full max-w-5xl h-16 px-4 md:px-6
              rounded-full border transition-all duration-500
              ${scrolled 
                ? 'bg-white/70 dark:bg-night-900/70 backdrop-blur-2xl border-slate-200/50 dark:border-white/10 shadow-soft' 
                : 'bg-white/40 dark:bg-white/5 backdrop-blur-md border-transparent shadow-md'}
            `}
          >
            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img src={logo} alt="Logo" className="relative size-8 object-contain transition-transform duration-500 group-hover:scale-110" />
              </div>
              <span className="hidden sm:block font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                Vote<span className="text-brand-600">BGDE</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 dark:bg-white/5 p-1 rounded-full border border-slate-200/50 dark:border-white/5">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative px-5 py-2 text-sm font-medium transition-all duration-500 rounded-full
                    ${isActive
                      ? 'text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute inset-0 bg-brand-600 rounded-full shadow-lg shadow-brand-500/20"
                          transition={navTransition}
                        />
                      )}
                      <span className="relative z-10">{link.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Actions Section */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex size-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-slate-200/50 dark:hover:border-white/10"
                title="Changer le thème"
              >
                {theme === 'dark' ? <Sun size={20} weight="light" /> : <Moon size={20} weight="light" />}
              </button>

              <div className="hidden h-6 w-px bg-slate-200 dark:bg-white/10 md:block" />

              <Link to="/vote" className="hidden md:block">
                <Button variant="primary" className="!px-4 !py-2 !text-xs" trailing={<ArrowRight size={14} weight="bold" />}>
                  Lancer le vote
                </Button>
              </Link>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex size-10 items-center justify-center rounded-full border border-slate-200/50 dark:border-white/10 md:hidden bg-white/50 dark:bg-white/5"
              >
                {isMobileMenuOpen ? <X size={20} weight="light" /> : <List size={20} weight="light" />}
              </button>
            </div>
          </motion.div>
        </header>

        {/* Premium Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[40] bg-white/90 dark:bg-black/90 backdrop-blur-3xl md:hidden"
            >
              <div className="flex flex-col h-full pt-32 px-6">
                <div className="space-y-4">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 + 0.2 }}
                    >
                      <NavLink
                        to={link.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between font-display text-3xl font-semibold tracking-tighter py-4 ${
                            isActive
                              ? 'text-brand-600'
                              : 'text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white'
                          }`
                        }
                      >
                        {link.label}
                        <CaretRight size={24} weight="bold" className="text-brand-600/50" />
                      </NavLink>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-auto mb-12"
                >
                  <Link
                    to="/vote"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="w-full !h-16 !text-lg !rounded-2xl" trailing={<ArrowRight size={20} weight="bold" />}>
                      Lancer le vote
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className={`flex-1 pt-24 ${isVotePage ? 'bg-white dark:bg-night-950' : ''}`}>
          {children}
        </main>

        <ToastViewport theme={theme} />

        <footer className="bg-slate-50 dark:bg-night-950 transition-colors duration-500 py-24 border-t border-slate-200/60 dark:border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between gap-16 md:gap-8">
              <div className="max-w-xs space-y-8">
                <Link to="/" className="flex items-center gap-3 group">
                  <img src={logo} alt="Logo" className="size-10 object-contain transition-transform duration-500 group-hover:rotate-12" />
                  <span className="font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    Vote<span className="text-brand-600">BGDE</span>
                  </span>
                </Link>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  Système de gestion électorale certifié pour l'UCAO. 
                  Conçu pour la transparence et la sécurité absolue des données électorales.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-24">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-8">Navigation</h3>
                  <ul className="space-y-4">
                    {navLinks.map(link => (
                      <li key={link.to}>
                        <Link to={link.to} className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-8">Assistance</h3>
                  <ul className="space-y-4">
                    <li><a href="#" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors">Centre technique</a></li>
                    <li><a href="#" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors">Guide de l'électeur</a></li>
                  </ul>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-8">Légal</h3>
                  <ul className="space-y-4">
                    <li><a href="#" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors">Confidentialité</a></li>
                    <li><a href="#" className="text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors">Conditions</a></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-24 pt-8 border-t border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
                © {new Date().getFullYear()} VoteBGDE — Excellence & Transparence
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-brand-600 transition-colors">
                  <InstagramLogo size={18} weight="fill" className="text-slate-300 group-hover:text-[#E4405F] transition-colors" />
                  <span>Instagram</span>
                </a>
                <a href="#" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-brand-600 transition-colors">
                  <LinkedinLogo size={18} weight="fill" className="text-slate-300 group-hover:text-[#0077B5] transition-colors" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </SiteThemeContext.Provider>
  )
}
