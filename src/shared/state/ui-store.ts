import { create } from 'zustand'

type UiStore = {
  isSidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useUiStore = create<UiStore>((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}))
