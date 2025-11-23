import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRef } from "react"
import { visitorsApi } from "@/api/visitors"
import type { EngagementInsert, InteractionEvent } from "@/types/visitors"

// Generate or retrieve session ID
function getOrCreateSessionId(): string {
  const key = 'agentforms_visitor_session'
  let sessionId = sessionStorage.getItem(key)
  
  if (!sessionId) {
    sessionId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem(key, sessionId)
  }
  
  return sessionId
}

// Get visitor metadata
function getVisitorMetadata() {
  return {
    referrer: document.referrer || null,
    user_agent: navigator.userAgent || null,
    // IP address would be captured server-side
  }
}

export function useVisitorTracking() {
  const queryClient = useQueryClient()
  const sessionIdRef = useRef<string>(getOrCreateSessionId())
  const visitorIdRef = useRef<string | null>(null)

  // Create or get visitor
  const { data: visitor } = useQuery({
    queryKey: ['visitor', sessionIdRef.current],
    queryFn: async () => {
      // Try to get existing visitor
      let visitor = await visitorsApi.getVisitorBySessionId(sessionIdRef.current)
      
      if (!visitor) {
        // Create new visitor
        const metadata = getVisitorMetadata()
        visitor = await visitorsApi.createVisitor({
          session_id: sessionIdRef.current,
          ...metadata,
          interaction_history: [],
        })
      }
      
      visitorIdRef.current = visitor.id
      return visitor
    },
    staleTime: Infinity, // Never refetch
    gcTime: Infinity, // Keep in cache forever
  })

  // Track engagement mutation
  const trackEngagement = useMutation({
    mutationFn: async (engagement: Omit<EngagementInsert, 'visitor_id'>) => {
      if (!visitorIdRef.current) {
        throw new Error('Visitor not initialized')
      }
      
      return visitorsApi.createEngagement({
        ...engagement,
        visitor_id: visitorIdRef.current,
      })
    },
    onSuccess: () => {
      // Update visitor's last interaction
      if (visitorIdRef.current) {
        queryClient.invalidateQueries({ queryKey: ['visitor', sessionIdRef.current] })
      }
    },
  })

  // Track interaction event
  const trackInteraction = useMutation({
    mutationFn: async (event: InteractionEvent) => {
      if (!visitorIdRef.current || !visitor) return

      const updatedHistory = [...(visitor.interaction_history || []), event]
      
      return visitorsApi.updateVisitor(visitorIdRef.current, {
        interaction_history: updatedHistory,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitor', sessionIdRef.current] })
    },
  })

  return {
    visitor,
    trackEngagement: (engagement: Omit<EngagementInsert, 'visitor_id'>) => {
      trackEngagement.mutate(engagement)
    },
    trackInteraction: (event: InteractionEvent) => {
      trackInteraction.mutate(event)
    },
    sessionId: sessionIdRef.current,
  }
}
