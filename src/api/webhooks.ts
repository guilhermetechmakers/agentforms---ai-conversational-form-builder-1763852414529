import { supabase } from "@/lib/supabase"
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
    // This would typically call a backend endpoint that triggers the webhook
    // For now, we'll return a mock response structure
    // In production, this should call: POST /api/webhooks/{id}/test
    try {
      const webhook = await webhooksApi.getById(id)
      
      // Generate sample payload
      const samplePayload = {
        event: 'test',
        webhook_id: webhook.id,
        timestamp: new Date().toISOString(),
        data: {
          session_id: 'test-session-id',
          agent_id: webhook.agent_id,
          test: true,
        },
      }

      // In production, this would make an actual HTTP request
      // For now, we'll simulate it
      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers: {
          'Content-Type': 'application/json',
          ...webhook.headers,
          ...(webhook.auth_type === 'bearer' && webhook.auth_token
            ? { Authorization: `Bearer ${webhook.auth_token}` }
            : {}),
          ...(webhook.auth_type === 'basic' && webhook.auth_token
            ? { Authorization: `Basic ${webhook.auth_token}` }
            : {}),
        },
        body: JSON.stringify(samplePayload),
      })

      const responseBody = await response.text()

      // Log the delivery attempt
      await webhooksApi.logDelivery({
        webhook_id: id,
        status: response.ok ? 'success' : 'failed',
        response_code: response.status,
        response_body: responseBody,
        request_payload: samplePayload,
      })

      return {
        success: response.ok,
        response_code: response.status,
        response_body: responseBody,
      }
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

  logDelivery: async (log: {
    webhook_id: string
    session_id?: string
    status: 'pending' | 'success' | 'failed' | 'retrying'
    attempt_number?: number
    response_code?: number
    response_body?: string
    response_headers?: Record<string, string>
    error_message?: string
    error_type?: string
    request_payload?: Record<string, any>
    request_headers?: Record<string, string>
    started_at?: string
    completed_at?: string
    duration_ms?: number
    will_retry?: boolean
    next_retry_at?: string
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
