/**
 * Settings and preferences types
 * Generated: 2025-11-23
 */

export interface LLMProviderSetting {
  id: string;
  user_id: string;
  provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'custom';
  provider_name: string;
  api_key_encrypted: string;
  base_url: string | null;
  model: string;
  default_temperature: number;
  max_tokens: number;
  usage_quota: number | null;
  usage_count: number;
  environment: 'sandbox' | 'production';
  is_active: boolean;
  is_default: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface LLMProviderSettingInsert {
  id?: string;
  user_id: string;
  provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'custom';
  provider_name: string;
  api_key_encrypted: string;
  base_url?: string | null;
  model?: string;
  default_temperature?: number;
  max_tokens?: number;
  usage_quota?: number | null;
  usage_count?: number;
  environment?: 'sandbox' | 'production';
  is_active?: boolean;
  is_default?: boolean;
  metadata?: Record<string, any>;
}

export interface LLMProviderSettingUpdate {
  provider_name?: string;
  api_key_encrypted?: string;
  base_url?: string | null;
  model?: string;
  default_temperature?: number;
  max_tokens?: number;
  usage_quota?: number | null;
  usage_count?: number;
  environment?: 'sandbox' | 'production';
  is_active?: boolean;
  is_default?: boolean;
  metadata?: Record<string, any>;
}

export type LLMProviderSettingRow = LLMProviderSetting;

export interface DataRetentionSetting {
  id: string;
  user_id: string;
  sessions_retention_days: number;
  messages_retention_days: number;
  field_values_retention_days: number;
  audit_logs_retention_days: number;
  auto_redact_pii: boolean;
  pii_fields: string[];
  redaction_method: 'mask' | 'hash' | 'delete';
  gdpr_enabled: boolean;
  ccpa_enabled: boolean;
  auto_delete_enabled: boolean;
  auto_delete_schedule: 'daily' | 'weekly' | 'monthly';
  last_cleanup_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DataRetentionSettingInsert {
  id?: string;
  user_id: string;
  sessions_retention_days?: number;
  messages_retention_days?: number;
  field_values_retention_days?: number;
  audit_logs_retention_days?: number;
  auto_redact_pii?: boolean;
  pii_fields?: string[];
  redaction_method?: 'mask' | 'hash' | 'delete';
  gdpr_enabled?: boolean;
  ccpa_enabled?: boolean;
  auto_delete_enabled?: boolean;
  auto_delete_schedule?: 'daily' | 'weekly' | 'monthly';
  last_cleanup_at?: string | null;
  metadata?: Record<string, any>;
}

export interface DataRetentionSettingUpdate {
  sessions_retention_days?: number;
  messages_retention_days?: number;
  field_values_retention_days?: number;
  audit_logs_retention_days?: number;
  auto_redact_pii?: boolean;
  pii_fields?: string[];
  redaction_method?: 'mask' | 'hash' | 'delete';
  gdpr_enabled?: boolean;
  ccpa_enabled?: boolean;
  auto_delete_enabled?: boolean;
  auto_delete_schedule?: 'daily' | 'weekly' | 'monthly';
  last_cleanup_at?: string | null;
  metadata?: Record<string, any>;
}

export type DataRetentionSettingRow = DataRetentionSetting;

export interface AuditLog {
  id: string;
  user_id: string | null;
  action_type: 
    | 'login'
    | 'logout'
    | 'password_change'
    | 'profile_update'
    | 'agent_create'
    | 'agent_update'
    | 'agent_delete'
    | 'agent_publish'
    | 'session_view'
    | 'session_export'
    | 'session_delete'
    | 'webhook_create'
    | 'webhook_update'
    | 'webhook_delete'
    | 'team_member_invite'
    | 'team_member_remove'
    | 'team_member_role_change'
    | 'subscription_create'
    | 'subscription_update'
    | 'subscription_cancel'
    | 'settings_update'
    | 'api_key_rotate'
    | 'data_export'
    | 'data_delete'
    | 'admin_action';
  resource_type: string | null;
  resource_id: string | null;
  action_details: Record<string, any>;
  description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLogInsert {
  id?: string;
  user_id?: string | null;
  action_type: AuditLog['action_type'];
  resource_type?: string | null;
  resource_id?: string | null;
  action_details?: Record<string, any>;
  description?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

export type AuditLogRow = AuditLog;

export interface SSOConfiguration {
  id: string;
  user_id: string;
  sso_type: 'saml' | 'oidc';
  saml_entity_id: string | null;
  saml_sso_url: string | null;
  saml_x509_cert: string | null;
  saml_metadata_url: string | null;
  oidc_issuer_url: string | null;
  oidc_client_id: string | null;
  oidc_client_secret_encrypted: string | null;
  oidc_scopes: string;
  enabled: boolean;
  auto_provision: boolean;
  default_role: 'owner' | 'admin' | 'member';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SSOConfigurationInsert {
  id?: string;
  user_id: string;
  sso_type: 'saml' | 'oidc';
  saml_entity_id?: string | null;
  saml_sso_url?: string | null;
  saml_x509_cert?: string | null;
  saml_metadata_url?: string | null;
  oidc_issuer_url?: string | null;
  oidc_client_id?: string | null;
  oidc_client_secret_encrypted?: string | null;
  oidc_scopes?: string;
  enabled?: boolean;
  auto_provision?: boolean;
  default_role?: 'owner' | 'admin' | 'member';
  metadata?: Record<string, any>;
}

export interface SSOConfigurationUpdate {
  sso_type?: 'saml' | 'oidc';
  saml_entity_id?: string | null;
  saml_sso_url?: string | null;
  saml_x509_cert?: string | null;
  saml_metadata_url?: string | null;
  oidc_issuer_url?: string | null;
  oidc_client_id?: string | null;
  oidc_client_secret_encrypted?: string | null;
  oidc_scopes?: string;
  enabled?: boolean;
  auto_provision?: boolean;
  default_role?: 'owner' | 'admin' | 'member';
  metadata?: Record<string, any>;
}

export type SSOConfigurationRow = SSOConfiguration;

// Team member types (from teams migration)
export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'pending' | 'inactive';
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMemberInsert {
  id?: string;
  team_id: string;
  user_id: string;
  role?: 'owner' | 'admin' | 'member';
  status?: 'active' | 'pending' | 'inactive';
}

export interface TeamMemberUpdate {
  role?: 'owner' | 'admin' | 'member';
  status?: 'active' | 'pending' | 'inactive';
}

export interface TeamMemberInvite {
  email: string;
  role: 'owner' | 'admin' | 'member';
  team_id?: string;
}

// Encryption Settings
export interface EncryptionSetting {
  id: string;
  user_id: string;
  encryption_at_rest_enabled: boolean;
  encryption_at_rest_algorithm: 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';
  encryption_at_rest_key_rotation_days: number;
  last_key_rotation_at: string | null;
  tls_enabled: boolean;
  tls_min_version: 'TLSv1.0' | 'TLSv1.1' | 'TLSv1.2' | 'TLSv1.3';
  tls_certificate_expiry_check: boolean;
  last_tls_check_at: string | null;
  field_level_encryption_enabled: boolean;
  encrypted_fields: string[];
  compliance_status: 'compliant' | 'warning' | 'non-compliant';
  compliance_notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface EncryptionSettingInsert {
  id?: string;
  user_id: string;
  encryption_at_rest_enabled?: boolean;
  encryption_at_rest_algorithm?: 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';
  encryption_at_rest_key_rotation_days?: number;
  last_key_rotation_at?: string | null;
  tls_enabled?: boolean;
  tls_min_version?: 'TLSv1.0' | 'TLSv1.1' | 'TLSv1.2' | 'TLSv1.3';
  tls_certificate_expiry_check?: boolean;
  last_tls_check_at?: string | null;
  field_level_encryption_enabled?: boolean;
  encrypted_fields?: string[];
  compliance_status?: 'compliant' | 'warning' | 'non-compliant';
  compliance_notes?: string | null;
  metadata?: Record<string, any>;
}

export interface EncryptionSettingUpdate {
  encryption_at_rest_enabled?: boolean;
  encryption_at_rest_algorithm?: 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';
  encryption_at_rest_key_rotation_days?: number;
  last_key_rotation_at?: string | null;
  tls_enabled?: boolean;
  tls_min_version?: 'TLSv1.0' | 'TLSv1.1' | 'TLSv1.2' | 'TLSv1.3';
  tls_certificate_expiry_check?: boolean;
  last_tls_check_at?: string | null;
  field_level_encryption_enabled?: boolean;
  encrypted_fields?: string[];
  compliance_status?: 'compliant' | 'warning' | 'non-compliant';
  compliance_notes?: string | null;
  metadata?: Record<string, any>;
}

export type EncryptionSettingRow = EncryptionSetting;
