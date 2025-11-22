/**
 * Database types for user_profiles and user_sessions tables
 * Generated: 2025-11-23T00:53:04Z
 */

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  timezone: string;
  language: string;
  role: 'user' | 'admin';
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
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
  timezone?: string;
  language?: string;
  role?: 'user' | 'admin';
  two_factor_enabled?: boolean;
  two_factor_secret?: string | null;
  metadata?: Record<string, any>;
}

export interface UserProfileUpdate {
  full_name?: string | null;
  avatar_url?: string | null;
  company?: string | null;
  timezone?: string;
  language?: string;
  role?: 'user' | 'admin';
  two_factor_enabled?: boolean;
  two_factor_secret?: string | null;
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

// Supabase query result types
export type UserProfileRow = UserProfile;
export type UserSessionRow = UserSession;
