import { useMutation, useQuery } from '@tanstack/react-query'
import {
  getActiveScrutin,
  getPublishedScrutinResults,
  getRegistrationOptions,
  postRegistrationStart,
  postRegistrationVerify,
  postSendOtp,
  postVerifyOtp,
  postVote,
} from './api'
import type { OtpSendPayload, OtpVerifyPayload, StudentRegistrationPayload, VotePayload } from './types'

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

/**
 * Phase du site : tant qu'aucun vote n'est ouvert, les étudiants s'inscrivent ;
 * dès qu'un vote est ouvert, ils votent.
 */
export function useVotePhase() {
  const query = useActiveScrutinQuery()
  const isVoteOpen = Boolean(query.data)
  return {
    isVoteOpen,
    isLoading: query.isLoading,
    scrutin: query.data,
    cta: isVoteOpen ? { to: '/vote', label: 'Voter' } : { to: '/inscription', label: "S'inscrire" },
  }
}

export function useRegistrationOptionsQuery() {
  return useQuery({
    queryKey: ['registration-options'],
    queryFn: getRegistrationOptions,
    staleTime: 1000 * 60 * 5,
  })
}

export function useRegistrationStartMutation() {
  return useMutation({
    mutationFn: (payload: StudentRegistrationPayload) => postRegistrationStart(payload),
  })
}

export function useRegistrationVerifyMutation() {
  return useMutation({
    mutationFn: (payload: { sessionToken: string; otp: string }) => postRegistrationVerify(payload),
  })
}
