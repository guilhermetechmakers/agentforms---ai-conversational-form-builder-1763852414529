export interface Webhook {
  id: string;
  user_id: string;
  agent_id?: string | null; // null for global webhooks
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers: Record<string, string>;
  auth_type: 'none' | 'bearer' | 'basic' | 'hmac';
  auth_token?: string | null;
  triggers: WebhookTrigger[];
  retry_policy: RetryPolicy;
  rate_limit_per_minute: number;
  enabled: boolean;
  status: 'active' | 'paused' | 'deleted';
  last_successful_delivery_at?: string | null;
  last_delivery_status?: string | null;
  created_at: string;
  updated_at: string;
}

export type WebhookTrigger = 'session_started' | 'session_completed' | 'field_collected' | 'session_updated';

export interface RetryPolicy {
  max_retries: number;
  backoff_type: 'exponential' | 'linear';
  initial_delay_ms: number;
}

export interface DeliveryLog {
  id: string;
  webhook_id: string;
  session_id?: string | null;
  attempt_number: number;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  response_code?: number | null;
  response_body?: string | null;
  response_headers: Record<string, string>;
  error_message?: string | null;
  error_type?: string | null;
  request_payload?: Record<string, any> | null;
  request_headers: Record<string, string>;
  started_at: string;
  completed_at?: string | null;
  duration_ms?: number | null;
  will_retry: boolean;
  next_retry_at?: string | null;
  created_at: string;
}

export interface CreateWebhookInput {
  agent_id?: string | null;
  url: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  auth_type?: 'none' | 'bearer' | 'basic' | 'hmac';
  auth_token?: string | null;
  triggers: WebhookTrigger[];
  retry_policy?: RetryPolicy;
  rate_limit_per_minute?: number;
  enabled?: boolean;
}

export interface UpdateWebhookInput {
  url?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  auth_type?: 'none' | 'bearer' | 'basic' | 'hmac';
  auth_token?: string | null;
  triggers?: WebhookTrigger[];
  retry_policy?: RetryPolicy;
  rate_limit_per_minute?: number;
  enabled?: boolean;
  status?: 'active' | 'paused' | 'deleted';
}

export interface WebhookFilters {
  agent_id?: string;
  enabled?: boolean;
  status?: 'active' | 'paused' | 'all';
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface DeliveryLogFilters {
  webhook_id?: string;
  session_id?: string;
  status?: 'pending' | 'success' | 'failed' | 'retrying' | 'all';
  page?: number;
  pageSize?: number;
}

export interface WebhookListResponse {
  webhooks: Webhook[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DeliveryLogListResponse {
  logs: DeliveryLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
