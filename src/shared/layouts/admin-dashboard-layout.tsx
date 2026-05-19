import type { PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChartPie,
  LayoutGrid,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  BadgeCheck,
  X,
  Moon,
  Sun,
} from 'lucide-react'
import { useAdminAuthStore } from '../../modules/admin-dashboard/auth-store'
import { ADMIN_PRIVATE_PATH } from '../constants/routes'
import type { SiteTheme } from '../ui/site-theme'
import { getInitialSiteTheme } from '../ui/site-theme'
import { ToastViewport } from '../ui/toast-viewport'

const navLinkClass = ({
  isActive,
  collapsed,
}: {
  isActive: boolean
  collapsed: boolean
}) =>
  `group flex items-center gap-3 rounded-[calc(1.25rem-4px)] px-3 py-2.5 text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
    isActive
      ? 'bg-slate-100 text-slate-900 shadow-sm dark:bg-white/[0.08] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-slate-200'
  } ${collapsed ? 'justify-center px-2' : ''}`

export function AdminDashboardLayout({ children }: PropsWithChildren) {
  const navigate = useNavigate()
  const admin = useAdminAuthStore((s) => s.admin)
  const logout = useAdminAuthStore((s) => s.logout)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useState<SiteTheme>(() => getInitialSiteTheme())

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function toggleTheme() {
    const next: SiteTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('votebgde-theme', next)
  }

  function handleLogout() {
    logout()
    navigate(`${ADMIN_PRIVATE_PATH}/login`, { replace: true })
  }

  const shellOuter =
    'rounded-[2rem] border border-slate-200/90 bg-white p-1.5 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.12)] dark:border-white/[0.06] dark:bg-slate-950/80 dark:shadow-[0_24px_80px_-32px_rgba(0,0,0,0.65)]'
  const shellInner =
    'rounded-[calc(2rem-6px)] border border-slate-100 bg-white dark:border-white/[0.05] dark:bg-slate-950'

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 dark:bg-[#030712] dark:text-slate-100">
      <div
        className="pointer-events-none fixed inset-0 hidden opacity-[0.35] dark:block"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,130,246,0.15), transparent),
            radial-gradient(ellipse 60% 40% at 100% 50%, rgba(30,64,175,0.08), transparent)`,
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[1600px] gap-3 p-3 md:p-5 lg:p-6">
        {/* Desktop sidebar */}
        <aside
          className={`hidden shrink-0 overflow-x-clip transition-[width] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:block ${
            collapsed ? 'w-[88px]' : 'w-[272px]'
          }`}
        >
          <div className={`${shellOuter} sticky top-5`}>
            <div className={`${shellInner} flex min-h-[calc(100dvh-4rem)] flex-col`}>
              <div
                className={`flex border-b border-slate-100 dark:border-white/[0.06] ${
                  collapsed
                    ? 'flex-col items-center gap-2 px-2 py-3'
                    : 'flex-row items-center justify-between gap-2 p-4'
                }`}
              >
                <div className={`flex min-w-0 items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/15 ring-1 ring-blue-600/25 dark:bg-blue-600/25 dark:ring-blue-500/30">
                    <BadgeCheck className="size-5 text-blue-600 dark:text-blue-400" strokeWidth={1.25} />
                  </div>
                  {!collapsed && (
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Console</p>
                      <p className="font-semibold tracking-tight text-slate-950 dark:text-white">VoteBGDE</p>
                    </div>
                  )}
                </div>
                <div
                  className={`flex shrink-0 items-center gap-1 ${collapsed ? 'flex-col gap-1.5' : 'flex-row'}`}
                >
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-white/[0.06] dark:hover:text-slate-300"
                    aria-label={theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre'}
                  >
                    {theme === 'dark' ? <Sun className="size-4" strokeWidth={1.25} /> : <Moon className="size-4" strokeWidth={1.25} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollapsed((c) => !c)}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-white/[0.06] dark:hover:text-slate-300"
                    aria-label={collapsed ? 'Étendre le menu' : 'Réduire le menu'}
                  >
                    {collapsed ? (
                      <PanelLeftOpen className="size-4" strokeWidth={1.25} />
                    ) : (
                      <PanelLeftClose className="size-4" strokeWidth={1.25} />
                    )}
                  </button>
                </div>
              </div>

              <nav className="flex flex-1 flex-col gap-1 p-3">
                <NavLink
                  to={ADMIN_PRIVATE_PATH}
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => navLinkClass({ isActive, collapsed })}
                >
                  <LayoutGrid className="size-[18px] shrink-0" strokeWidth={1.25} />
                  {!collapsed && <span>Vue d&apos;ensemble</span>}
                </NavLink>
                <NavLink
                  to={`${ADMIN_PRIVATE_PATH}/scrutins`}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => navLinkClass({ isActive, collapsed })}
                >
                  <ChartPie className="size-[18px] shrink-0" strokeWidth={1.25} />
                  {!collapsed && <span>Élections</span>}
                </NavLink>
              </nav>

              <div className="border-t border-slate-100 p-3 dark:border-white/[0.06]">
                {!collapsed && admin && (
                  <p className="mb-2 truncate px-1 text-xs text-slate-500">{admin.email}</p>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`flex w-full items-center gap-3 rounded-[calc(1.25rem-4px)] px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-300/90 dark:hover:bg-rose-500/10 ${
                    collapsed ? 'justify-center' : ''
                  }`}
                >
                  <LogOut className="size-[18px] shrink-0" strokeWidth={1.25} />
                  {!collapsed && <span>Déconnexion</span>}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col md:hidden">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200/90 bg-white/90 px-4 py-3 backdrop-blur-xl dark:border-white/[0.06] dark:bg-slate-950/90">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-blue-600/15 ring-1 ring-blue-600/25 dark:bg-blue-600/25 dark:ring-blue-500/30">
                <BadgeCheck className="size-4 text-blue-600 dark:text-blue-400" strokeWidth={1.25} />
              </div>
              <span className="font-semibold text-slate-950 dark:text-white">Admin VoteBGDE</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 dark:border-white/[0.08] dark:text-slate-300"
                aria-label={theme === 'dark' ? 'Thème clair' : 'Thème sombre'}
              >
                {theme === 'dark' ? <Sun className="size-5" strokeWidth={1.25} /> : <Moon className="size-5" strokeWidth={1.25} />}
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-xl border border-slate-200 p-2 text-slate-700 dark:border-white/[0.08] dark:text-slate-300"
                aria-label="Menu"
              >
                <Menu className="size-5" strokeWidth={1.25} />
              </button>
            </div>
          </header>

          {mobileOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                aria-label="Fermer"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                className={`absolute right-0 top-0 h-full w-[min(88vw,320px)] ${shellOuter} border-l-0`}
              >
                <div className={`${shellInner} flex h-full flex-col p-4`}>
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-950 dark:text-white">Menu</span>
                    <button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.06]"
                    >
                      <X className="size-5" strokeWidth={1.25} />
                    </button>
                  </div>
                  <nav className="flex flex-col gap-1">
                    <NavLink
                      to={ADMIN_PRIVATE_PATH}
                      end
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) => navLinkClass({ isActive, collapsed: false })}
                    >
                      <LayoutGrid className="size-[18px]" strokeWidth={1.25} />
                      Vue d&apos;ensemble
                    </NavLink>
                    <NavLink
                      to={`${ADMIN_PRIVATE_PATH}/scrutins`}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) => navLinkClass({ isActive, collapsed: false })}
                    >
                      <ChartPie className="size-[18px]" strokeWidth={1.25} />
                      Élections
                    </NavLink>
                  </nav>
                  <div className="mt-auto border-t border-slate-100 pt-4 dark:border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        handleLogout()
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-rose-600 dark:text-rose-300"
                    >
                      <LogOut className="size-[18px]" strokeWidth={1.25} />
                      Déconnexion
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          <main className="flex-1 px-4 py-6">{children}</main>
        </div>

        {/* Desktop main */}
        <main className="hidden min-h-[calc(100dvh-2.5rem)] min-w-0 flex-1 flex-col md:flex">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            className="flex-1"
          >
            {children}
          </motion.div>
        </main>
      </div>

      <ToastViewport theme={theme} />
    </div>
  )
}
