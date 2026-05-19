import { create } from 'zustand'

export type ToastType = 'success' | 'error'

export type ToastItem = {
  id: string
  message: string
  type: ToastType
}

type ToastStore = {
  toasts: ToastItem[]
  pushToast: (message: string, type: ToastType) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  pushToast: (message, type) =>
    set((state) => ({
      toasts: [...state.toasts, { id: crypto.randomUUID(), message, type }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))
