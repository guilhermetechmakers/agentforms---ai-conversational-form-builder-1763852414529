import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { publicChatKeys } from "./usePublicChat"
import type { Message, SessionWithData } from "@/types/session"

/**
 * Hook for real-time message updates using Supabase subscriptions
 * @param sessionId - The session ID to subscribe to
 * @param enabled - Whether the subscription is enabled
 * @param onNewMessage - Optional callback when a new message arrives
 * @param onSessionUpdate - Optional callback when session status changes
 */
export function useRealtimeChat(
  sessionId: string | null,
  enabled = true,
  onNewMessage?: (message: Message) => void,
  onSessionUpdate?: (status: string) => void
) {
  const queryClient = useQueryClient()
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (!sessionId || !enabled) {
      return
    }

    // Create a channel for this session
    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          // Update the session data with the new message
          const queryKey = publicChatKeys.session(sessionId)
          const currentData = queryClient.getQueryData<SessionWithData>(queryKey)

          if (currentData) {
            const newMessage = payload.new as Message
            // Check if message already exists to avoid duplicates
            const messageExists = currentData.messages.some(
              (m) => m.id === newMessage.id
            )

            if (!messageExists) {
              queryClient.setQueryData<SessionWithData>(queryKey, {
                ...currentData,
                messages: [...currentData.messages, newMessage],
              })
              
              // Call callback if provided
              if (onNewMessage) {
                onNewMessage(newMessage)
              }
            }
          } else {
            // If no data, invalidate to refetch
            queryClient.invalidateQueries({ queryKey })
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          // Update session status if it changes
          const queryKey = publicChatKeys.session(sessionId)
          const currentData = queryClient.getQueryData<SessionWithData>(queryKey)

          if (currentData) {
            const newStatus = payload.new.status as SessionWithData["status"]
            queryClient.setQueryData<SessionWithData>(queryKey, {
              ...currentData,
              status: newStatus,
              completed_at: payload.new.completed_at as string | null,
            })
            
            // Call callback if provided
            if (onSessionUpdate) {
              onSessionUpdate(newStatus)
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "field_values",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          // Invalidate to refetch field values
          const queryKey = publicChatKeys.session(sessionId)
          queryClient.invalidateQueries({ queryKey })
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "field_values",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          // Invalidate to refetch field values
          const queryKey = publicChatKeys.session(sessionId)
          queryClient.invalidateQueries({ queryKey })
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`Subscribed to real-time updates for session ${sessionId}`)
        } else if (status === "CHANNEL_ERROR") {
          console.error("Error subscribing to real-time updates")
        }
      })

    subscriptionRef.current = channel

    // Cleanup on unmount
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
        subscriptionRef.current = null
      }
    }
  }, [sessionId, enabled, queryClient, onNewMessage, onSessionUpdate])
}
