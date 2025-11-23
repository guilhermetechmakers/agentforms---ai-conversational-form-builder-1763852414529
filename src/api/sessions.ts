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
  include_deleted?: boolean
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

    // Use the search function if search text is provided, otherwise use standard query
    if (filters?.search && filters.search.trim().length > 0) {
      // Use the database search function for better performance
      const { data: searchResults, error: searchError } = await supabase.rpc('search_sessions', {
        search_text: filters.search.trim(),
        agent_uuid: filters.agent_id || null,
        status_filter: filters.status && filters.status !== 'all' ? filters.status : null,
        date_from: filters.date_from || null,
        date_to: filters.date_to || null,
        include_deleted: filters.include_deleted || false,
      })

      if (searchError) throw searchError

      // Pagination for search results
      const page = filters?.page || 1
      const pageSize = filters?.pageSize || 20
      const from = (page - 1) * pageSize
      const to = from + pageSize

      const paginatedResults = (searchResults || []).slice(from, to)
      const total = (searchResults || []).length

      // Transform to Session format
      const sessions: Session[] = paginatedResults.map((item: any) => ({
        id: item.id,
        agent_id: item.agent_id,
        visitor_id: item.visitor_id,
        status: item.status,
        visitor_metadata: item.visitor_metadata || {},
        started_at: item.started_at,
        completed_at: item.completed_at,
        created_at: item.created_at,
        updated_at: item.updated_at,
        deleted_at: item.deleted_at,
        deleted_by: item.deleted_by,
      }))

      return {
        sessions,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    }

    // Standard query for non-search cases
    let query = supabase
      .from("sessions")
      .select(`
        *,
        agents!inner(id, name, user_id)
      `, { count: "exact" })
      .eq("agents.user_id", user.id)
      .order("started_at", { ascending: false })

    // Exclude deleted sessions by default
    if (!filters?.include_deleted) {
      query = query.is("deleted_at", null)
    }

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
      deleted_at: item.deleted_at,
      deleted_by: item.deleted_by,
    }))

    const filteredSessions = sessions

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
      deleted_at: sessionData.deleted_at,
      deleted_by: sessionData.deleted_by,
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

  // Soft delete a session
  delete: async (id: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase.rpc('soft_delete_session', {
      session_uuid: id
    })

    if (error) throw error
  },

  // Soft delete multiple sessions
  deleteMany: async (ids: string[]): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Use Promise.all to soft-delete all sessions
    const results = await Promise.all(
      ids.map(id => supabase.rpc('soft_delete_session', { session_uuid: id }))
    )

    const errors = results.filter(r => r.error).map(r => r.error)
    if (errors.length > 0) {
      throw new Error(`Failed to delete ${errors.length} session(s)`)
    }
  },

  // Restore a soft-deleted session
  restore: async (id: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase.rpc('restore_session', {
      session_uuid: id
    })

    if (error) throw error
  },

  // Permanently delete a session (hard delete - use with caution)
  permanentDelete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", id)

    if (error) throw error
  },

  export: async (ids: string[], format: "csv" | "json"): Promise<Blob> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Fetch sessions with all related data
    const sessions = await Promise.all(
      ids.map(id => sessionsApi.getById(id))
    )

    // Log audit trail for each exported session
    await Promise.all(
      ids.map(sessionId =>
        supabase.from("session_audit_trail").insert({
          session_id: sessionId,
          user_id: user.id,
          action: "exported",
          action_details: { format, exported_at: new Date().toISOString() },
          description: `Exported session as ${format.toUpperCase()}`,
        })
      )
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

  updateFieldValue: async (
    sessionId: string,
    fieldId: string,
    value: string | number | string[] | Record<string, unknown>
  ): Promise<FieldValue> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("field_values")
      .update({
        value,
        updated_at: new Date().toISOString(),
      })
      .eq("id", fieldId)
      .eq("session_id", sessionId)
      .select()
      .single()

    if (error) throw error

    // Log audit trail
    await supabase.from("session_audit_trail").insert({
      session_id: sessionId,
      user_id: user.id,
      action: "field_updated",
      action_details: { field_id: fieldId, field_value: value },
      description: `Updated field value`,
    })

    return data as FieldValue
  },

  redactPII: async (sessionId: string, fieldIds?: string[]): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Redact field values (replace with [REDACTED])
    if (fieldIds && fieldIds.length > 0) {
      const { error } = await supabase
        .from("field_values")
        .update({
          value: "[REDACTED]",
          updated_at: new Date().toISOString(),
        })
        .eq("session_id", sessionId)
        .in("id", fieldIds)

      if (error) throw error
    } else {
      // Redact all field values
      const { error } = await supabase
        .from("field_values")
        .update({
          value: "[REDACTED]",
          updated_at: new Date().toISOString(),
        })
        .eq("session_id", sessionId)

      if (error) throw error
    }

    // Log audit trail
    await supabase.from("session_audit_trail").insert({
      session_id: sessionId,
      user_id: user.id,
      action: "redacted_pii",
      action_details: { field_ids: fieldIds || "all" },
      description: `Redacted PII from ${fieldIds?.length || "all"} field(s)`,
    })
  },

  resendWebhook: async (sessionId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // In a real implementation, this would trigger a webhook delivery
    // For now, we'll just log the action
    const { error } = await supabase.from("session_audit_trail").insert({
      session_id: sessionId,
      user_id: user.id,
      action: "webhook_resent",
      action_details: {},
      description: "Webhook resent for session",
    })

    if (error) throw error
  },

  markReviewed: async (sessionId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Log audit trail
    const { error } = await supabase.from("session_audit_trail").insert({
      session_id: sessionId,
      user_id: user.id,
      action: "marked_reviewed",
      action_details: {},
      description: "Session marked as reviewed",
    })

    if (error) throw error
  },

  getAuditTrail: async (sessionId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("session_audit_trail")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  },
}
