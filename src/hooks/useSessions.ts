import { useQuery } from "@tanstack/react-query"
import { sessionsApi } from "@/api/sessions"

export const sessionKeys = {
  all: ["sessions"] as const,
  lists: () => [...sessionKeys.all, "list"] as const,
  list: (agentId?: string) => [...sessionKeys.lists(), { agentId }] as const,
  details: () => [...sessionKeys.all, "detail"] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as const,
}

export const useSessions = (agentId?: string) => {
  return useQuery({
    queryKey: sessionKeys.list(agentId),
    queryFn: () => sessionsApi.getAll(agentId),
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
