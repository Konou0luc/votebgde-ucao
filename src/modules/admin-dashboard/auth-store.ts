import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AdminUser } from './types'

type AdminAuthState = {
  accessToken: string | null
  refreshToken: string | null
  admin: AdminUser | null
  setSession: (payload: {
    accessToken: string
    refreshToken: string
    admin: AdminUser
  }) => void
  logout: () => void
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      admin: null,
      setSession: ({ accessToken, refreshToken, admin }) =>
        set({ accessToken, refreshToken, admin }),
      logout: () => set({ accessToken: null, refreshToken: null, admin: null }),
    }),
    {
      name: 'votebgde-admin-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        admin: state.admin,
      }),
    },
  ),
)

/** Pour intercepteur HTTP sans souscrire au store React */
export function getAdminAccessToken(): string | null {
  return useAdminAuthStore.getState().accessToken
}
