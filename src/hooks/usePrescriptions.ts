import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/api'

export function usePrescriptions(doctorId: string | undefined) {
  return useQuery({
    queryKey: ['prescriptions', { doctorId }],
    queryFn: () => api.fetchPrescriptions(doctorId!),
    enabled: !!doctorId,
  })
}

export function usePrescription(id: string | undefined) {
  return useQuery({
    queryKey: ['prescriptions', id],
    queryFn: () => api.fetchPrescription(id!),
    enabled: !!id,
  })
}

export function useCreatePrescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createPrescription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
    },
  })
}

export function useUpdatePrescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.updatePrescription(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
      queryClient.invalidateQueries({ queryKey: ['prescriptions', id] })
    },
  })
}

export function useDeletePrescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deletePrescription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
    },
  })
}
