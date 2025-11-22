import { api } from "@/lib/api"
import type { Agent, CreateAgentInput, UpdateAgentInput } from "@/types/agent"

export const agentsApi = {
  getAll: async (): Promise<Agent[]> => {
    return api.get<Agent[]>("/agents")
  },

  getById: async (id: string): Promise<Agent> => {
    return api.get<Agent>(`/agents/${id}`)
  },

  create: async (agent: CreateAgentInput): Promise<Agent> => {
    return api.post<Agent>("/agents", agent)
  },

  update: async (id: string, updates: UpdateAgentInput): Promise<Agent> => {
    return api.put<Agent>(`/agents/${id}`, updates)
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/agents/${id}`)
  },

  publish: async (id: string): Promise<Agent> => {
    return api.post<Agent>(`/agents/${id}/publish`, {})
  },
}
