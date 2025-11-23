import { supabase } from "@/lib/supabase"
import type {
  Prompt,
  CreatePromptInput,
  UpdatePromptInput,
  Response,
  CreateResponseInput,
  UpdateResponseInput,
  UsageLog,
  CreateUsageLogInput,
  UsageSummary,
  LLMProvider,
} from "@/types/llm-orchestration"

export interface PromptFilters {
  agent_id?: string
  page?: number
  pageSize?: number
}

export interface PromptListResponse {
  prompts: Prompt[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ResponseFilters {
  prompt_id?: string
  agent_id?: string
  llm_provider?: LLMProvider
  cached_only?: boolean
  page?: number
  pageSize?: number
}

export interface ResponseListResponse {
  responses: Response[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface UsageLogFilters {
  agent_id?: string
  llm_provider?: LLMProvider
  start_date?: string
  end_date?: string
  page?: number
  pageSize?: number
}

export interface UsageLogListResponse {
  logs: UsageLog[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export const llmOrchestrationApi = {
  // =====================================================
  // PROMPTS
  // =====================================================

  getAllPrompts: async (filters?: PromptFilters): Promise<PromptListResponse> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    let query = supabase
      .from("prompts")
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

    const { data: prompts, error, count } = await query

    if (error) throw error

    return {
      prompts: prompts || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    }
  },

  getPromptById: async (id: string): Promise<Prompt> => {
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  },

  createPrompt: async (prompt: CreatePromptInput): Promise<Prompt> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("prompts")
      .insert({
        ...prompt,
        user_id: user.id,
        persona_data: prompt.persona_data || {},
        knowledge_data: prompt.knowledge_data || {},
        schema_data: prompt.schema_data || { fields: [] },
        conversation_history: prompt.conversation_history || [],
        remaining_fields: prompt.remaining_fields || [],
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  updatePrompt: async (id: string, updates: UpdatePromptInput): Promise<Prompt> => {
    const { data, error } = await supabase
      .from("prompts")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  deletePrompt: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("prompts")
      .delete()
      .eq("id", id)

    if (error) throw error
  },

  // =====================================================
  // RESPONSES
  // =====================================================

  getAllResponses: async (filters?: ResponseFilters): Promise<ResponseListResponse> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    let query = supabase
      .from("responses")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    // Apply filters
    if (filters?.prompt_id) {
      query = query.eq("prompt_id", filters.prompt_id)
    }

    if (filters?.agent_id) {
      query = query.eq("agent_id", filters.agent_id)
    }

    if (filters?.llm_provider) {
      query = query.eq("llm_provider", filters.llm_provider)
    }

    if (filters?.cached_only) {
      query = query.eq("cached_flag", true)
    }

    // Pagination
    const page = filters?.page || 1
    const pageSize = filters?.pageSize || 20
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    query = query.range(from, to)

    const { data: responses, error, count } = await query

    if (error) throw error

    return {
      responses: responses || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    }
  },

  getResponseById: async (id: string): Promise<Response> => {
    const { data, error } = await supabase
      .from("responses")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  },

  createResponse: async (response: CreateResponseInput): Promise<Response> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("responses")
      .insert({
        ...response,
        user_id: user.id,
        response_data: response.response_data || {},
        cached_flag: response.cached_flag || false,
        deterministic_mode: response.deterministic_mode || false,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  updateResponse: async (id: string, updates: UpdateResponseInput): Promise<Response> => {
    const { data, error } = await supabase
      .from("responses")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  deleteResponse: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("responses")
      .delete()
      .eq("id", id)

    if (error) throw error
  },

  // =====================================================
  // USAGE LOGS
  // =====================================================

  getAllUsageLogs: async (filters?: UsageLogFilters): Promise<UsageLogListResponse> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    let query = supabase
      .from("usage_logs")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    // Apply filters
    if (filters?.agent_id) {
      query = query.eq("agent_id", filters.agent_id)
    }

    if (filters?.llm_provider) {
      query = query.eq("llm_provider", filters.llm_provider)
    }

    if (filters?.start_date) {
      query = query.gte("created_at", filters.start_date)
    }

    if (filters?.end_date) {
      query = query.lte("created_at", filters.end_date)
    }

    // Pagination
    const page = filters?.page || 1
    const pageSize = filters?.pageSize || 20
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    query = query.range(from, to)

    const { data: logs, error, count } = await query

    if (error) throw error

    return {
      logs: logs || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    }
  },

  getUsageLogById: async (id: string): Promise<UsageLog> => {
    const { data, error } = await supabase
      .from("usage_logs")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  },

  createUsageLog: async (log: CreateUsageLogInput): Promise<UsageLog> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("usage_logs")
      .insert({
        ...log,
        user_id: user.id,
        cost: log.cost || 0,
        cost_currency: log.cost_currency || 'USD',
        cache_hit: log.cache_hit || false,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  getUsageSummary: async (agentId?: string): Promise<UsageSummary> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    let query = supabase
      .from("usage_logs")
      .select("*")
      .eq("user_id", user.id)

    if (agentId) {
      query = query.eq("agent_id", agentId)
    }

    const { data: logs, error } = await query

    if (error) throw error

    // Calculate summary
    const summary: UsageSummary = {
      total_tokens: 0,
      total_cost: 0,
      total_requests: logs?.length || 0,
      cache_hit_rate: 0,
      avg_response_time_ms: 0,
      by_provider: {
        openai: { tokens: 0, cost: 0, requests: 0 },
        anthropic: { tokens: 0, cost: 0, requests: 0 },
        google: { tokens: 0, cost: 0, requests: 0 },
        custom: { tokens: 0, cost: 0, requests: 0 },
      },
      by_agent: {},
    }

    if (!logs || logs.length === 0) {
      return summary
    }

    let totalResponseTime = 0
    let cacheHits = 0

    logs.forEach((log) => {
      summary.total_tokens += log.tokens_used
      summary.total_cost += log.cost

      // By provider
      const provider = log.llm_provider as LLMProvider
      if (summary.by_provider[provider]) {
        summary.by_provider[provider].tokens += log.tokens_used
        summary.by_provider[provider].cost += log.cost
        summary.by_provider[provider].requests += 1
      }

      // By agent
      if (log.agent_id) {
        if (!summary.by_agent[log.agent_id]) {
          summary.by_agent[log.agent_id] = {
            tokens: 0,
            cost: 0,
            requests: 0,
          }
        }
        summary.by_agent[log.agent_id].tokens += log.tokens_used
        summary.by_agent[log.agent_id].cost += log.cost
        summary.by_agent[log.agent_id].requests += 1
      }

      // Response time
      if (log.response_time_ms) {
        totalResponseTime += log.response_time_ms
      }

      // Cache hits
      if (log.cache_hit) {
        cacheHits += 1
      }
    })

    summary.cache_hit_rate = summary.total_requests > 0
      ? (cacheHits / summary.total_requests) * 100
      : 0

    summary.avg_response_time_ms = summary.total_requests > 0
      ? Math.round(totalResponseTime / summary.total_requests)
      : 0

    return summary
  },
}
