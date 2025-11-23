import { supabase } from "@/lib/supabase"
import type { Session, SessionWithData, FieldValue, Message } from "@/types/session"

export interface SessionFilters {
  agent_id?: string
  status?: 'in-progress' | 'completed' | 'abandoned' | 'all'
  search?: string
  date_from?: string
  date_to?: string
  page?: number
  pageSize?: number
}

export interface SessionListResponse {
  sessions: Session[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export const sessionsApi = {
  getAll: async (filters?: SessionFilters): Promise<SessionListResponse> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Build query - sessions are accessible via agent ownership
    let query = supabase
      .from("sessions")
      .select(`
        *,
        agents!inner(id, name, user_id)
      `, { count: "exact" })
      .eq("agents.user_id", user.id)
      .order("started_at", { ascending: false })

    // Apply agent filter
    if (filters?.agent_id) {
      query = query.eq("agent_id", filters.agent_id)
    }

    // Apply status filter
    if (filters?.status && filters.status !== 'all') {
      query = query.eq("status", filters.status)
    }

    // Apply date range filters
    if (filters?.date_from) {
      query = query.gte("started_at", filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte("started_at", filters.date_to)
    }

    // Pagination
    const page = filters?.page || 1
    const pageSize = filters?.pageSize || 20
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    // Transform data to remove nested agents structure
    const sessions: Session[] = (data || []).map((item: any) => ({
      id: item.id,
      agent_id: item.agent_id,
      visitor_id: item.visitor_id,
      status: item.status,
      visitor_metadata: item.visitor_metadata || {},
      started_at: item.started_at,
      completed_at: item.completed_at,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }))

    // Apply search filter if provided (search in visitor metadata or field values)
    let filteredSessions = sessions
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      // For now, we'll filter client-side. In production, you'd want to add full-text search
      // This is a simplified version - you might want to search in field_values table
      filteredSessions = sessions.filter(session => {
        const metadata = session.visitor_metadata || {}
        return (
          session.id.toLowerCase().includes(searchLower) ||
          (metadata.ip_address && metadata.ip_address.toLowerCase().includes(searchLower))
        )
      })
    }

    return {
      sessions: filteredSessions,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    }
  },

  getById: async (id: string): Promise<SessionWithData> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Get session with agent info
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .select(`
        *,
        agents!inner(id, name, user_id, schema, persona, visuals)
      `)
      .eq("id", id)
      .eq("agents.user_id", user.id)
      .single()

    if (sessionError) throw sessionError

    // Get messages
    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: true })

    if (messagesError) throw messagesError

    // Get field values
    const { data: fieldValuesData, error: fieldValuesError } = await supabase
      .from("field_values")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: true })

    if (fieldValuesError) throw fieldValuesError

    const agent = sessionData.agents as any

    return {
      id: sessionData.id,
      agent_id: sessionData.agent_id,
      visitor_id: sessionData.visitor_id,
      status: sessionData.status,
      visitor_metadata: sessionData.visitor_metadata || {},
      started_at: sessionData.started_at,
      completed_at: sessionData.completed_at,
      created_at: sessionData.created_at,
      updated_at: sessionData.updated_at,
      messages: (messagesData || []) as Message[],
      field_values: (fieldValuesData || []) as FieldValue[],
      agent: {
        id: agent.id,
        name: agent.name,
        visuals: agent.visuals,
        persona: agent.persona,
      },
    }
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", id)

    if (error) throw error
  },

  deleteMany: async (ids: string[]): Promise<void> => {
    const { error } = await supabase
      .from("sessions")
      .delete()
      .in("id", ids)

    if (error) throw error
  },

  export: async (ids: string[], format: "csv" | "json"): Promise<Blob> => {
    // Fetch sessions with all related data
    const sessions = await Promise.all(
      ids.map(id => sessionsApi.getById(id))
    )

    if (format === "csv") {
      // Generate CSV
      const headers = ["Session ID", "Agent", "Status", "Started At", "Completed At", "Fields Collected"]
      const rows = sessions.map(session => [
        session.id,
        session.agent?.name || "Unknown",
        session.status,
        session.started_at,
        session.completed_at || "",
        session.field_values.length.toString(),
      ])

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      ].join("\n")

      return new Blob([csvContent], { type: "text/csv" })
    } else {
      // Generate JSON
      const jsonContent = JSON.stringify(sessions, null, 2)
      return new Blob([jsonContent], { type: "application/json" })
    }
  },
}
