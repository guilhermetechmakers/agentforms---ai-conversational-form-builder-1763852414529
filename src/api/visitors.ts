import { supabase } from "@/lib/supabase"
import type { Visitor, VisitorInsert, VisitorUpdate, Engagement, EngagementInsert } from "@/types/visitors"

export const visitorsApi = {
  // Create or get visitor session
  createVisitor: async (data: VisitorInsert): Promise<Visitor> => {
    const { data: visitor, error } = await supabase
      .from('visitors')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return visitor
  },

  // Get visitor by session ID
  getVisitorBySessionId: async (sessionId: string): Promise<Visitor | null> => {
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  },

  // Update visitor interaction history
  updateVisitor: async (id: string, updates: VisitorUpdate): Promise<Visitor> => {
    const { data, error } = await supabase
      .from('visitors')
      .update({
        ...updates,
        last_interaction: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Track engagement event
  createEngagement: async (data: EngagementInsert): Promise<Engagement> => {
    const { data: engagement, error } = await supabase
      .from('engagements')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return engagement
  },

  // Get visitor engagements
  getVisitorEngagements: async (visitorId: string): Promise<Engagement[]> => {
    const { data, error } = await supabase
      .from('engagements')
      .select('*')
      .eq('visitor_id', visitorId)
      .order('engagement_time', { ascending: false })

    if (error) throw error
    return data || []
  },
}
