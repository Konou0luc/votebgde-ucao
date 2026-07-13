import { isAxiosError } from 'axios'
import { httpClient } from '../../shared/api/http-client'
import type {
  AdminDashboardData,
  AdminLoginOtpPendingResponse,
  AdminRecord,
  ApiEnvelope,
  AuditLogRecord,
  CandidateListRecord,
  CreateAdminPayload,
  CreateCandidateListPayload,
  CreateElectionPayload,
  ElectionResultsData,
  LoginPayload,
  LoginResponse,
  ParticipationStats,
  ScrutinRecord,
  UpdateAdminPayload,
  UpdateCandidateListPayload,
  UpdateElectionPayload,
  VerifyLoginOtpPayload,
} from './types'

type LoginApiData = {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: string
  admin: LoginResponse['admin']
}

type LoginStep1ApiData = AdminLoginOtpPendingResponse

export async function postAdminLogin(payload: LoginPayload): Promise<AdminLoginOtpPendingResponse> {
  const response = await httpClient.post<ApiEnvelope<LoginStep1ApiData>>('/auth/login', payload)
  const { data } = response.data
  if (!data.otpRequired || !data.otpSessionToken) {
    throw new Error('Réponse de connexion inattendue.')
  }
  return data
}

export async function postAdminLoginVerify(payload: VerifyLoginOtpPayload): Promise<LoginResponse> {
  const response = await httpClient.post<ApiEnvelope<LoginApiData>>('/auth/login/verify', payload)
  const { data } = response.data
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
    admin: data.admin,
  }
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const response = await httpClient.get<ApiEnvelope<AdminDashboardData>>('/admin/dashboard')
  return response.data.data
}

export async function getAdminScrutins(): Promise<ScrutinRecord[]> {
  const response = await httpClient.get<ApiEnvelope<ScrutinRecord[]>>('/admin/scrutins')
  return response.data.data
}

export async function postAdminElection(payload: CreateElectionPayload): Promise<ScrutinRecord> {
  const response = await httpClient.post<ApiEnvelope<ScrutinRecord>>('/admin/scrutins', payload)
  return response.data.data
}

export async function patchAdminElection(id: string, payload: UpdateElectionPayload): Promise<ScrutinRecord> {
  const response = await httpClient.patch<ApiEnvelope<ScrutinRecord>>(`/admin/scrutins/${id}`, payload)
  return response.data.data
}

export async function archiveAdminElection(id: string): Promise<ScrutinRecord> {
  const response = await httpClient.delete<ApiEnvelope<ScrutinRecord>>(`/admin/scrutins/${id}`)
  return response.data.data
}

export async function publishAdminElectionResults(id: string): Promise<ScrutinRecord> {
  const response = await httpClient.post<ApiEnvelope<ScrutinRecord>>(`/admin/scrutins/${id}/publish-results`)
  return response.data.data
}

export async function getElectionParticipation(id: string): Promise<ParticipationStats> {
  const response = await httpClient.get<ApiEnvelope<ParticipationStats>>(`/admin/scrutins/${id}/participation`)
  return response.data.data
}

export async function getElectionResultsAdmin(id: string): Promise<ElectionResultsData> {
  const response = await httpClient.get<ApiEnvelope<ElectionResultsData>>(`/admin/scrutins/${id}/results`)
  return response.data.data
}

export async function getCandidateListsForScrutin(scrutinId: string): Promise<CandidateListRecord[]> {
  const response = await httpClient.get<ApiEnvelope<CandidateListRecord[]>>(
    `/admin/candidate-lists/scrutin/${scrutinId}`,
  )
  return response.data.data
}

export async function postCandidateList(payload: CreateCandidateListPayload): Promise<CandidateListRecord> {
  const formData = new FormData()
  
  formData.append('scrutinId', payload.scrutinId)
  formData.append('name', payload.name)
  formData.append('order', String(payload.order))
  
  if (payload.slogan) formData.append('slogan', payload.slogan)
  if (payload.description) formData.append('description', payload.description)
  
  if (payload.members) {
    formData.append('members', JSON.stringify(payload.members))
  }
  if (payload.actionPlan) {
    formData.append('actionPlan', JSON.stringify(payload.actionPlan))
  }
  
  if (payload.video instanceof File) formData.append('video', payload.video)
  if (payload.image instanceof File) formData.append('image', payload.image)

  const response = await httpClient.post<ApiEnvelope<CandidateListRecord>>('/admin/candidate-lists', formData)
  return response.data.data
}

export async function patchCandidateList(
  id: string,
  payload: UpdateCandidateListPayload,
): Promise<CandidateListRecord> {
  const formData = new FormData()
  
  if (payload.name) formData.append('name', payload.name)
  if (payload.order !== undefined) formData.append('order', String(payload.order))
  if (payload.isActive !== undefined) formData.append('isActive', String(payload.isActive))
  
  if (payload.slogan !== undefined) formData.append('slogan', payload.slogan || '')
  if (payload.description !== undefined) formData.append('description', payload.description || '')
  
  if (payload.members) {
    formData.append('members', JSON.stringify(payload.members))
  }
  if (payload.actionPlan) {
    formData.append('actionPlan', JSON.stringify(payload.actionPlan))
  }
  
  if (payload.video instanceof File) formData.append('video', payload.video)
  if (payload.image instanceof File) formData.append('image', payload.image)

  const response = await httpClient.patch<ApiEnvelope<CandidateListRecord>>(
    `/admin/candidate-lists/${id}`,
    formData,
  )
  return response.data.data
}

export async function deactivateCandidateList(id: string): Promise<CandidateListRecord> {
  const response = await httpClient.delete<ApiEnvelope<CandidateListRecord>>(`/admin/candidate-lists/${id}`)
  return response.data.data
}

export async function getAdminUsers(): Promise<AdminRecord[]> {
  const response = await httpClient.get<ApiEnvelope<AdminRecord[]>>('/admin/users')
  return response.data.data
}

export async function postAdminUser(payload: CreateAdminPayload): Promise<AdminRecord> {
  const response = await httpClient.post<ApiEnvelope<AdminRecord>>('/admin/users', payload)
  return response.data.data
}

export async function patchAdminUser(id: string, payload: UpdateAdminPayload): Promise<AdminRecord> {
  const response = await httpClient.patch<ApiEnvelope<AdminRecord>>(`/admin/users/${id}`, payload)
  return response.data.data
}

export async function deleteAdminUser(id: string): Promise<void> {
  await httpClient.delete(`/admin/users/${id}`)
}

export async function getAdminAuditLogs(): Promise<AuditLogRecord[]> {
  const response = await httpClient.get<ApiEnvelope<AuditLogRecord[]>>('/admin/audit-logs')
  return response.data.data
}

export async function purgeAdminAuditLogs(): Promise<void> {
  await httpClient.delete('/admin/audit-logs')
}


function extractAttemptsLeft(errors: unknown): number | null {
  if (!Array.isArray(errors)) return null
  for (const item of errors) {
    if (
      typeof item === 'object' &&
      item !== null &&
      'attemptsLeft' in item &&
      typeof (item as { attemptsLeft: unknown }).attemptsLeft === 'number'
    ) {
      return (item as { attemptsLeft: number }).attemptsLeft
    }
  }
  return null
}

export function getAdminErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError(error)) return fallback
  const body = error.response?.data
  const msg =
    typeof body === 'object' &&
    body !== null &&
    'message' in body &&
    typeof (body as { message: unknown }).message === 'string'
      ? (body as { message: string }).message.trim()
      : ''
  const base = msg || fallback
  const attemptsLeft =
    typeof body === 'object' && body !== null && 'errors' in body
      ? extractAttemptsLeft((body as { errors: unknown }).errors)
      : null
  if (attemptsLeft !== null && attemptsLeft >= 0 && error.response?.status === 401) {
    return `${base} (${attemptsLeft} tentative${attemptsLeft > 1 ? 's' : ''} restante${attemptsLeft > 1 ? 's' : ''}.)`
  }
  return base
}
