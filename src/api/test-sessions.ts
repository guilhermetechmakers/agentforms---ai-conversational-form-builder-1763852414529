import { supabase } from "@/lib/supabase"
import type { TestSession, TestSessionInsert, TestSessionUpdate, ConversationMessage } from "@/types/test-session"

export interface TestSessionFilters {
  agent_id?: string
  page?: number
  pageSize?: number
}

export interface TestSessionListResponse {
  test_sessions: TestSession[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export const testSessionsApi = {
  getAll: async (filters?: TestSessionFilters): Promise<TestSessionListResponse> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    let query = supabase
      .from("test_sessions")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    // Apply filters
    if (filters?.agent_id) {
      query = query.eq("agent_id", filters.agent_id)
    }

    // Pagination
    const page = filters?.page || 1
    const pageSize = filters?.pageSize || 20
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    query = query.range(from, to)

    const { data: testSessions, error, count } = await query

    if (error) throw error

    return {
      test_sessions: (testSessions || []) as TestSession[],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    }
  },

  getById: async (id: string): Promise<TestSession> => {
    const { data, error } = await supabase
      .from("test_sessions")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as TestSession
  },

  create: async (testSession: TestSessionInsert): Promise<TestSession> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("test_sessions")
      .insert({
        ...testSession,
        user_id: user.id,
        conversation_log: testSession.conversation_log || [],
        collected_fields: testSession.collected_fields || {},
        missing_fields: testSession.missing_fields || [],
        errors: testSession.errors || [],
        suggestions: testSession.suggestions || [],
      })
      .select()
      .single()

    if (error) throw error
    return data as TestSession
  },

  update: async (id: string, updates: TestSessionUpdate): Promise<TestSession> => {
    const { data, error } = await supabase
      .from("test_sessions")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as TestSession
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("test_sessions")
      .delete()
      .eq("id", id)

    if (error) throw error
  },

  // Simulate conversation - this would typically call a backend service
  // For now, we'll return a mock response structure
  simulateMessage: async (
    _agentId: string,
    message: string,
    _conversationHistory: ConversationMessage[],
    _llmMode: 'deterministic' | 'generative',
    _temperature: number
  ): Promise<{ response: string; fieldKey?: string; collectedValue?: any }> => {
    // This is a placeholder - in production, this would call your LLM orchestration service
    // For now, return a mock response with a small delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock response - in production, this would analyze the message and agent schema
    // to determine if a field was collected and what the next question should be
    return {
      response: `[Mock LLM Response] This is a simulated response to: "${message}". In production, this would call your LLM orchestration service to generate contextually appropriate responses based on the agent's persona, schema, and conversation history.`,
    }
  },
}
