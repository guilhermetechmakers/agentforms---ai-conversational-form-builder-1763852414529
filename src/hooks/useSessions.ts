import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sessionsApi, type SessionFilters } from "@/api/sessions"
import { toast } from "sonner"

export const sessionKeys = {
  all: ["sessions"] as const,
  lists: () => [...sessionKeys.all, "list"] as const,
  list: (filters?: SessionFilters) => [...sessionKeys.lists(), { filters }] as const,
  details: () => [...sessionKeys.all, "detail"] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as const,
}

export const useSessions = (filters?: SessionFilters) => {
  return useQuery({
    queryKey: sessionKeys.list(filters),
    queryFn: () => sessionsApi.getAll(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export const useSession = (id: string) => {
  return useQuery({
    queryKey: sessionKeys.detail(id),
    queryFn: () => sessionsApi.getById(id),
    enabled: !!id,
  })
}

export const useDeleteSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sessionsApi.delete,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() })
      toast.success("Session deleted successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete session: ${error.message}`)
    },
  })
}

export const useRestoreSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sessionsApi.restore,
    onSuccess: (_, restoredId) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(restoredId) })
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() })
      toast.success("Session restored successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to restore session: ${error.message}`)
    },
  })
}

export const useDeleteSessions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sessionsApi.deleteMany,
    onSuccess: (_, deletedIds) => {
      deletedIds.forEach(id => {
        queryClient.removeQueries({ queryKey: sessionKeys.detail(id) })
      })
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() })
      toast.success(`${deletedIds.length} session(s) deleted successfully!`)
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete sessions: ${error.message}`)
    },
  })
}

export const useExportSessions = () => {
  return useMutation({
    mutationFn: ({ ids, format }: { ids: string[]; format: "csv" | "json" }) =>
      sessionsApi.export(ids, format),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `sessions-export-${Date.now()}.${variables.format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success(`Exported ${variables.ids.length} session(s) as ${variables.format.toUpperCase()}`)
    },
    onError: (error: Error) => {
      toast.error(`Failed to export sessions: ${error.message}`)
    },
  })
}

export const useUpdateFieldValue = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      sessionId,
      fieldId,
      value,
    }: {
      sessionId: string
      fieldId: string
      value: string | number | string[] | Record<string, unknown>
    }) => sessionsApi.updateFieldValue(sessionId, fieldId, value),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(variables.sessionId) })
      toast.success("Field value updated successfully")
    },
    onError: (error: Error) => {
      toast.error(`Failed to update field: ${error.message}`)
    },
  })
}

export const useRedactPII = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, fieldIds }: { sessionId: string; fieldIds?: string[] }) =>
      sessionsApi.redactPII(sessionId, fieldIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(variables.sessionId) })
      toast.success("PII redacted successfully")
    },
    onError: (error: Error) => {
      toast.error(`Failed to redact PII: ${error.message}`)
    },
  })
}

export const useResendWebhook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) => sessionsApi.resendWebhook(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) })
      toast.success("Webhook resent successfully")
    },
    onError: (error: Error) => {
      toast.error(`Failed to resend webhook: ${error.message}`)
    },
  })
}

export const useMarkReviewed = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) => sessionsApi.markReviewed(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) })
      toast.success("Session marked as reviewed")
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark as reviewed: ${error.message}`)
    },
  })
}

export const useSessionAuditTrail = (sessionId: string) => {
  return useQuery({
    queryKey: [...sessionKeys.detail(sessionId), "audit-trail"],
    queryFn: () => sessionsApi.getAuditTrail(sessionId),
    enabled: !!sessionId,
  })
}
