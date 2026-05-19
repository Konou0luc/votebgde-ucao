import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getAdminAccessToken, useAdminAuthStore } from '../../modules/admin-dashboard/auth-store'
import { refreshAdminSession } from './auth-admin-refresh'

const DEFAULT_API_URL = 'http://localhost:3000/api'

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? DEFAULT_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/** Une seule vague de refresh si plusieurs requêtes /admin reçoivent 401 en parallèle */
let refreshPromise: Promise<void> | null = null

async function refreshAdminTokensOnce(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const rt = useAdminAuthStore.getState().refreshToken
      if (!rt) throw new Error('missing refresh token')
      const data = await refreshAdminSession(rt)
      const admin = data.admin ?? useAdminAuthStore.getState().admin
      if (!admin) throw new Error('missing admin profile')
      useAdminAuthStore.getState().setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        admin,
      })
    })().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

httpClient.interceptors.request.use((config) => {
  const token = getAdminAccessToken()
  if (!token) return config
  const url = typeof config.url === 'string' ? config.url : ''
  if (url.startsWith('/admin')) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    const status = error.response?.status

    if (!originalRequest || status !== 401) {
      return Promise.reject(error)
    }

    const url = originalRequest.url ?? ''
    if (!url.startsWith('/admin')) {
      return Promise.reject(error)
    }

    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      await refreshAdminTokensOnce()
      const token = getAdminAccessToken()
      if (!token) throw new Error('no access token after refresh')
      originalRequest.headers.set('Authorization', `Bearer ${token}`)
      return httpClient.request(originalRequest)
    } catch {
      useAdminAuthStore.getState().logout()
      return Promise.reject(error)
    }
  },
)
