import { useEffect, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logo from '../../../assets/logo.png'
import { ArrowUpRight, Menu, Moon, Sun, X } from 'lucide-react'
import { getInitialSiteTheme, SiteThemeContext } from './site-theme'
import { ToastViewport } from './toast-viewport'

export function SiteLayout({ children }: PropsWithChildren) {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState(() => getInitialSiteTheme())
  const isVotePage = location.pathname.startsWith('/vote')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('votebgde-theme', nextTheme)
  }

  return (
    <SiteThemeContext.Provider value={{ theme }}>
      <div
        className={`flex min-h-[100dvh] min-w-0 flex-col ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}
      >
        <header
          className={`fixed inset-x-0 top-0 z-30 border-b px-4 backdrop-blur md:px-8 ${
            theme === 'dark' ? 'border-slate-800/70 bg-slate-950/92' : 'border-slate-200/70 bg-white/95'
          }`}
        >
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between py-2">
            <Link to="/" className="inline-flex items-center gap-3 rounded-full px-2 py-1.5">
              <img
                src={logo}
                alt="Logo VoteBGDE"
                className={`size-9 rounded-xl object-cover ring-1 ${theme === 'dark' ? 'ring-slate-700' : 'ring-slate-200'}`}
              />
              <span className={`text-base font-semibold tracking-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>
                VoteBGDE
              </span>
            </Link>

            <nav className="hidden items-center gap-2 text-sm md:flex">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 transition ${
                    isActive
                      ? 'bg-blue-50 font-medium text-blue-700'
                      : theme === 'dark'
                        ? 'text-slate-300 hover:bg-slate-800'
                        : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                Accueil
              </NavLink>
              <NavLink
                to="/vote"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 transition ${
                    isActive
                      ? 'bg-blue-50 font-medium text-blue-700'
                      : theme === 'dark'
                        ? 'text-slate-300 hover:bg-slate-800'
                        : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                Voter
              </NavLink>
              <NavLink
                to="/resultats"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 transition ${
                    isActive
                      ? 'bg-blue-50 font-medium text-blue-700'
                      : theme === 'dark'
                        ? 'text-slate-300 hover:bg-slate-800'
                        : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                Resultats
              </NavLink>
              <button
                type="button"
                onClick={toggleTheme}
                className={`inline-flex size-9 items-center justify-center rounded-full border transition ${
                  theme === 'dark'
                    ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                aria-label="Changer de theme"
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <Link
                to="/vote"
                className="ml-1 inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-blue-700 active:scale-[0.98]"
              >
                Lancer <ArrowUpRight size={14} />
              </Link>
            </nav>

            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={toggleTheme}
                className={`inline-flex size-9 items-center justify-center rounded-full border transition ${
                  theme === 'dark'
                    ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                aria-label="Changer de theme"
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className={`inline-flex size-9 items-center justify-center rounded-full border transition ${
                  theme === 'dark'
                    ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
                aria-label="Ouvrir le menu"
              >
                {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div
              className={`mx-auto mb-3 w-full max-w-[1400px] rounded-2xl border p-2 ${
                theme === 'dark' ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
              }`}
            >
              <NavLink
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-2 text-sm transition ${
                    isActive
                      ? 'bg-blue-50 font-medium text-blue-700'
                      : theme === 'dark'
                        ? 'text-slate-300 hover:bg-slate-800'
                        : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                Accueil
              </NavLink>
              <NavLink
                to="/vote"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `mt-1 block rounded-xl px-3 py-2 text-sm transition ${
                    isActive
                      ? 'bg-blue-50 font-medium text-blue-700'
                      : theme === 'dark'
                        ? 'text-slate-300 hover:bg-slate-800'
                        : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                Voter
              </NavLink>
              <NavLink
                to="/resultats"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `mt-1 block rounded-xl px-3 py-2 text-sm transition ${
                    isActive
                      ? 'bg-blue-50 font-medium text-blue-700'
                      : theme === 'dark'
                        ? 'text-slate-300 hover:bg-slate-800'
                        : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                Resultats
              </NavLink>
            </div>
          )}
        </header>

        <div
          className={`min-w-0 ${isVotePage ? 'flex flex-1 items-center pt-[68px]' : 'flex-1 pt-[68px]'}`}
        >
          {children}
        </div>
        <ToastViewport theme={theme} />

        <footer
          className={`mt-auto border-t ${
            theme === 'dark' ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
          }`}
        >
          <div className={`mx-auto grid w-full max-w-[1400px] gap-6 px-4 md:grid-cols-2 md:px-8 ${isVotePage ? 'py-6' : 'py-10'}`}>
            <div>
              <p className={`text-base font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-950'}`}>VoteBGDE</p>
              <p className={`mt-2 max-w-[60ch] text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Plateforme de vote numerique universitaire orientee confiance,
                transparence et simplicite mobile.
              </p>
              <div className="mt-4 flex gap-4 text-xs text-slate-500">
                <span>Confidentialite</span>
                <span>Conformite</span>
                <span>Support etudiant</span>
              </div>
            </div>
            <div className={`text-sm md:text-right ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              <p>Support: support@votebgde.edu</p>
              <p className="mt-1">© 2026 VoteBGDE. Tous droits reserves.</p>
            </div>
          </div>
        </footer>
      </div>
    </SiteThemeContext.Provider>
  )
}
