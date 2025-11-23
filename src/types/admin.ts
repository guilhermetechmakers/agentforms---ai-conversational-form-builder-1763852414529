/**
 * Database types for Admin Dashboard
 * Generated: 2025-11-23T01:13:15Z
 */

// =====================================================
// Organizations
// =====================================================
export interface Organization {
  id: string;
  user_id: string;
  name: string;
  slug: string | null;
  description: string | null;
  status: 'active' | 'suspended' | 'deleted' | 'pending';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface OrganizationInsert {
  id?: string;
  user_id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  status?: 'active' | 'suspended' | 'deleted' | 'pending';
  metadata?: Record<string, any>;
}

export interface OrganizationUpdate {
  name?: string;
  slug?: string | null;
  description?: string | null;
  status?: 'active' | 'suspended' | 'deleted' | 'pending';
  metadata?: Record<string, any>;
}

export interface OrganizationWithUser extends Organization {
  user?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// =====================================================
// System Metrics
// =====================================================
export type MetricType = 
  | 'total_agents' 
  | 'monthly_sessions' 
  | 'llm_usage' 
  | 'error_rate' 
  | 'active_users' 
  | 'revenue' 
  | 'mrr' 
  | 'churn_rate';

export interface SystemMetric {
  id: string;
  metric_type: MetricType;
  metric_value: number;
  metric_unit: string | null;
  period_start: string;
  period_end: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SystemMetricInsert {
  id?: string;
  metric_type: MetricType;
  metric_value: number;
  metric_unit?: string | null;
  period_start: string;
  period_end: string;
  metadata?: Record<string, any>;
}

export interface SystemMetricsSummary {
  total_agents: number;
  monthly_sessions: number;
  llm_usage: number;
  error_rate: number;
  active_users: number;
  revenue: number;
  mrr: number;
  churn_rate: number;
}

export interface MetricTimeSeries {
  date: string;
  value: number;
  label?: string;
}

// =====================================================
// Audit Logs
// =====================================================
export type AuditEventType = 
  | 'user_suspended' 
  | 'user_deleted' 
  | 'user_impersonated' 
  | 'session_deleted' 
  | 'session_redacted' 
  | 'webhook_resent' 
  | 'invoice_generated' 
  | 'plan_updated' 
  | 'system_config_changed';

export type AuditResourceType = 
  | 'user' 
  | 'organization' 
  | 'session' 
  | 'agent' 
  | 'webhook' 
  | 'invoice' 
  | 'plan' 
  | 'system';

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  event_type: AuditEventType;
  resource_type: AuditResourceType;
  resource_id: string | null;
  action_description: string;
  action_details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AuditLogInsert {
  id?: string;
  user_id?: string | null;
  user_email?: string | null;
  user_role?: string | null;
  event_type: AuditEventType;
  resource_type: AuditResourceType;
  resource_id?: string | null;
  action_description: string;
  action_details?: Record<string, any>;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, any>;
}

export interface AuditLogFilters {
  event_type?: AuditEventType;
  resource_type?: AuditResourceType;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// =====================================================
// Moderation Queue
// =====================================================
export type ModerationReportType = 
  | 'abuse' 
  | 'spam' 
  | 'inappropriate_content' 
  | 'privacy_violation' 
  | 'other';

export type ModerationStatus = 
  | 'pending' 
  | 'reviewing' 
  | 'resolved' 
  | 'dismissed';

export interface ModerationQueueItem {
  id: string;
  session_id: string | null;
  agent_id: string | null;
  user_id: string | null;
  report_type: ModerationReportType;
  report_reason: string;
  reported_by: string | null;
  reported_at: string;
  status: ModerationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution_notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ModerationQueueItemInsert {
  id?: string;
  session_id?: string | null;
  agent_id?: string | null;
  user_id?: string | null;
  report_type: ModerationReportType;
  report_reason: string;
  reported_by?: string | null;
  status?: ModerationStatus;
  metadata?: Record<string, any>;
}

export interface ModerationQueueItemUpdate {
  status?: ModerationStatus;
  reviewed_by?: string | null;
  resolution_notes?: string | null;
  metadata?: Record<string, any>;
}

export interface ModerationQueueItemWithDetails extends ModerationQueueItem {
  session?: {
    id: string;
    agent_id: string;
    status: string;
    created_at: string;
  };
  agent?: {
    id: string;
    name: string;
  };
  reporter?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

// =====================================================
// Admin Dashboard Data
// =====================================================
export interface AdminDashboardData {
  metrics: SystemMetricsSummary;
  metrics_timeseries: Record<MetricType, MetricTimeSeries[]>;
  recent_organizations: OrganizationWithUser[];
  pending_moderations: number;
  recent_audit_logs: AuditLog[];
}

// =====================================================
// User Management
// =====================================================
export interface UserManagementUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  email_verified: boolean;
  status: 'active' | 'suspended' | 'deleted';
  created_at: string;
  organization?: Organization;
  total_agents?: number;
  total_sessions?: number;
}

export interface UserManagementFilters {
  search?: string;
  role?: 'user' | 'admin';
  status?: 'active' | 'suspended' | 'deleted';
  page?: number;
  pageSize?: number;
}

export interface UserActionRequest {
  user_id: string;
  action: 'suspend' | 'delete' | 'impersonate' | 'restore';
  reason?: string;
}

// =====================================================
// Billing Overview
// =====================================================
export interface BillingOverview {
  total_revenue: number;
  mrr: number;
  arr: number;
  churn_rate: number;
  active_subscriptions: number;
  new_subscriptions_this_month: number;
  revenue_growth: number;
  revenue_timeseries: MetricTimeSeries[];
}
