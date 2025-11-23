import { supabase } from "@/lib/supabase"
import type { Agent, CreateAgentInput, UpdateAgentInput } from "@/types/agent"
import type { AgentWithStats } from "@/types/usage"

export interface AgentFilters {
  status?: 'draft' | 'published' | 'all'
  search?: string
  team_id?: string
  page?: number
  pageSize?: number
}

export interface AgentListResponse {
  agents: AgentWithStats[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export const agentsApi = {
  getAll: async (filters?: AgentFilters): Promise<AgentListResponse> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    let query = supabase
      .from("agents")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
      query = query.eq("status", filters.status)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Pagination
    const page = filters?.page || 1
    const pageSize = filters?.pageSize || 20
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    query = query.range(from, to)

    const { data: agents, error, count } = await query

    if (error) throw error

    // Get usage stats for each agent
    // Note: We'll calculate stats manually if the view isn't accessible
    const agentIds = agents?.map(a => a.id) || []
    let stats: any[] = []
    
    if (agentIds.length > 0) {
      // Try to get stats from view, fallback to manual calculation
      const statsQuery = supabase
        .from("agent_usage_stats")
        .select("*")
        .in("agent_id", agentIds)
      
      const { data: statsData, error: statsError } = await statsQuery
      
      if (!statsError && statsData) {
        stats = statsData
      } else {
        // Fallback: calculate stats manually from sessions
        const { data: sessionsData } = await supabase
          .from("sessions")
          .select("agent_id, status, started_at")
          .in("agent_id", agentIds)
        
        // Group and calculate stats
        const statsMap = new Map<string, any>()
        agentIds.forEach(id => {
          statsMap.set(id, {
            agent_id: id,
            completed_sessions: 0,
            in_progress_sessions: 0,
            total_sessions: 0,
            conversion_rate: 0,
            last_activity_at: null,
            monthly_sessions: 0,
          })
        })
        
        if (sessionsData) {
          const now = new Date()
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          
          sessionsData.forEach(session => {
            const stat = statsMap.get(session.agent_id)
            if (stat) {
              stat.total_sessions++
              if (session.status === 'completed') stat.completed_sessions++
              if (session.status === 'in-progress') stat.in_progress_sessions++
              
              const sessionDate = new Date(session.started_at)
              if (sessionDate >= monthStart) {
                stat.monthly_sessions++
              }
              
              if (!stat.last_activity_at || sessionDate > new Date(stat.last_activity_at)) {
                stat.last_activity_at = session.started_at
              }
            }
          })
          
          // Calculate conversion rates
          statsMap.forEach(stat => {
            if (stat.total_sessions > 0) {
              stat.conversion_rate = Math.round(
                (stat.completed_sessions / stat.total_sessions) * 100 * 10
              ) / 10
            }
          })
          
          stats = Array.from(statsMap.values())
        }
      }
    }

    // Merge agents with stats
    const agentsWithStats: AgentWithStats[] = (agents || []).map(agent => {
      const stat = stats?.find(s => s.agent_id === agent.id)
      return {
        ...agent,
        completed_sessions: stat?.completed_sessions || 0,
        in_progress_sessions: stat?.in_progress_sessions || 0,
        total_sessions: stat?.total_sessions || 0,
        conversion_rate: stat?.conversion_rate || 0,
        last_activity_at: stat?.last_activity_at || null,
        monthly_sessions: stat?.monthly_sessions || 0,
      }
    })

    return {
      agents: agentsWithStats,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    }
  },

  getById: async (id: string): Promise<AgentWithStats> => {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error

    // Get usage stats
    const { data: stats } = await supabase
      .from("agent_usage_stats")
      .select("*")
      .eq("agent_id", id)
      .single()

    return {
      ...data,
      completed_sessions: stats?.completed_sessions || 0,
      in_progress_sessions: stats?.in_progress_sessions || 0,
      total_sessions: stats?.total_sessions || 0,
      conversion_rate: stats?.conversion_rate || 0,
      last_activity_at: stats?.last_activity_at || null,
      monthly_sessions: stats?.monthly_sessions || 0,
    }
  },

  create: async (agent: CreateAgentInput): Promise<Agent> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("agents")
      .insert({
        ...agent,
        user_id: user.id,
        schema: agent.schema || { fields: [] },
        persona: agent.persona || {},
        knowledge: agent.knowledge || {},
        visuals: agent.visuals || {},
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  update: async (id: string, updates: UpdateAgentInput): Promise<Agent> => {
    const { data, error } = await supabase
      .from("agents")
      .update({
        ...updates,
        ...(updates.schema && { schema: updates.schema }),
        ...(updates.persona && { persona: updates.persona }),
        ...(updates.knowledge && { knowledge: updates.knowledge }),
        ...(updates.visuals && { visuals: updates.visuals }),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("agents")
      .delete()
      .eq("id", id)

    if (error) throw error
  },

  duplicate: async (id: string): Promise<Agent> => {
    const agent = await agentsApi.getById(id)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("agents")
      .insert({
        name: `${agent.name} (Copy)`,
        description: agent.description,
        user_id: user.id,
        schema: agent.schema,
        persona: agent.persona,
        knowledge: agent.knowledge,
        visuals: agent.visuals,
        status: 'draft',
        version: 1,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  publish: async (id: string): Promise<Agent> => {
    const agent = await agentsApi.getById(id)
    
    // Generate public slug and URL
    const slug = agent.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const publicUrl = `${window.location.origin}/a/${slug}`
    
    const { data, error } = await supabase
      .from("agents")
      .update({
        status: 'published',
        public_slug: slug,
        public_url: publicUrl,
        version: agent.version + 1,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  getUsageSummary: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase.rpc('get_user_usage_summary', {
      p_user_id: user.id
    })

    if (error) throw error
    return data?.[0] || null
  },
}
