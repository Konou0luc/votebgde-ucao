import { create } from 'zustand'

type StudentVoteFlowState = {
  matricule: string
  email: string
  scrutinId?: string
  scrutinTitle?: string
  sessionToken?: string
  selectedListId?: string
  selectedListName?: string
  isOtpVerified: boolean
  setMatricule: (matricule: string) => void
  setEmail: (email: string) => void
  setScrutin: (scrutinId?: string, scrutinTitle?: string) => void
  setSessionToken: (sessionToken?: string) => void
  setOtpVerified: (isVerified: boolean) => void
  setSelectedList: (id: string, name: string) => void
  resetFlow: () => void
}

const initialState = {
  matricule: '',
  email: '',
  scrutinId: undefined,
  scrutinTitle: undefined,
  sessionToken: undefined,
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
  setOtpVerified: (isOtpVerified) => set({ isOtpVerified }),
  setSelectedList: (selectedListId, selectedListName) =>
    set({ selectedListId, selectedListName }),
  resetFlow: () => set(initialState),
}))
