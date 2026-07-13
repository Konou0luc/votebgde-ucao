import { isAxiosError } from 'axios'
import { httpClient } from '../../shared/api/http-client'
import type {
  ActiveScrutin,
  ApiEnvelope,
  OtpSendPayload,
  OtpSendResponse,
  OtpVerifyPayload,
  OtpVerifyResponse,
  PublishedScrutinResults,
  VotePayload,
  VoteResponse,
} from './types'

type ActiveScrutinApiData = {
  id: string
  title: string
  description: string | null
  startsAt: string
  endsAt: string
  status: string
  candidateLists: Array<{
    id: string
    name: string
    slogan: string | null
    description: string | null
    members: Array<{ name: string; role: string }>
    actionPlan: string[]
    videoUrl: string | null
    imageUrl: string | null
    order: number
  }>
}

type SendOtpApiData = {
  sessionToken: string
  expiresInMinutes: number
  email: string
  debugOtp?: string
}

type VerifyOtpApiData = {
  otpVerified: true
  sessionToken: string
  participationReady: true
}

type CastVoteApiData = {
  voted: true
  voteId: string
  auditHash: string
  castAt: string
}

export async function getActiveScrutin(): Promise<ActiveScrutin> {
  const response = await httpClient.get<ApiEnvelope<ActiveScrutinApiData>>('/scrutin/active')
  const { data } = response.data
  return {
    id: data.id,
    title: data.title,
    description: data.description ?? undefined,
    startsAt: data.startsAt,
    endsAt: data.endsAt,
    status: data.status,
    candidateLists: data.candidateLists.map((row) => ({
      id: row.id,
      name: row.name,
      slogan: row.slogan ?? '',
      description: row.description ?? undefined,
      members: row.members,
      actionPlan: row.actionPlan,
      videoUrl: row.videoUrl ?? undefined,
      imageUrl: row.imageUrl ?? undefined,
      order: row.order,
    })),
  }
}

export async function postSendOtp(payload: OtpSendPayload): Promise<OtpSendResponse> {
  const response = await httpClient.post<ApiEnvelope<SendOtpApiData>>('/otp/send', payload)
  const { data } = response.data
  return {
    sessionToken: data.sessionToken,
    expiresInMinutes: data.expiresInMinutes,
    emailMasked: data.email,
    debugOtp: data.debugOtp,
  }
}

export async function postVerifyOtp(payload: OtpVerifyPayload): Promise<OtpVerifyResponse> {
  const response = await httpClient.post<ApiEnvelope<VerifyOtpApiData>>('/otp/verify', payload)
  const { data } = response.data
  return {
    otpVerified: data.otpVerified,
    sessionToken: data.sessionToken,
    participationReady: data.participationReady,
  }
}

export async function postVote(payload: VotePayload): Promise<VoteResponse> {
  const response = await httpClient.post<ApiEnvelope<CastVoteApiData>>('/vote', payload)
  const { data } = response.data
  return {
    success: true,
    voteId: data.voteId,
    auditHash: data.auditHash,
    castAt: data.castAt,
  }
}

type PublishedResultsApiData = {
  scrutinId: string
  title: string
  status: string
  resultsPublishedAt: string
  totalVotes: number
  results: Array<{
    candidateListId: string
    name: string
    order: number
    votes: number
    percentage: number
  }>
}

export async function getPublishedScrutinResults(scrutinId: string): Promise<PublishedScrutinResults> {
  const response = await httpClient.get<ApiEnvelope<PublishedResultsApiData>>(
    `/scrutin/${scrutinId}/results`,
  )
  const { data } = response.data
  return {
    scrutinId: data.scrutinId,
    title: data.title,
    status: data.status,
    resultsPublishedAt: data.resultsPublishedAt,
    totalVotes: data.totalVotes,
    results: data.results.map((row) => ({
      candidateListId: row.candidateListId,
      name: row.name,
      order: row.order,
      votes: row.votes,
      percentage: row.percentage,
    })),
  }
}

export function getStudentFlowErrorMessage(error: unknown) {
  if (!isAxiosError(error)) {
    return 'Une erreur inattendue est survenue. Veuillez reessayer.'
  }

  const statusCode = error.response?.status
  const backendMessage =
    typeof error.response?.data === 'object' &&
    error.response.data !== null &&
    'message' in error.response.data &&
    typeof (error.response.data as { message: unknown }).message === 'string'
      ? (error.response.data as { message: string }).message.trim()
      : ''

  if (statusCode === 400 && backendMessage) {
    return backendMessage
  }

  if (statusCode === 401) {
    return backendMessage || 'Code OTP invalide. Verifiez et reessayez.'
  }

  if (statusCode === 404) {
    return backendMessage || 'Votre matricule n est pas autorise pour ce scrutin.'
  }

  if (statusCode === 409) {
    return backendMessage || 'Un vote a deja ete enregistre pour ce matricule.'
  }

  if (statusCode === 410) {
    return backendMessage || 'Session ou code expire. Demandez un nouveau code OTP.'
  }

  if (statusCode === 422) {
    return backendMessage || 'Donnees etudiant incompatibles avec le scrutin.'
  }

  if (statusCode === 423) {
    return backendMessage || 'Trop de tentatives. Reessayez plus tard.'
  }

  if (statusCode === 429) {
    return backendMessage || 'Veuillez patienter avant une nouvelle tentative.'
  }

  if (statusCode === 403) {
    return backendMessage || 'Action non autorisee pour le moment.'
  }

  if (statusCode === 503) {
    return backendMessage || 'Service temporairement indisponible. Reessayez plus tard.'
  }

  if (backendMessage) {
    return backendMessage
  }

  return 'Impossible de traiter la demande pour le moment.'
}
