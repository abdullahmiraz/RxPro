import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/api'

export function useDoctorInfo(doctorId: string | undefined) {
  return useQuery({
    queryKey: ['doctorInfo', doctorId],
    queryFn: () => api.fetchDoctorInfo(doctorId!),
    enabled: !!doctorId,
  })
}

export function useUpsertDoctorInfo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.upsertDoctorInfo(data),
    onSuccess: (result) => {
      const doctorId = (result as Record<string, unknown> | undefined)?.doctor_id as string | undefined
      queryClient.invalidateQueries({ queryKey: ['doctorInfo'] })
      if (doctorId) {
        queryClient.invalidateQueries({ queryKey: ['doctorInfo', doctorId] })
      }
    },
  })
}
