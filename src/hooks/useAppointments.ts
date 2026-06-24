import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/api'

export function useAppointments(doctorId: string | undefined) {
  return useQuery({
    queryKey: ['appointments', { doctorId }],
    queryFn: () => api.fetchAppointments(doctorId!),
    enabled: !!doctorId,
  })
}

export function useAppointment(id: string | undefined) {
  return useQuery({
    queryKey: ['appointments', id],
    queryFn: () => api.fetchAppointment(id!),
    enabled: !!id,
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.updateAppointment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointments', id] })
    },
  })
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}
