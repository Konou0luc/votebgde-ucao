import type { ApiEnvelope } from '../student-vote/types'

export type { ApiEnvelope }

export type AdminRole = 'SUPER_ADMIN' | 'STANDARD_ADMIN'

export type AdminUser = {
  id: string
  email: string
  role: AdminRole
  permissions: string[]
  needsPasswordChange: boolean
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

export type StudentLevel = 'L1' | 'L2' | 'L3'

export type ScrutinRecord = {
  id: string
  title: string
  description: string | null
  bannerUrl: string | null
  targetDepartment: string | null
  targetLevel: StudentLevel | null
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
  bannerUrl?: string
  targetDepartment?: string
  targetLevel?: StudentLevel
  startsAt: string
  endsAt: string
  status?: ScrutinStatus
}

export type UpdateElectionPayload = {
  title?: string
  description?: string
  bannerUrl?: string
  targetDepartment?: string
  targetLevel?: StudentLevel
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
  imageUrl: string | null
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
  image?: File | null // Pour l'upload
  order: number
}

export type UpdateCandidateListPayload = {
  name?: string
  slogan?: string
  description?: string
  members?: CandidateListMember[]
  actionPlan?: string[]
  video?: File | null // Pour l'upload
  image?: File | null // Pour l'upload
  order?: number
  isActive?: boolean
}

export type AdminRecord = {
  id: string
  email: string
  role: 'SUPER_ADMIN' | 'STANDARD_ADMIN'
  permissions: string[]
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}


export type AuditLogRecord = {
  id: string
  adminId: string | null
  action: string
  entity: string
  entityId: string | null
  severity: string
  ipAddress: string | null
  userAgent: string | null
  metadata: any
  createdAt: string
  admin?: {
    id: string
    email: string
  } | null
}

export type CreateAdminPayload = {
  email: string
  password?: string
  role: 'SUPER_ADMIN' | 'STANDARD_ADMIN'
  permissions: string[]
}

export type UpdateAdminPayload = Partial<CreateAdminPayload> & {
  isActive?: boolean
}

