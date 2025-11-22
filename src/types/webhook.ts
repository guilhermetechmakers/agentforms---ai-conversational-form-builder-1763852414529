export interface Webhook {
  id: string;
  agent_id?: string; // null for global webhooks
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  auth_type?: 'none' | 'bearer' | 'basic';
  auth_token?: string;
  triggers: WebhookTrigger[];
  retry_policy: RetryPolicy;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type WebhookTrigger = 'session_started' | 'session_completed' | 'field_collected' | 'session_updated';

export interface RetryPolicy {
  max_retries: number;
  backoff_type: 'exponential' | 'linear';
  initial_delay_ms: number;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  session_id?: string;
  status: 'pending' | 'success' | 'failed';
  attempt: number;
  response_code?: number;
  response_body?: string;
  error_message?: string;
  delivered_at?: string;
  created_at: string;
}

export interface CreateWebhookInput {
  agent_id?: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  auth_type?: 'none' | 'bearer' | 'basic';
  auth_token?: string;
  triggers: WebhookTrigger[];
  retry_policy: RetryPolicy;
}
