import axios from 'axios'
import type { AdminUser, ApiEnvelope } from '../../modules/admin-dashboard/types'

const DEFAULT_API_URL = 'http://localhost:3000/api'

function apiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? DEFAULT_API_URL
}

export type AdminRefreshResponse = {
  accessToken: string
  refreshToken: string
  tokenType?: string
  expiresIn?: string
  admin?: AdminUser
}

/**
 * Appel direct (sans intercepteur axios) pour éviter les cycles et ne pas envoyer
 * le JWT expiré dans Authorization — le corps contient uniquement le refresh token.
 */
export async function refreshAdminSession(refreshToken: string): Promise<AdminRefreshResponse> {
  const response = await axios.post<ApiEnvelope<AdminRefreshResponse>>(
    `${apiBaseUrl()}/auth/refresh`,
    { refreshToken },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    },
  )
  return response.data.data
}
