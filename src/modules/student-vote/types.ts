export type CandidateList = {
  id: string
  name: string
  slogan: string
}

export type ActiveScrutin = {
  id: string
  title: string
  description?: string
  startsAt: string
  endsAt: string
  status: string
  candidateLists: CandidateList[]
}

export type OtpSendPayload = {
  matricule: string
  email: string
}

export type OtpSendResponse = {
  sessionToken: string
  expiresInMinutes: number
  emailMasked: string
  debugOtp?: string
}

export type OtpVerifyPayload = {
  sessionToken: string
  otp: string
}

export type OtpVerifyResponse = {
  otpVerified: boolean
  sessionToken: string
  participationReady: boolean
}

export type VotePayload = {
  sessionToken: string
  candidateListId: string
}

export type VoteResponse = {
  success: boolean
  voteId?: string
  auditHash?: string
  castAt?: string
}

/** Enveloppe API standard du backend VoteGBDE */
export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export type ScrutinResultRow = {
  candidateListId: string
  name: string
  order: number
  votes: number
  percentage: number
}

export type PublishedScrutinResults = {
  scrutinId: string
  title: string
  status: string
  resultsPublishedAt: string
  totalVotes: number
  results: ScrutinResultRow[]
}
