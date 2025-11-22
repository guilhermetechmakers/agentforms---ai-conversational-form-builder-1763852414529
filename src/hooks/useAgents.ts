import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { agentsApi } from "@/api/agents"
import { toast } from "sonner"
import type { UpdateAgentInput } from "@/types/agent"

export const agentKeys = {
  all: ["agents"] as const,
  lists: () => [...agentKeys.all, "list"] as const,
  list: (filters: string) => [...agentKeys.lists(), { filters }] as const,
  details: () => [...agentKeys.all, "detail"] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
}

export const useAgents = () => {
  return useQuery({
    queryKey: agentKeys.lists(),
    queryFn: agentsApi.getAll,
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

export const useCreateAgent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: agentsApi.create,
    onSuccess: (newAgent) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
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
      toast.success("Agent deleted successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete agent: ${error.message}`)
    },
  })
}
