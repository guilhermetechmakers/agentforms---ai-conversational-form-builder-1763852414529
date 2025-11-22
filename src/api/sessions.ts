import { api } from "@/lib/api"
import type { Session, SessionWithData } from "@/types/session"

export const sessionsApi = {
  getAll: async (agentId?: string): Promise<Session[]> => {
    const endpoint = agentId ? `/sessions?agent_id=${agentId}` : "/sessions"
    return api.get<Session[]>(endpoint)
  },

  getById: async (id: string): Promise<SessionWithData> => {
    return api.get<SessionWithData>(`/sessions/${id}`)
  },

  export: async (ids: string[], format: "csv" | "json"): Promise<Blob> => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/sessions/export`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ ids, format }),
      }
    )
    return response.blob()
  },
}
