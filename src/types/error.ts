/**
 * Database types for error_reports table
 * Generated: 2025-11-23T00:22:00Z
 */

export type ErrorType = 'server_error' | 'client_error' | 'validation_error' | 'other'
export type ErrorReportStatus = 'open' | 'investigating' | 'resolved' | 'closed'

export interface ErrorReport {
  id: string
  user_id: string | null
  session_id: string | null
  error_description: string | null
  user_comments: string | null
  error_type: ErrorType
  status: ErrorReportStatus
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ErrorReportInsert {
  id?: string
  user_id?: string | null
  session_id?: string | null
  error_description?: string | null
  user_comments?: string | null
  error_type?: ErrorType
  status?: ErrorReportStatus
  metadata?: Record<string, any>
}

export interface ErrorReportUpdate {
  user_id?: string | null
  session_id?: string | null
  error_description?: string | null
  user_comments?: string | null
  error_type?: ErrorType
  status?: ErrorReportStatus
  metadata?: Record<string, any>
}

// Supabase query result type
export type ErrorReportRow = ErrorReport
