import { create } from 'zustand'

type StudentVoteFlowState = {
  matricule: string
  email: string
  scrutinId?: string
  scrutinTitle?: string
  sessionToken?: string
  /** Timestamp ms à partir duquel le code OTP n'est plus valide. */
  otpExpiresAt?: number
  selectedListId?: string
  selectedListName?: string
  isOtpVerified: boolean
  setMatricule: (matricule: string) => void
  setEmail: (email: string) => void
  setScrutin: (scrutinId?: string, scrutinTitle?: string) => void
  setSessionToken: (sessionToken?: string) => void
  setOtpExpiresAt: (otpExpiresAt?: number) => void
  setOtpVerified: (isVerified: boolean) => void
  setSelectedList: (id: string, name: string) => void
  clearOtpSession: () => void
  resetFlow: () => void
}

const initialState = {
  matricule: '',
  email: '',
  scrutinId: undefined,
  scrutinTitle: undefined,
  sessionToken: undefined,
  otpExpiresAt: undefined,
  selectedListId: undefined,
  selectedListName: undefined,
  isOtpVerified: false,
}

export const useStudentVoteFlowStore = create<StudentVoteFlowState>((set) => ({
  ...initialState,
  setMatricule: (matricule) => set({ matricule }),
  setEmail: (email) => set({ email }),
  setScrutin: (scrutinId, scrutinTitle) => set({ scrutinId, scrutinTitle }),
  setSessionToken: (sessionToken) => set({ sessionToken }),
  setOtpExpiresAt: (otpExpiresAt) => set({ otpExpiresAt }),
  setOtpVerified: (isOtpVerified) => set({ isOtpVerified }),
  setSelectedList: (selectedListId, selectedListName) =>
    set({ selectedListId, selectedListName }),
  clearOtpSession: () =>
    set({
      sessionToken: undefined,
      otpExpiresAt: undefined,
      isOtpVerified: false,
      selectedListId: undefined,
      selectedListName: undefined,
    }),
  resetFlow: () => set(initialState),
}))
