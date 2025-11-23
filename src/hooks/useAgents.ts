import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { agentsApi, type AgentFilters } from "@/api/agents"
import { toast } from "sonner"
import type { UpdateAgentInput } from "@/types/agent"

export const agentKeys = {
  all: ["agents"] as const,
  lists: () => [...agentKeys.all, "list"] as const,
  list: (filters?: AgentFilters) => [...agentKeys.lists(), { filters }] as const,
  details: () => [...agentKeys.all, "detail"] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
  usage: () => [...agentKeys.all, "usage"] as const,
}

export const useAgents = (filters?: AgentFilters) => {
  return useQuery({
    queryKey: agentKeys.list(filters),
    queryFn: () => agentsApi.getAll(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export const useAgent = (id: string) => {
  return useQuery({
    queryKey: agentKeys.detail(id),
    queryFn: () => agentsApi.getById(id),
    enabled: !!id,
  })
}

export const useUsageSummary = () => {
  return useQuery({
    queryKey: agentKeys.usage(),
    queryFn: agentsApi.getUsageSummary,
    staleTime: 1000 * 60 * 2, // 2 minutes for usage data
  })
}

export const useCreateAgent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: agentsApi.create,
    onSuccess: (newAgent) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: agentKeys.usage() })
      queryClient.setQueryData(agentKeys.detail(newAgent.id), newAgent)
      toast.success("Agent created successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to create agent: ${error.message}`)
    },
  })
}

export const useUpdateAgent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateAgentInput }) =>
      agentsApi.update(id, updates),
    onSuccess: (updatedAgent) => {
      queryClient.setQueryData(agentKeys.detail(updatedAgent.id), updatedAgent)
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
      toast.success("Agent updated successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to update agent: ${error.message}`)
    },
  })
}

export const useDeleteAgent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: agentsApi.delete,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: agentKeys.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: agentKeys.usage() })
      toast.success("Agent deleted successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete agent: ${error.message}`)
    },
  })
}

export const useDuplicateAgent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: agentsApi.duplicate,
    onSuccess: (newAgent) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
      queryClient.setQueryData(agentKeys.detail(newAgent.id), newAgent)
      toast.success("Agent duplicated successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to duplicate agent: ${error.message}`)
    },
  })
}

export const usePublishAgent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, changeSummary }: { id: string; changeSummary?: string }) =>
      agentsApi.publish(id, changeSummary),
    onSuccess: (publishedAgent) => {
      queryClient.setQueryData(agentKeys.detail(publishedAgent.id), publishedAgent)
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ["agent-versions"] })
      toast.success("Agent published successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish agent: ${error.message}`)
    },
  })
}

export const useBulkDeleteAgents = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => agentsApi.delete(id)))
    },
    onSuccess: (_, deletedIds) => {
      deletedIds.forEach(id => {
        queryClient.removeQueries({ queryKey: agentKeys.detail(id) })
      })
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: agentKeys.usage() })
      toast.success(`${deletedIds.length} agent(s) deleted successfully!`)
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete agents: ${error.message}`)
    },
  })
}
