import type { PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChartPie,
  LayoutGrid,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Users,
  Terminal,
  X,
  Moon,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import logo from '../../../assets/logo.png'
import { useAdminAuthStore } from '../../modules/admin-dashboard/auth-store'
import { ADMIN_PRIVATE_PATH } from '../constants/routes'
import type { SiteTheme } from '../ui/site-theme'
import { getInitialSiteTheme } from '../ui/site-theme'
import { ToastViewport } from '../ui/toast-viewport'

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  superAdminOnly?: boolean
  /** Reste accessible pendant un changement de mot de passe forcé */
  alwaysEnabled?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: ADMIN_PRIVATE_PATH, label: "Vue d'ensemble", icon: LayoutGrid, end: true },
  { to: `${ADMIN_PRIVATE_PATH}/scrutins`, label: 'Élections', icon: ChartPie },
  { to: `${ADMIN_PRIVATE_PATH}/utilisateurs`, label: 'Utilisateurs', icon: Users, superAdminOnly: true },
  { to: `${ADMIN_PRIVATE_PATH}/audit`, label: 'Audit', icon: Terminal, superAdminOnly: true },
  { to: `${ADMIN_PRIVATE_PATH}/profil`, label: 'Mon profil', icon: User, alwaysEnabled: true },
]

function navLinkClass(isActive: boolean, collapsed: boolean) {
  return `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors duration-200 ${
    isActive
      ? 'text-slate-950 dark:text-white'
      : 'text-slate-500 hover:bg-slate-900/[0.04] hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-slate-100'
  } ${collapsed ? 'justify-center px-2' : ''}`
}

function NavItems({
  items,
  collapsed,
  disabled,
  onNavigate,
  layoutId,
}: {
  items: NavItem[]
  collapsed: boolean
  disabled: boolean
  onNavigate?: () => void
  layoutId: string
}) {
  return (
    <>
      {items.map(({ to, label, icon: Icon, end, alwaysEnabled }) => {
        const isDisabled = disabled && !alwaysEnabled
        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            aria-disabled={isDisabled || undefined}
            tabIndex={isDisabled ? -1 : undefined}
            className={({ isActive }) => navLinkClass(isActive, collapsed)}
            style={isDisabled ? { pointerEvents: 'none', opacity: 0.45 } : undefined}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId={layoutId}
                    className="absolute inset-0 rounded-lg bg-white shadow-soft ring-1 ring-slate-200/80 dark:bg-white/[0.07] dark:shadow-none dark:ring-white/10"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                {isActive && !collapsed && (
                  <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-crimson-500" aria-hidden />
                )}
                <Icon
                  className={`relative size-[18px] shrink-0 ${isActive ? 'text-brand-600 dark:text-brand-300' : ''}`}
                  strokeWidth={1.6}
                />
                {!collapsed && <span className="relative truncate">{label}</span>}
              </>
            )}
          </NavLink>
        )
      })}
    </>
  )
}

function ConsoleBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200 dark:ring-white/15">
        <img src={logo} alt="" className="size-6 object-contain" />
      </span>
      {!compact && (
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[15px] font-semibold tracking-tight text-slate-950 dark:text-white">
            Vote<span className="text-brand-600 dark:text-brand-300">BGDE</span>
          </p>
          <p className="text-xs text-slate-500">Console d'administration</p>
        </div>
      )}
    </div>
  )
}

export function AdminDashboardLayout({ children }: PropsWithChildren) {
  const navigate = useNavigate()
  const location = useLocation()
  const admin = useAdminAuthStore((s) => s.admin)
  const logout = useAdminAuthStore((s) => s.logout)

  const isPasswordChangeRequired = Boolean(admin?.needsPasswordChange)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useState<SiteTheme>(() => getInitialSiteTheme())

  const items = NAV_ITEMS.filter((item) => !item.superAdminOnly || admin?.role === 'SUPER_ADMIN')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [mobileOpen])

  function toggleTheme() {
    const next: SiteTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try {
      localStorage.setItem('votebgde-theme', next)
    } catch {
      /* stockage indisponible */
    }
  }

  function handleLogout() {
    logout()
    navigate(`${ADMIN_PRIVATE_PATH}/login`, { replace: true })
  }

  const iconBtn =
    'flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-900/[0.05] hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white'

  const initials = (admin?.email ?? '?').slice(0, 2).toUpperCase()

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#f6f7fa] md:h-[100dvh] md:overflow-hidden text-slate-900 dark:bg-night-950 dark:text-slate-100">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="bg-dots mask-radial absolute inset-0 opacity-50" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[1600px] flex-col md:h-full md:min-h-0 md:flex-row md:gap-4 md:p-4 lg:gap-5 lg:p-5">
        {/* Barre latérale (desktop) */}
        <aside
          className={`hidden shrink-0 md:h-full transition-[width] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:block ${
            collapsed ? 'w-[76px]' : 'w-[268px]'
          }`}
        >
          <div className="flex h-full flex-col overflow-y-auto">
            <div
              className={`flex items-center pb-5 pt-1 ${collapsed ? 'flex-col gap-3' : 'justify-between gap-2 px-1'}`}
            >
              <ConsoleBrand compact={collapsed} />
              <button
                type="button"
                onClick={() => setCollapsed((c) => !c)}
                className={iconBtn}
                aria-label={collapsed ? 'Étendre le menu' : 'Réduire le menu'}
              >
                {collapsed ? <PanelLeftOpen className="size-4" strokeWidth={1.6} /> : <PanelLeftClose className="size-4" strokeWidth={1.6} />}
              </button>
            </div>

            {!collapsed && <p className="mb-2 px-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Navigation</p>}
            <nav aria-label="Administration" className="flex flex-col gap-0.5">
              <NavItems items={items} collapsed={collapsed} disabled={isPasswordChangeRequired} layoutId="admin-nav-desktop" />
            </nav>

            <div className="mt-auto space-y-2 border-t border-slate-200/80 pt-3 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={toggleTheme}
                className={`${navLinkClass(false, collapsed)} w-full`}
                aria-label={theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre'}
              >
                {theme === 'dark' ? <Sun className="size-[18px] shrink-0" strokeWidth={1.6} /> : <Moon className="size-[18px] shrink-0" strokeWidth={1.6} />}
                {!collapsed && <span>{theme === 'dark' ? 'Thème clair' : 'Thème sombre'}</span>}
              </button>

              {admin && (
                <div
                  className={`flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-2 shadow-soft dark:border-white/[0.07] dark:bg-white/[0.03] dark:shadow-none ${
                    collapsed ? 'flex-col' : ''
                  }`}
                >
                  <NavLink
                    to={`${ADMIN_PRIVATE_PATH}/profil`}
                    title={admin.email}
                    className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                      {initials}
                    </span>
                    {!collapsed && (
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-slate-900 dark:text-white">{admin.email}</span>
                        <span className="block truncate text-xs text-slate-500">{admin.role?.replace(/_/g, ' ').toLowerCase()}</span>
                      </span>
                    )}
                  </NavLink>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`${iconBtn} hover:!bg-rose-500/10 hover:!text-rose-600 dark:hover:!text-rose-400`}
                    aria-label="Déconnexion"
                    title="Déconnexion"
                  >
                    <LogOut className="size-4" strokeWidth={1.6} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* En-tête mobile */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-white/[0.06] dark:bg-night-950/80 md:hidden">
          <ConsoleBrand />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              className={iconBtn}
              aria-label={theme === 'dark' ? 'Thème clair' : 'Thème sombre'}
            >
              {theme === 'dark' ? <Sun className="size-[18px]" strokeWidth={1.6} /> : <Moon className="size-[18px]" strokeWidth={1.6} />}
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className={iconBtn}
              aria-label="Ouvrir le menu"
              aria-expanded={mobileOpen}
            >
              <Menu className="size-5" strokeWidth={1.6} />
            </button>
          </div>
        </header>

        <AnimatePresence>
          {mobileOpen && (
            <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
                aria-label="Fermer"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                className="absolute right-0 top-0 flex h-full w-[min(86vw,320px)] flex-col border-l border-slate-200 bg-white p-4 dark:border-white/[0.08] dark:bg-night-900"
              >
                <div className="mb-6 flex items-center justify-between">
                  <ConsoleBrand />
                  <button type="button" onClick={() => setMobileOpen(false)} className={iconBtn} aria-label="Fermer le menu">
                    <X className="size-5" strokeWidth={1.6} />
                  </button>
                </div>
                <nav className="flex flex-col gap-0.5">
                  <NavItems
                    items={items}
                    collapsed={false}
                    disabled={isPasswordChangeRequired}
                    onNavigate={() => setMobileOpen(false)}
                    layoutId="admin-nav-mobile"
                  />
                </nav>
                <div className="mt-auto border-t border-slate-200/80 pt-4 dark:border-white/[0.06]">
                  {admin && <p className="mb-3 truncate px-3 text-[13px] text-slate-500">{admin.email}</p>}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      handleLogout()
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-400"
                  >
                    <LogOut className="size-[18px]" strokeWidth={1.6} />
                    Déconnexion
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Contenu */}
        <main className="min-w-0 flex-1 md:h-full md:min-h-0">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-[calc(100dvh-4rem)] w-full overflow-x-hidden bg-white p-4 dark:bg-night-900/60 sm:p-6 md:h-full md:min-h-0 md:overflow-y-auto md:overscroll-contain md:rounded-2xl md:border md:border-slate-200/80 md:shadow-soft md:dark:border-white/[0.07] md:dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] lg:p-10"
          >
            {children}
          </motion.div>
        </main>
      </div>

      <ToastViewport theme={theme} />
    </div>
  )
}
