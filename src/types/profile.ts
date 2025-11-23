/**
 * Database types for user_profiles, user_sessions, avatars, audit_logs, and soft_deletes tables
 * Generated: 2025-11-23T00:53:04Z
 * Updated: 2025-11-23T02:00:00Z
 */

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  contact_number: string | null;
  timezone: string;
  language: string;
  role: 'user' | 'admin';
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  backup_codes: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserProfileInsert {
  id?: string;
  user_id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  company?: string | null;
  contact_number?: string | null;
  timezone?: string;
  language?: string;
  role?: 'user' | 'admin';
  two_factor_enabled?: boolean;
  two_factor_secret?: string | null;
  backup_codes?: string[];
  metadata?: Record<string, any>;
}

export interface UserProfileUpdate {
  full_name?: string | null;
  avatar_url?: string | null;
  company?: string | null;
  contact_number?: string | null;
  timezone?: string;
  language?: string;
  role?: 'user' | 'admin';
  two_factor_enabled?: boolean;
  two_factor_secret?: string | null;
  backup_codes?: string[];
  metadata?: Record<string, any>;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_info: {
    browser?: string;
    os?: string;
    device?: string;
  };
  ip_address: string | null;
  user_agent: string | null;
  is_active: boolean;
  last_activity_at: string;
  created_at: string;
  expires_at: string | null;
}

export interface UserSessionInsert {
  id?: string;
  user_id: string;
  session_token: string;
  device_info?: {
    browser?: string;
    os?: string;
    device?: string;
  };
  ip_address?: string | null;
  user_agent?: string | null;
  is_active?: boolean;
  last_activity_at?: string;
  expires_at?: string | null;
}

// Combined profile with auth user data
export interface CompleteUserProfile {
  id: string;
  email: string;
  email_verified: boolean;
  profile: UserProfile | null;
}

// Form input types
export interface UpdateProfileInput {
  full_name?: string;
  avatar_url?: string;
  company?: string;
  contact_number?: string;
  timezone?: string;
  language?: string;
}

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface Enable2FAInput {
  secret: string;
  token: string;
}

// =====================================================
// Avatar types
// =====================================================
export interface Avatar {
  id: string;
  user_id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_bucket: string;
  is_active: boolean;
  upload_date: string;
  created_at: string;
}

export interface AvatarInsert {
  id?: string;
  user_id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  storage_bucket?: string;
  is_active?: boolean;
  upload_date?: string;
}

export interface AvatarUpdate {
  is_active?: boolean;
}

// =====================================================
// Audit Log types
// =====================================================
export type AuditActionType =
  | 'profile_update'
  | 'password_change'
  | '2fa_enabled'
  | '2fa_disabled'
  | 'avatar_upload'
  | 'avatar_delete'
  | 'session_terminated'
  | 'logout_everywhere'
  | 'data_export'
  | 'account_deletion_requested'
  | 'account_restored';

export interface AuditLog {
  id: string;
  user_id: string;
  action_type: AuditActionType;
  action_details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
  created_at: string;
}

export interface AuditLogInsert {
  id?: string;
  user_id: string;
  action_type: AuditActionType;
  action_details?: Record<string, any>;
  ip_address?: string | null;
  user_agent?: string | null;
  timestamp?: string;
}

// =====================================================
// Soft Delete types
// =====================================================
export interface SoftDelete {
  id: string;
  user_id: string;
  deletion_date: string;
  restore_token: string;
  deletion_reason: string | null;
  is_restored: boolean;
  restored_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  expires_at: string;
}

export interface SoftDeleteInsert {
  id?: string;
  user_id: string;
  deletion_date?: string;
  restore_token: string;
  deletion_reason?: string | null;
  is_restored?: boolean;
  restored_at?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  expires_at?: string;
}

export interface SoftDeleteUpdate {
  is_restored?: boolean;
  restored_at?: string | null;
}

// =====================================================
// 2FA Setup types
// =====================================================
export interface TwoFactorSetup {
  secret: string;
  qr_code_url: string;
  backup_codes: string[];
}

export interface Verify2FAInput {
  secret: string;
  token: string;
}

// Supabase query result types
export type UserProfileRow = UserProfile;
export type UserSessionRow = UserSession;
export type AvatarRow = Avatar;
export type AuditLogRow = AuditLog;
export type SoftDeleteRow = SoftDelete;
