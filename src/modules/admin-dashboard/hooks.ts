import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  archiveAdminElection,
  deactivateCandidateList,
  deleteAdminUser,
  getAdminAuditLogs,
  getAdminDashboard,
  getAdminScrutins,
  getAdminUsers,
  getCandidateListsForScrutin,
  getElectionParticipation,
  getElectionResultsAdmin,
  patchAdminElection,
  patchAdminUser,
  patchCandidateList,
  postAdminElection,
  postAdminLogin,
  postAdminLoginVerify,
  postAdminUser,
  postCandidateList,
  publishAdminElectionResults,
  purgeAdminAuditLogs,
} from './api'
import type {
  CreateAdminPayload,
  CreateCandidateListPayload,
  CreateElectionPayload,
  LoginPayload,
  UpdateAdminPayload,
  UpdateCandidateListPayload,
  UpdateElectionPayload,
  VerifyLoginOtpPayload,
} from './types'
import { useAdminAuthStore } from './auth-store'

export function useAdminLoginMutation() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => postAdminLogin(payload),
  })
}

export function useAdminLoginVerifyMutation() {
  return useMutation({
    mutationFn: (payload: VerifyLoginOtpPayload) => postAdminLoginVerify(payload),
  })
}

export function useAdminDashboardQuery() {
  const token = useAdminAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['admin', 'dashboard', token],
    queryFn: getAdminDashboard,
    enabled: Boolean(token),
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export function useAdminScrutinsQuery() {
  const token = useAdminAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['admin', 'scrutins', token],
    queryFn: getAdminScrutins,
    enabled: Boolean(token),
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

function useInvalidateElectionCaches() {
  const queryClient = useQueryClient()
  const token = useAdminAuthStore((s) => s.accessToken)
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', token] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'scrutins', token] })
  }
}

export function useElectionParticipationQuery(electionId: string | undefined) {
  const token = useAdminAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['admin', 'election-participation', electionId, token],
    queryFn: () => getElectionParticipation(electionId as string),
    enabled: Boolean(token && electionId),
    staleTime: 0,
  })
}

export function useElectionResultsAdminQuery(electionId: string | undefined, enabled: boolean) {
  const token = useAdminAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['admin', 'election-results', electionId, token],
    queryFn: () => getElectionResultsAdmin(electionId as string),
    enabled: Boolean(token && electionId && enabled),
    staleTime: 0,
  })
}

export function useCandidateListsQuery(scrutinId: string | undefined) {
  const token = useAdminAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['admin', 'candidate-lists', scrutinId, token],
    queryFn: () => getCandidateListsForScrutin(scrutinId as string),
    enabled: Boolean(token && scrutinId),
    staleTime: 0,
  })
}

export function useCreateElectionMutation() {
  const invalidate = useInvalidateElectionCaches()
  return useMutation({
    mutationFn: (payload: CreateElectionPayload) => postAdminElection(payload),
    onSuccess: () => invalidate(),
  })
}

export function useUpdateElectionMutation(electionId: string) {
  const invalidate = useInvalidateElectionCaches()
  const queryClient = useQueryClient()
  const token = useAdminAuthStore((s) => s.accessToken)
  return useMutation({
    mutationFn: (payload: UpdateElectionPayload) => patchAdminElection(electionId, payload),
    onSuccess: () => {
      invalidate()
      void queryClient.invalidateQueries({ queryKey: ['admin', 'election-participation', electionId, token] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'election-results', electionId, token] })
    },
  })
}

export function useArchiveElectionMutation() {
  const invalidate = useInvalidateElectionCaches()
  return useMutation({
    mutationFn: (id: string) => archiveAdminElection(id),
    onSuccess: () => invalidate(),
  })
}

export function usePublishElectionResultsMutation() {
  const invalidate = useInvalidateElectionCaches()
  const queryClient = useQueryClient()
  const token = useAdminAuthStore((s) => s.accessToken)
  return useMutation({
    mutationFn: (id: string) => publishAdminElectionResults(id),
    onSuccess: (_data, id) => {
      invalidate()
      void queryClient.invalidateQueries({ queryKey: ['admin', 'election-results', id, token] })
    },
  })
}

export function useCreateCandidateListMutation(scrutinId: string) {
  const queryClient = useQueryClient()
  const token = useAdminAuthStore((s) => s.accessToken)
  return useMutation({
    mutationFn: (payload: CreateCandidateListPayload) => postCandidateList(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'candidate-lists', scrutinId, token] })
    },
  })
}

export function useDeactivateCandidateListMutation(scrutinId: string) {
  const queryClient = useQueryClient()
  const token = useAdminAuthStore((s) => s.accessToken)
  return useMutation({
    mutationFn: (id: string) => deactivateCandidateList(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'candidate-lists', scrutinId, token] })
    },
  })
}

export function usePatchCandidateListMutation(scrutinId: string) {
  const queryClient = useQueryClient()
  const token = useAdminAuthStore((s) => s.accessToken)
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCandidateListPayload }) =>
      patchCandidateList(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'candidate-lists', scrutinId, token] })
    },
  })
}

export function useAdminUsersQuery() {
  const token = useAdminAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['admin', 'users', token],
    queryFn: getAdminUsers,
    enabled: Boolean(token),
  })
}

export function useCreateAdminMutation() {
  const queryClient = useQueryClient()
  const token = useAdminAuthStore((s) => s.accessToken)
  return useMutation({
    mutationFn: (payload: CreateAdminPayload) => postAdminUser(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users', token] })
    },
  })
}

export function useUpdateAdminMutation() {
  const queryClient = useQueryClient()
  const token = useAdminAuthStore((s) => s.accessToken)
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAdminPayload }) => patchAdminUser(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users', token] })
    },
  })
}

export function useDeleteAdminMutation() {
  const queryClient = useQueryClient()
  const token = useAdminAuthStore((s) => s.accessToken)
  return useMutation({
    mutationFn: (id: string) => deleteAdminUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users', token] })
    },
  })
}

export function useAdminAuditLogsQuery() {
  const token = useAdminAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: ['admin', 'audit-logs', token],
    queryFn: getAdminAuditLogs,
    enabled: Boolean(token),
  })
}

export function usePurgeAuditLogsMutation() {
  const queryClient = useQueryClient()
  const token = useAdminAuthStore((s) => s.accessToken)
  return useMutation({
    mutationFn: purgeAdminAuditLogs,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs', token] })
    },
  })
}

