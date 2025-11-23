import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { publicChatApi } from "@/api/public-chat"
import { toast } from "sonner"
import type {
  CreateSessionRequest,
  SendMessageRequest,
  SessionWithData,
} from "@/types/session"
import type { VisitorInsert } from "@/types/visitor"

// Query keys
export const publicChatKeys = {
  all: ["public-chat"] as const,
  agent: (slug: string) => [...publicChatKeys.all, "agent", slug] as const,
  session: (id: string) => [...publicChatKeys.all, "session", id] as const,
  messages: (sessionId: string) =>
    [...publicChatKeys.all, "messages", sessionId] as const,
}

/**
 * Get agent by public slug
 */
export function useAgentBySlug(slug: string, enabled = true) {
  return useQuery({
    queryKey: publicChatKeys.agent(slug),
    queryFn: () => publicChatApi.getAgentBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Create or get visitor
 */
export function useCreateVisitor() {
  return useMutation({
    mutationFn: (data: VisitorInsert) => publicChatApi.createVisitor(data),
    onError: (error) => {
      toast.error("Failed to initialize visitor session")
      console.error("Create visitor error:", error)
    },
  })
}

/**
 * Create a new chat session
 */
export function useCreateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSessionRequest) =>
      publicChatApi.createSession(data),
    onSuccess: (response) => {
      // Cache the session
      queryClient.setQueryData(
        publicChatKeys.session(response.session.id),
        response
      )
      toast.success("Session started!")
    },
    onError: (error) => {
      toast.error("Failed to start session")
      console.error("Create session error:", error)
    },
  })
}

/**
 * Get session with messages and field values
 * Note: Real-time updates are handled by useRealtimeChat hook
 */
export function useSession(sessionId: string, enabled = true) {
  return useQuery({
    queryKey: publicChatKeys.session(sessionId),
    queryFn: () => publicChatApi.getSession(sessionId),
    enabled: enabled && !!sessionId,
    staleTime: 1000 * 30, // 30 seconds - real-time updates handle freshness
    refetchOnWindowFocus: false, // Real-time handles updates
  })
}

/**
 * Send a message
 */
export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SendMessageRequest) =>
      publicChatApi.sendMessage(data),
    onMutate: async (newMessage) => {
      // Optimistic update
      const queryKey = publicChatKeys.session(newMessage.session_id)
      await queryClient.cancelQueries({ queryKey })

      const previousSession = queryClient.getQueryData<SessionWithData>(queryKey)

      if (previousSession) {
        queryClient.setQueryData<SessionWithData>(queryKey, {
          ...previousSession,
          messages: [
            ...previousSession.messages,
            {
              id: `temp-${Date.now()}`,
              session_id: newMessage.session_id,
              role: "visitor",
              content: newMessage.content,
              created_at: new Date().toISOString(),
            },
          ],
        })
      }

      return { previousSession }
    },
    onError: (error, newMessage, context) => {
      // Rollback on error
      if (context?.previousSession) {
        const queryKey = publicChatKeys.session(newMessage.session_id)
        queryClient.setQueryData(queryKey, context.previousSession)
      }
      toast.error("Failed to send message")
      console.error("Send message error:", error)
    },
    onSuccess: (_response, variables) => {
      // Update with real response
      const queryKey = publicChatKeys.session(variables.session_id)
      queryClient.invalidateQueries({ queryKey })
    },
  })
}

/**
 * Complete a session
 */
export function useCompleteSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) => publicChatApi.completeSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({
        queryKey: publicChatKeys.session(sessionId),
      })
      toast.success("Session completed!")
    },
    onError: (error) => {
      toast.error("Failed to complete session")
      console.error("Complete session error:", error)
    },
  })
}

/**
 * Abandon a session
 */
export function useAbandonSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) => publicChatApi.abandonSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({
        queryKey: publicChatKeys.session(sessionId),
      })
    },
    onError: (error) => {
      toast.error("Failed to abandon session")
      console.error("Abandon session error:", error)
    },
  })
}
