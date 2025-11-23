import { supabase } from "@/lib/supabase"
import {
  forwardWebhook,
  buildWebhookPayload,
} from "@/lib/webhook-utils"
import type {
  Webhook,
  CreateWebhookInput,
  UpdateWebhookInput,
  WebhookFilters,
  WebhookListResponse,
  DeliveryLog,
  DeliveryLogFilters,
  DeliveryLogListResponse,
} from "@/types/webhook"

export const webhooksApi = {
  getAll: async (filters?: WebhookFilters): Promise<WebhookListResponse> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    let query = supabase
      .from("webhooks")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    // Apply filters
    if (filters?.agent_id) {
      query = query.eq("agent_id", filters.agent_id)
    }

    if (filters?.enabled !== undefined) {
      query = query.eq("enabled", filters.enabled)
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq("status", filters.status)
    }

    if (filters?.search) {
      query = query.or(`url.ilike.%${filters.search}%`)
    }

    // Pagination
    const page = filters?.page || 1
    const pageSize = filters?.pageSize || 20
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    query = query.range(from, to)

    const { data: webhooks, error, count } = await query

    if (error) throw error

    return {
      webhooks: (webhooks || []) as Webhook[],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    }
  },

  getById: async (id: string): Promise<Webhook> => {
    const { data, error } = await supabase
      .from("webhooks")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as Webhook
  },

  create: async (webhook: CreateWebhookInput): Promise<Webhook> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("webhooks")
      .insert({
        ...webhook,
        user_id: user.id,
        method: webhook.method || 'POST',
        headers: webhook.headers || {},
        auth_type: webhook.auth_type || 'none',
        retry_policy: webhook.retry_policy || {
          max_retries: 3,
          backoff_type: 'exponential',
          initial_delay_ms: 1000,
        },
        rate_limit_per_minute: webhook.rate_limit_per_minute || 60,
        enabled: webhook.enabled !== undefined ? webhook.enabled : true,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error
    return data as Webhook
  },

  update: async (id: string, updates: UpdateWebhookInput): Promise<Webhook> => {
    const { data, error } = await supabase
      .from("webhooks")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Webhook
  },

  delete: async (id: string): Promise<void> => {
    // Soft delete by setting status to 'deleted'
    const { error } = await supabase
      .from("webhooks")
      .update({ status: 'deleted' })
      .eq("id", id)

    if (error) throw error
  },

  testDelivery: async (id: string): Promise<{ success: boolean; response_code?: number; response_body?: string; error?: string }> => {
    try {
      const webhook = await webhooksApi.getById(id)
      
      // Generate test payload
      const samplePayload = buildWebhookPayload('test', {
        session_id: 'test-session-id',
        agent_id: webhook.agent_id,
        test: true,
      })

      // Use the webhook forwarding utility with proper HMAC support
      const result = await forwardWebhook(
        webhook,
        {
          ...samplePayload,
          webhook_id: webhook.id,
        },
        1,
        async (log) => {
          return await webhooksApi.logDelivery(log)
        }
      )

      return result
    } catch (error: any) {
      // Log failed delivery
      await webhooksApi.logDelivery({
        webhook_id: id,
        status: 'failed',
        error_message: error.message,
        error_type: 'network_error',
      })

      return {
        success: false,
        error: error.message,
      }
    }
  },

  getDeliveryLogs: async (filters?: DeliveryLogFilters): Promise<DeliveryLogListResponse> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    let query = supabase
      .from("delivery_logs")
      .select(`
        *,
        webhooks!inner(user_id)
      `, { count: "exact" })
      .eq("webhooks.user_id", user.id)
      .order("created_at", { ascending: false })

    // Apply filters
    if (filters?.webhook_id) {
      query = query.eq("webhook_id", filters.webhook_id)
    }

    if (filters?.session_id) {
      query = query.eq("session_id", filters.session_id)
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq("status", filters.status)
    }

    // Pagination
    const page = filters?.page || 1
    const pageSize = filters?.pageSize || 20
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    // Extract delivery logs from the nested structure
    const logs = (data || []).map((item: any) => {
      const { webhooks, ...log } = item
      return log
    }) as DeliveryLog[]

    return {
      logs,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    }
  },

  getDeliveryLogById: async (id: string): Promise<DeliveryLog> => {
    const { data, error } = await supabase
      .from("delivery_logs")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as DeliveryLog
  },

  getWebhooksForEvent: async (eventType: string, agentId?: string): Promise<Webhook[]> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    let query = supabase
      .from("webhooks")
      .select("*")
      .eq("user_id", user.id)
      .eq("enabled", true)
      .eq("status", "active")
      .contains("triggers", [eventType])

    // Filter by agent if provided, or get global webhooks (agent_id is null)
    if (agentId) {
      query = query.or(`agent_id.eq.${agentId},agent_id.is.null`)
    } else {
      query = query.is("agent_id", null)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []) as Webhook[]
  },

  triggerWebhooksForEvent: async (
    eventType: string,
    payload: Record<string, any>,
    agentId?: string
  ): Promise<Array<{ webhook_id: string; success: boolean; error?: string }>> => {
    try {
      const webhooks = await webhooksApi.getWebhooksForEvent(eventType, agentId)
      const results: Array<{ webhook_id: string; success: boolean; error?: string }> = []

      // Trigger all matching webhooks (in parallel, but with rate limiting consideration)
      const promises = webhooks.map(async (webhook) => {
        try {
          const result = await forwardWebhook(
            webhook,
            {
              ...payload,
              webhook_id: webhook.id,
            },
            1,
            async (log) => {
              return await webhooksApi.logDelivery(log)
            }
          )

          return {
            webhook_id: webhook.id,
            success: result.success,
            error: result.error,
          }
        } catch (error: any) {
          return {
            webhook_id: webhook.id,
            success: false,
            error: error.message,
          }
        }
      })

      const webhookResults = await Promise.all(promises)
      results.push(...webhookResults)

      return results
    } catch (error: any) {
      throw new Error(`Failed to trigger webhooks: ${error.message}`)
    }
  },

  logDelivery: async (log: {
    webhook_id: string
    session_id?: string | null
    status: 'pending' | 'success' | 'failed' | 'retrying'
    attempt_number?: number
    response_code?: number | null
    response_body?: string | null
    response_headers?: Record<string, string>
    error_message?: string | null
    error_type?: string | null
    request_payload?: Record<string, any> | null
    request_headers?: Record<string, string>
    started_at?: string
    completed_at?: string | null
    duration_ms?: number | null
    will_retry?: boolean
    next_retry_at?: string | null
  }): Promise<DeliveryLog> => {
    const { data, error } = await supabase
      .from("delivery_logs")
      .insert({
        ...log,
        attempt_number: log.attempt_number || 1,
        response_headers: log.response_headers || {},
        request_headers: log.request_headers || {},
        started_at: log.started_at || new Date().toISOString(),
        will_retry: log.will_retry || false,
      })
      .select()
      .single()

    if (error) throw error

    // Update webhook's last delivery status
    if (log.status === 'success') {
      await supabase
        .from("webhooks")
        .update({
          last_successful_delivery_at: new Date().toISOString(),
          last_delivery_status: 'success',
        })
        .eq("id", log.webhook_id)
    } else if (log.status === 'failed') {
      await supabase
        .from("webhooks")
        .update({
          last_delivery_status: 'failed',
        })
        .eq("id", log.webhook_id)
    }

    return data as DeliveryLog
  },
}
