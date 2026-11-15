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
  RegistrationOptions,
  RegistrationStartResult,
  StudentRegistrationPayload,
  StudentRegistrationResult,
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

export async function getRegistrationOptions(): Promise<RegistrationOptions> {
  const response = await httpClient.get<ApiEnvelope<RegistrationOptions>>('/registration/options')
  return response.data.data
}

/** Étape 1 : contrôle des données et envoi d'un code à l'e-mail saisi. */
export async function postRegistrationStart(payload: StudentRegistrationPayload): Promise<RegistrationStartResult> {
  const response = await httpClient.post<ApiEnvelope<RegistrationStartResult>>('/registration/start', payload)
  return response.data.data
}

/** Étape 2 : vérification du code ; l'étudiant est alors inscrit (e-mail lié au matricule). */
export async function postRegistrationVerify(payload: { sessionToken: string; otp: string }): Promise<StudentRegistrationResult> {
  const response = await httpClient.post<ApiEnvelope<StudentRegistrationResult>>('/registration/verify', payload)
  return response.data.data
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

export function isOtpExpiredError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 410
}

export function getStudentFlowErrorMessage(error: unknown) {
  if (!isAxiosError(error)) {
    return 'Une erreur inattendue est survenue. Veuillez réessayer.'
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
    return backendMessage || 'Code incorrect. Vérifiez et réessayez.'
  }

  if (statusCode === 404) {
    return backendMessage || 'Votre matricule n’est pas autorisé pour ce vote.'
  }

  if (statusCode === 409) {
    return backendMessage || 'Un vote a déjà été enregistré pour ce matricule.'
  }

  if (statusCode === 410) {
    return 'Votre code a expiré. Demandez un nouveau code pour continuer.'
  }

  if (statusCode === 422) {
    return backendMessage || 'Informations étudiant incompatibles avec ce vote.'
  }

  if (statusCode === 423) {
    return backendMessage || 'Trop de tentatives. Réessayez plus tard.'
  }

  if (statusCode === 429) {
    return backendMessage || 'Veuillez patienter avant une nouvelle tentative.'
  }

  if (statusCode === 403) {
    if (/ne correspond pas/i.test(backendMessage)) {
      return 'Cet e-mail ne correspond pas à celui utilisé lors de l’inscription de ce matricule. Utilisez l’e-mail de votre inscription.'
    }
    return backendMessage || 'Action non autorisée pour le moment.'
  }

  if (statusCode === 503) {
    return backendMessage || 'Service temporairement indisponible. Réessayez plus tard.'
  }

  if (backendMessage) {
    return backendMessage
  }

  return 'Impossible de traiter la demande pour le moment.'
}

/** Messages d'erreur clairs pour le formulaire d'inscription. */
export function getRegistrationErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) return 'Une erreur inattendue est survenue. Veuillez réessayer.'
  const status = error.response?.status
  const data = error.response?.data as { message?: unknown } | undefined
  const backendMessage = typeof data?.message === 'string' ? data.message.trim() : ''

  if (status === 409) {
    return /mail/i.test(backendMessage)
      ? 'Cet e-mail est déjà utilisé par un autre étudiant.'
      : 'Ce matricule est déjà inscrit. Si vous pensez qu’il s’agit d’une erreur, contactez l’administration.'
  }
  if (status === 401) {
    const details = (error.response?.data as { errors?: Array<{ attemptsLeft?: number }> } | undefined)?.errors
    const left = details?.[0]?.attemptsLeft
    return typeof left === 'number' && left > 0
      ? `Code incorrect. Il vous reste ${left} tentative${left > 1 ? 's' : ''}.`
      : 'Code incorrect.'
  }
  if (status === 410) return 'Ce code a expiré. Demandez un nouveau code.'
  if (status === 423) return 'Trop de tentatives. Demandez un nouveau code.'
  if (status === 404) return 'Votre session d’inscription a expiré. Recommencez l’inscription.'
  if (status === 403) return 'Les inscriptions sont fermées : un vote est en cours.'
  if (status === 422) return 'Institut, filière ou année invalide. Vérifiez vos choix.'
  if (status === 400) return 'Certaines informations sont invalides. Vérifiez le formulaire.'
  if (status === 429) return 'Trop de tentatives. Patientez quelques minutes avant de réessayer.'
  if (status === 503) return 'Le service d’inscription est momentanément indisponible. Réessayez plus tard.'
  return backendMessage || 'Impossible d’enregistrer votre inscription pour le moment.'
}
