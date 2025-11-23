import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { testSessionsApi, type TestSessionFilters } from "@/api/test-sessions"
import { toast } from "sonner"
import type { TestSessionUpdate } from "@/types/test-session"

export const testSessionKeys = {
  all: ["test_sessions"] as const,
  lists: () => [...testSessionKeys.all, "list"] as const,
  list: (filters?: TestSessionFilters) => [...testSessionKeys.lists(), { filters }] as const,
  details: () => [...testSessionKeys.all, "detail"] as const,
  detail: (id: string) => [...testSessionKeys.details(), id] as const,
}

export const useTestSessions = (filters?: TestSessionFilters) => {
  return useQuery({
    queryKey: testSessionKeys.list(filters),
    queryFn: () => testSessionsApi.getAll(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export const useTestSession = (id: string) => {
  return useQuery({
    queryKey: testSessionKeys.detail(id),
    queryFn: () => testSessionsApi.getById(id),
    enabled: !!id,
  })
}

export const useCreateTestSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: testSessionsApi.create,
    onSuccess: (newTestSession) => {
      queryClient.invalidateQueries({ queryKey: testSessionKeys.lists() })
      queryClient.setQueryData(testSessionKeys.detail(newTestSession.id), newTestSession)
      toast.success("Test session saved successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to save test session: ${error.message}`)
    },
  })
}

export const useUpdateTestSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TestSessionUpdate }) =>
      testSessionsApi.update(id, updates),
    onSuccess: (updatedTestSession) => {
      queryClient.setQueryData(testSessionKeys.detail(updatedTestSession.id), updatedTestSession)
      queryClient.invalidateQueries({ queryKey: testSessionKeys.lists() })
      toast.success("Test session updated successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to update test session: ${error.message}`)
    },
  })
}

export const useDeleteTestSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: testSessionsApi.delete,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: testSessionKeys.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: testSessionKeys.lists() })
      toast.success("Test session deleted successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete test session: ${error.message}`)
    },
  })
}
