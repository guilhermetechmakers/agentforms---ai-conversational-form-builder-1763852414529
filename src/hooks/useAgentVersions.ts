import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { agentVersionsApi } from "@/api/agent-versions"
import { toast } from "sonner"

export const agentVersionKeys = {
  all: ["agent-versions"] as const,
  lists: () => [...agentVersionKeys.all, "list"] as const,
  list: (agentId: string) => [...agentVersionKeys.lists(), agentId] as const,
  details: () => [...agentVersionKeys.all, "detail"] as const,
  detail: (id: string) => [...agentVersionKeys.details(), id] as const,
  byVersion: (agentId: string, versionNumber: number) =>
    [...agentVersionKeys.details(), agentId, versionNumber] as const,
}

export const useAgentVersions = (agentId: string) => {
  return useQuery({
    queryKey: agentVersionKeys.list(agentId),
    queryFn: () => agentVersionsApi.getByAgentId(agentId),
    enabled: !!agentId,
    staleTime: 1000 * 60 * 5,
  })
}

export const useAgentVersion = (id: string) => {
  return useQuery({
    queryKey: agentVersionKeys.detail(id),
    queryFn: () => agentVersionsApi.getById(id),
    enabled: !!id,
  })
}

export const useAgentVersionByNumber = (
  agentId: string,
  versionNumber: number
) => {
  return useQuery({
    queryKey: agentVersionKeys.byVersion(agentId, versionNumber),
    queryFn: () => agentVersionsApi.getByVersionNumber(agentId, versionNumber),
    enabled: !!agentId && versionNumber > 0,
  })
}

export const useCreateAgentVersion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      agentId,
      changeSummary,
    }: {
      agentId: string
      changeSummary?: string
    }) => agentVersionsApi.createVersion(agentId, changeSummary),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: agentVersionKeys.list(variables.agentId),
      })
      toast.success("Version snapshot created successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to create version: ${error.message}`)
    },
  })
}

export const useVersionDiff = (
  agentId: string,
  fromVersion: number,
  toVersion: number,
  enabled = true
) => {
  return useQuery({
    queryKey: [
      ...agentVersionKeys.all,
      "diff",
      agentId,
      fromVersion,
      toVersion,
    ],
    queryFn: () =>
      agentVersionsApi.getVersionDiff(agentId, fromVersion, toVersion),
    enabled: enabled && !!agentId && fromVersion > 0 && toVersion > 0,
  })
}
