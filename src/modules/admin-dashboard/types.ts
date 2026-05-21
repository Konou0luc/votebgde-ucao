import type { ApiEnvelope } from '../student-vote/types'

export type { ApiEnvelope }

export type AdminRole = string

export type AdminUser = {
  id: string
  email: string
  role: AdminRole
  permissions: string[]
}

export type LoginPayload = {
  email: string
  password: string
}

/** Réponse étape 1 : identifiants valides, OTP envoyé par email */
export type AdminLoginOtpPendingResponse = {
  otpRequired: true
  otpSessionToken: string
  expiresInMinutes: number
  emailMasked: string
  /** Présent uniquement si MAIL_TRANSPORT=json et NODE_ENV≠production côté API */
  debugOtp?: string
}

export type VerifyLoginOtpPayload = {
  otpSessionToken: string
  otp: string
}

export type LoginResponse = {
  accessToken: string
  refreshToken: string
  expiresIn: string
  admin: AdminUser
}

export type AdminDashboardData = {
  students: { eligible: number }
  votes: { total: number }
  scrutins: {
    draft: number
    scheduled: number
    open: number
    closed: number
    archived: number
  }
}

export type ScrutinStatus = 'DRAFT' | 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'ARCHIVED'

export type ScrutinRecord = {
  id: string
  title: string
  description: string | null
  startsAt: string
  endsAt: string
  status: string
  resultsPublishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type CreateElectionPayload = {
  title: string
  description?: string
  startsAt: string
  endsAt: string
  status?: ScrutinStatus
}

export type UpdateElectionPayload = {
  title?: string
  description?: string
  startsAt?: string
  endsAt?: string
  status?: ScrutinStatus
}

export type ParticipationStats = {
  scrutinId: string
  title: string
  status: string
  eligibleStudents: number
  participants: number
  voters: number
  participationRate: number
}

export type ElectionResultRow = {
  candidateListId: string
  name: string
  order: number
  isActive: boolean
  votes: number
  percentage: number
}

export type ElectionResultsData = {
  scrutinId: string
  title: string
  status: string
  resultsPublishedAt: string | null
  totalVotes: number
  results: ElectionResultRow[]
}

export type CandidateListMember = {
  name: string
  role: string
}

export type CandidateListRecord = {
  id: string
  scrutinId: string
  name: string
  slogan: string | null
  description: string | null
  members: CandidateListMember[]
  actionPlan: string[]
  videoUrl: string | null
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CreateCandidateListPayload = {
  scrutinId: string
  name: string
  slogan?: string
  description?: string
  members?: CandidateListMember[]
  actionPlan?: string[]
  video?: File | null // Pour l'upload
  order: number
}

export type UpdateCandidateListPayload = {
  name?: string
  slogan?: string
  description?: string
  members?: CandidateListMember[]
  actionPlan?: string[]
  video?: File | null // Pour l'upload
  order?: number
  isActive?: boolean
}
