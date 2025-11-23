import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { llmOrchestrationApi, type PromptFilters, type ResponseFilters, type UsageLogFilters } from "@/api/llm-orchestration"
import { toast } from "sonner"
import type {
  UpdatePromptInput,
  UpdateResponseInput,
} from "@/types/llm-orchestration"

// =====================================================
// QUERY KEYS
// =====================================================

export const llmOrchestrationKeys = {
  all: ["llm-orchestration"] as const,
  prompts: () => [...llmOrchestrationKeys.all, "prompts"] as const,
  promptLists: () => [...llmOrchestrationKeys.prompts(), "list"] as const,
  promptList: (filters?: PromptFilters) => [...llmOrchestrationKeys.promptLists(), { filters }] as const,
  promptDetails: () => [...llmOrchestrationKeys.prompts(), "detail"] as const,
  promptDetail: (id: string) => [...llmOrchestrationKeys.promptDetails(), id] as const,
  responses: () => [...llmOrchestrationKeys.all, "responses"] as const,
  responseLists: () => [...llmOrchestrationKeys.responses(), "list"] as const,
  responseList: (filters?: ResponseFilters) => [...llmOrchestrationKeys.responseLists(), { filters }] as const,
  responseDetails: () => [...llmOrchestrationKeys.responses(), "detail"] as const,
  responseDetail: (id: string) => [...llmOrchestrationKeys.responseDetails(), id] as const,
  usageLogs: () => [...llmOrchestrationKeys.all, "usage-logs"] as const,
  usageLogLists: () => [...llmOrchestrationKeys.usageLogs(), "list"] as const,
  usageLogList: (filters?: UsageLogFilters) => [...llmOrchestrationKeys.usageLogLists(), { filters }] as const,
  usageLogDetails: () => [...llmOrchestrationKeys.usageLogs(), "detail"] as const,
  usageLogDetail: (id: string) => [...llmOrchestrationKeys.usageLogDetails(), id] as const,
  usageSummary: (agentId?: string) => [...llmOrchestrationKeys.usageLogs(), "summary", agentId] as const,
}

// =====================================================
// PROMPTS
// =====================================================

export const usePrompts = (filters?: PromptFilters) => {
  return useQuery({
    queryKey: llmOrchestrationKeys.promptList(filters),
    queryFn: () => llmOrchestrationApi.getAllPrompts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const usePrompt = (id: string) => {
  return useQuery({
    queryKey: llmOrchestrationKeys.promptDetail(id),
    queryFn: () => llmOrchestrationApi.getPromptById(id),
    enabled: !!id,
  })
}

export const useCreatePrompt = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: llmOrchestrationApi.createPrompt,
    onSuccess: (newPrompt) => {
      queryClient.invalidateQueries({ queryKey: llmOrchestrationKeys.promptLists() })
      queryClient.setQueryData(llmOrchestrationKeys.promptDetail(newPrompt.id), newPrompt)
      toast.success("Prompt created successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to create prompt: ${error.message}`)
    },
  })
}

export const useUpdatePrompt = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdatePromptInput }) =>
      llmOrchestrationApi.updatePrompt(id, updates),
    onSuccess: (updatedPrompt) => {
      queryClient.setQueryData(llmOrchestrationKeys.promptDetail(updatedPrompt.id), updatedPrompt)
      queryClient.invalidateQueries({ queryKey: llmOrchestrationKeys.promptLists() })
      toast.success("Prompt updated successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to update prompt: ${error.message}`)
    },
  })
}

export const useDeletePrompt = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: llmOrchestrationApi.deletePrompt,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: llmOrchestrationKeys.promptDetail(deletedId) })
      queryClient.invalidateQueries({ queryKey: llmOrchestrationKeys.promptLists() })
      toast.success("Prompt deleted successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete prompt: ${error.message}`)
    },
  })
}

// =====================================================
// RESPONSES
// =====================================================

export const useResponses = (filters?: ResponseFilters) => {
  return useQuery({
    queryKey: llmOrchestrationKeys.responseList(filters),
    queryFn: () => llmOrchestrationApi.getAllResponses(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useResponse = (id: string) => {
  return useQuery({
    queryKey: llmOrchestrationKeys.responseDetail(id),
    queryFn: () => llmOrchestrationApi.getResponseById(id),
    enabled: !!id,
  })
}

export const useCreateResponse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: llmOrchestrationApi.createResponse,
    onSuccess: (newResponse) => {
      queryClient.invalidateQueries({ queryKey: llmOrchestrationKeys.responseLists() })
      queryClient.setQueryData(llmOrchestrationKeys.responseDetail(newResponse.id), newResponse)
      // Invalidate related prompt queries
      queryClient.invalidateQueries({ queryKey: llmOrchestrationKeys.promptDetail(newResponse.prompt_id) })
      toast.success("Response created successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to create response: ${error.message}`)
    },
  })
}

export const useUpdateResponse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateResponseInput }) =>
      llmOrchestrationApi.updateResponse(id, updates),
    onSuccess: (updatedResponse) => {
      queryClient.setQueryData(llmOrchestrationKeys.responseDetail(updatedResponse.id), updatedResponse)
      queryClient.invalidateQueries({ queryKey: llmOrchestrationKeys.responseLists() })
      toast.success("Response updated successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to update response: ${error.message}`)
    },
  })
}

export const useDeleteResponse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: llmOrchestrationApi.deleteResponse,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: llmOrchestrationKeys.responseDetail(deletedId) })
      queryClient.invalidateQueries({ queryKey: llmOrchestrationKeys.responseLists() })
      toast.success("Response deleted successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete response: ${error.message}`)
    },
  })
}

// =====================================================
// USAGE LOGS
// =====================================================

export const useUsageLogs = (filters?: UsageLogFilters) => {
  return useQuery({
    queryKey: llmOrchestrationKeys.usageLogList(filters),
    queryFn: () => llmOrchestrationApi.getAllUsageLogs(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes for usage data
  })
}

export const useUsageLog = (id: string) => {
  return useQuery({
    queryKey: llmOrchestrationKeys.usageLogDetail(id),
    queryFn: () => llmOrchestrationApi.getUsageLogById(id),
    enabled: !!id,
  })
}

export const useCreateUsageLog = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: llmOrchestrationApi.createUsageLog,
    onSuccess: (newLog) => {
      queryClient.invalidateQueries({ queryKey: llmOrchestrationKeys.usageLogLists() })
      queryClient.invalidateQueries({ queryKey: llmOrchestrationKeys.usageSummary(newLog.agent_id || undefined) })
      queryClient.setQueryData(llmOrchestrationKeys.usageLogDetail(newLog.id), newLog)
    },
    onError: (error: Error) => {
      toast.error(`Failed to create usage log: ${error.message}`)
    },
  })
}

export const useUsageSummary = (agentId?: string) => {
  return useQuery({
    queryKey: llmOrchestrationKeys.usageSummary(agentId),
    queryFn: () => llmOrchestrationApi.getUsageSummary(agentId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}
