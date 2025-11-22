import { api } from "@/lib/api"
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  SendMessageRequest,
  SendMessageResponse,
  SessionWithData,
  Message,
} from "@/types/session"
import type { Agent } from "@/types/agent"
import type { Visitor, VisitorInsert } from "@/types/visitor"

export const publicChatApi = {
  /**
   * Get agent by public slug or ID (public endpoint)
   */
  getAgentBySlug: async (slug: string): Promise<Agent> => {
    return api.get<Agent>(`/public/agents/${slug}`)
  },

  /**
   * Create or get visitor (anonymous)
   */
  createVisitor: async (data: VisitorInsert): Promise<Visitor> => {
    return api.post<Visitor>("/public/visitors", data)
  },

  /**
   * Create a new chat session
   */
  createSession: async (data: CreateSessionRequest): Promise<CreateSessionResponse> => {
    return api.post<CreateSessionResponse>("/public/sessions", data)
  },

  /**
   * Get session with messages and field values
   */
  getSession: async (sessionId: string): Promise<SessionWithData> => {
    return api.get<SessionWithData>(`/public/sessions/${sessionId}`)
  },

  /**
   * Send a message in a session
   */
  sendMessage: async (data: SendMessageRequest): Promise<SendMessageResponse> => {
    return api.post<SendMessageResponse>("/public/messages", data)
  },

  /**
   * Get messages for a session (with pagination)
   */
  getMessages: async (
    sessionId: string,
    limit = 50,
    offset = 0
  ): Promise<Message[]> => {
    return api.get<Message[]>(
      `/public/sessions/${sessionId}/messages?limit=${limit}&offset=${offset}`
    )
  },

  /**
   * Complete a session
   */
  completeSession: async (sessionId: string): Promise<void> => {
    return api.post(`/public/sessions/${sessionId}/complete`, {})
  },

  /**
   * Abandon a session
   */
  abandonSession: async (sessionId: string): Promise<void> => {
    return api.post(`/public/sessions/${sessionId}/abandon`, {})
  },
}
