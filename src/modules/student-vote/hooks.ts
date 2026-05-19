import { useMutation, useQuery } from '@tanstack/react-query'
import { getActiveScrutin, getPublishedScrutinResults, postSendOtp, postVerifyOtp, postVote } from './api'
import type { OtpSendPayload, OtpVerifyPayload, VotePayload } from './types'

export function useActiveScrutinQuery() {
  return useQuery({
    queryKey: ['active-scrutin'],
    queryFn: getActiveScrutin,
  })
}

export function usePublishedScrutinResultsQuery(scrutinId: string | undefined) {
  return useQuery({
    queryKey: ['scrutin-published-results', scrutinId],
    queryFn: () => getPublishedScrutinResults(scrutinId as string),
    enabled: Boolean(scrutinId),
    retry: false,
  })
}

export function useSendOtpMutation() {
  return useMutation({
    mutationFn: (payload: OtpSendPayload) => postSendOtp(payload),
  })
}

export function useVerifyOtpMutation() {
  return useMutation({
    mutationFn: (payload: OtpVerifyPayload) => postVerifyOtp(payload),
  })
}

export function useVoteMutation() {
  return useMutation({
    mutationFn: (payload: VotePayload) => postVote(payload),
  })
}
