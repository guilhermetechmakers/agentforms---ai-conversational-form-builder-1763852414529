/**
 * Database types for email_verification_logs table
 * Generated: 2025-11-23T00:48:07Z
 */

export type VerificationAction = 
  | "verification_sent"
  | "verification_attempted"
  | "verification_success"
  | "verification_failed"
  | "resend_requested"

export type VerificationStatus = 
  | "success"
  | "failed"
  | "pending"
  | "expired"

export interface EmailVerificationLog {
  id: string
  user_id: string
  email: string
  action: VerificationAction
  status: VerificationStatus
  token_hash: string | null
  ip_address: string | null
  user_agent: string | null
  error_message: string | null
  error_code: string | null
  created_at: string
  expires_at: string | null
}

export interface EmailVerificationLogInsert {
  id?: string
  user_id: string
  email: string
  action: VerificationAction
  status: VerificationStatus
  token_hash?: string | null
  ip_address?: string | null
  user_agent?: string | null
  error_message?: string | null
  error_code?: string | null
  expires_at?: string | null
}

export interface EmailVerificationLogUpdate {
  status?: VerificationStatus
  error_message?: string | null
  error_code?: string | null
}

// Supabase query result type
export type EmailVerificationLogRow = EmailVerificationLog

// Verification status check result
export interface VerificationStatusResult {
  isVerified: boolean
  email: string | null
  user: any
}
