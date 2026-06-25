import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as api from '@/api/api'

// ── Setup ───────────────────────────────────────────────────────────────────

export function useSetup() {
  return useQuery({
    queryKey: ['setup'],
    queryFn: api.fetchSetup,
  })
}

export function useCreateSetup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createSetup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Operation failed')
    },
  })
}

export function useUpdateSetup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.updateSetup(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['setup'] })
      queryClient.invalidateQueries({ queryKey: ['setup', id] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Operation failed')
    },
  })
}

export function useDeleteSetup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteSetup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setup'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Operation failed')
    },
  })
}

// ── Favorite Setup ──────────────────────────────────────────────────────────

export function useFavoriteSetups() {
  return useQuery({
    queryKey: ['favoriteSetups'],
    queryFn: api.fetchFavoriteSetups,
  })
}

export function useCreateFavoriteSetup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createFavoriteSetup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteSetups'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Operation failed')
    },
  })
}

export function useUpdateFavoriteSetup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.updateFavoriteSetup(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['favoriteSetups'] })
      queryClient.invalidateQueries({ queryKey: ['favoriteSetups', id] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Operation failed')
    },
  })
}

export function useDeleteFavoriteSetup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteFavoriteSetup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteSetups'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Operation failed')
    },
  })
}

// ── Favorite Medicine ───────────────────────────────────────────────────────

export function useFavoriteMedicines() {
  return useQuery({
    queryKey: ['favoriteMedicines'],
    queryFn: api.fetchFavoriteMedicines,
  })
}

export function useCreateFavoriteMedicine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createFavoriteMedicine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteMedicines'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Operation failed')
    },
  })
}

export function useUpdateFavoriteMedicine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.updateFavoriteMedicine(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['favoriteMedicines'] })
      queryClient.invalidateQueries({ queryKey: ['favoriteMedicines', id] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Operation failed')
    },
  })
}

export function useDeleteFavoriteMedicine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteFavoriteMedicine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteMedicines'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Operation failed')
    },
  })
}

// ── Instruction ─────────────────────────────────────────────────────────────

export function useInstructions() {
  return useQuery({
    queryKey: ['instructions'],
    queryFn: api.fetchInstructions,
  })
}

export function useCreateInstruction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createInstruction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructions'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Operation failed')
    },
  })
}

export function useUpdateInstruction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.updateInstruction(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['instructions'] })
      queryClient.invalidateQueries({ queryKey: ['instructions', id] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Operation failed')
    },
  })
}

export function useDeleteInstruction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteInstruction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructions'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Operation failed')
    },
  })
}

// ── Route Type ──────────────────────────────────────────────────────────────

export function useRouteTypes() {
  return useQuery({
    queryKey: ['routeTypes'],
    queryFn: api.fetchRouteTypes,
  })
}

export function useCreateRouteType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createRouteType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routeTypes'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Operation failed')
    },
  })
}

export function useUpdateRouteType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.updateRouteType(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['routeTypes'] })
      queryClient.invalidateQueries({ queryKey: ['routeTypes', id] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Operation failed')
    },
  })
}

export function useDeleteRouteType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteRouteType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routeTypes'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Operation failed')
    },
  })
}
