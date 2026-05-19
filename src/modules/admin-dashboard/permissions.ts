import type { AdminUser } from './types'

export function adminHasPermission(admin: AdminUser | null | undefined, permission: string): boolean {
  return Boolean(admin?.permissions?.includes(permission))
}

export function canWriteElection(admin: AdminUser | null | undefined): boolean {
  return adminHasPermission(admin, 'scrutin:write')
}

export function canPublishResults(admin: AdminUser | null | undefined): boolean {
  return adminHasPermission(admin, 'results:publish')
}

export function canWriteCandidateList(admin: AdminUser | null | undefined): boolean {
  return adminHasPermission(admin, 'candidate-list:write')
}
