import { createContext, useContext } from 'react'

export type SiteTheme = 'light' | 'dark'

export const SiteThemeContext = createContext<{ theme: SiteTheme } | null>(null)

export function useSiteTheme() {
  const context = useContext(SiteThemeContext)
  return context ?? { theme: 'light' as const }
}

export function getInitialSiteTheme(): SiteTheme {
  const stored = localStorage.getItem('votebgde-theme')
  if (stored === 'dark' || stored === 'light') return stored
  return 'light'
}
