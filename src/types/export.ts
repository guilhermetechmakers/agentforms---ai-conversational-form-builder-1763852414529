/**
 * Database types for exports and export_schedules tables
 * Generated: 2025-11-23T02:50:00Z
 */

export type ExportDataType = 'sessions' | 'agents' | 'all';
export type ExportFormat = 'csv' | 'json';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired';

export interface Export {
  id: string;
  user_id: string;
  data_type: ExportDataType;
  format: ExportFormat;
  status: ExportStatus;
  filters: ExportFilters;
  file_name: string | null;
  file_size_bytes: number | null;
  download_url: string | null;
  download_url_expires_at: string | null;
  error_message: string | null;
  error_details: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ExportFilters {
  agent_ids?: string[];
  date_from?: string;
  date_to?: string;
  status?: 'in-progress' | 'completed' | 'abandoned' | 'all';
  search?: string;
  [key: string]: any;
}

export interface ExportInsert {
  id?: string;
  user_id: string;
  data_type: ExportDataType;
  format: ExportFormat;
  status?: ExportStatus;
  filters?: ExportFilters;
  file_name?: string | null;
  file_size_bytes?: number | null;
  download_url?: string | null;
  download_url_expires_at?: string | null;
  error_message?: string | null;
  error_details?: Record<string, any> | null;
  completed_at?: string | null;
}

export interface ExportUpdate {
  status?: ExportStatus;
  file_name?: string | null;
  file_size_bytes?: number | null;
  download_url?: string | null;
  download_url_expires_at?: string | null;
  error_message?: string | null;
  error_details?: Record<string, any> | null;
  completed_at?: string | null;
}

// Supabase query result type
export type ExportRow = Export;

// Export Schedule Types
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';
export type DeliveryMethod = 'download' | 'webhook' | 'both';
export type WebhookAuthType = 'none' | 'bearer' | 'basic' | 'custom';
export type ScheduleRunStatus = 'success' | 'failed' | 'skipped';

export interface ExportSchedule {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  data_type: ExportDataType;
  format: ExportFormat;
  filters: ExportFilters;
  frequency: ScheduleFrequency;
  frequency_config: Record<string, any>;
  delivery_method: DeliveryMethod;
  webhook_url: string | null;
  webhook_headers: Record<string, string>;
  webhook_auth_type: WebhookAuthType | null;
  webhook_auth_config: Record<string, any>;
  last_run_at: string | null;
  last_run_status: ScheduleRunStatus | null;
  next_run_at: string | null;
  run_count: number;
  failure_count: number;
  created_at: string;
  updated_at: string;
}

export interface ExportScheduleInsert {
  id?: string;
  user_id: string;
  name: string;
  description?: string | null;
  enabled?: boolean;
  data_type: ExportDataType;
  format: ExportFormat;
  filters?: ExportFilters;
  frequency: ScheduleFrequency;
  frequency_config?: Record<string, any>;
  delivery_method?: DeliveryMethod;
  webhook_url?: string | null;
  webhook_headers?: Record<string, string>;
  webhook_auth_type?: WebhookAuthType | null;
  webhook_auth_config?: Record<string, any>;
  next_run_at?: string | null;
}

export interface ExportScheduleUpdate {
  name?: string;
  description?: string | null;
  enabled?: boolean;
  data_type?: ExportDataType;
  format?: ExportFormat;
  filters?: ExportFilters;
  frequency?: ScheduleFrequency;
  frequency_config?: Record<string, any>;
  delivery_method?: DeliveryMethod;
  webhook_url?: string | null;
  webhook_headers?: Record<string, string>;
  webhook_auth_type?: WebhookAuthType | null;
  webhook_auth_config?: Record<string, any>;
  last_run_at?: string | null;
  last_run_status?: ScheduleRunStatus | null;
  next_run_at?: string | null;
  run_count?: number;
  failure_count?: number;
}

// Supabase query result type
export type ExportScheduleRow = ExportSchedule;

// Request/Response types for API
export interface CreateExportRequest {
  data_type: ExportDataType;
  format: ExportFormat;
  filters?: ExportFilters;
}

export interface CreateExportResponse {
  export: Export;
  download_url?: string;
}

export interface CreateScheduleRequest {
  name: string;
  description?: string;
  enabled?: boolean;
  data_type: ExportDataType;
  format: ExportFormat;
  filters?: ExportFilters;
  frequency: ScheduleFrequency;
  frequency_config?: Record<string, any>;
  delivery_method?: DeliveryMethod;
  webhook_url?: string;
  webhook_headers?: Record<string, string>;
  webhook_auth_type?: WebhookAuthType;
  webhook_auth_config?: Record<string, any>;
}

export interface CreateScheduleResponse {
  schedule: ExportSchedule;
}

export interface ExportListResponse {
  exports: Export[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ScheduleListResponse {
  schedules: ExportSchedule[];
  total: number;
}
