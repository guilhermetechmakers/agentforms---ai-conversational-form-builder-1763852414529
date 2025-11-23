-- =====================================================
-- Migration: Create Settings Tables
-- Created: 2025-11-23T01:51:58Z
-- Tables: llm_provider_settings, data_retention_settings, audit_logs
-- Purpose: Support LLM configuration, data retention policies, and application audit logging
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE: llm_provider_settings
-- Purpose: Store user LLM provider configurations and API keys
-- =====================================================
CREATE TABLE IF NOT EXISTS llm_provider_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Provider identification
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'azure', 'custom')),
  provider_name TEXT NOT NULL,
  
  -- API configuration
  api_key_encrypted TEXT NOT NULL, -- Encrypted API key
  base_url TEXT, -- Custom base URL for custom providers
  model TEXT DEFAULT 'gpt-4' NOT NULL,
  
  -- Usage settings
  default_temperature DECIMAL(3, 2) DEFAULT 0.7 CHECK (default_temperature >= 0 AND default_temperature <= 2),
  max_tokens INTEGER DEFAULT 2000 CHECK (max_tokens > 0),
  usage_quota INTEGER, -- Monthly quota limit
  usage_count INTEGER DEFAULT 0 NOT NULL, -- Current month usage
  
  -- Environment
  environment TEXT DEFAULT 'production' CHECK (environment IN ('sandbox', 'production')) NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_default BOOLEAN DEFAULT false NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT llm_provider_settings_provider_name_not_empty CHECK (length(trim(provider_name)) > 0),
  CONSTRAINT llm_provider_settings_one_default_per_user UNIQUE NULLS NOT DISTINCT (user_id, (is_default = true))
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS llm_provider_settings_user_id_idx ON llm_provider_settings(user_id);
CREATE INDEX IF NOT EXISTS llm_provider_settings_provider_idx ON llm_provider_settings(provider);
CREATE INDEX IF NOT EXISTS llm_provider_settings_is_active_idx ON llm_provider_settings(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS llm_provider_settings_is_default_idx ON llm_provider_settings(is_default) WHERE is_default = true;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_llm_provider_settings_updated_at ON llm_provider_settings;
CREATE TRIGGER update_llm_provider_settings_updated_at
  BEFORE UPDATE ON llm_provider_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE llm_provider_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own settings
CREATE POLICY "llm_provider_settings_select_own"
  ON llm_provider_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "llm_provider_settings_insert_own"
  ON llm_provider_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "llm_provider_settings_update_own"
  ON llm_provider_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "llm_provider_settings_delete_own"
  ON llm_provider_settings FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: data_retention_settings
-- Purpose: Store data retention policies per user/organization
-- =====================================================
CREATE TABLE IF NOT EXISTS data_retention_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Retention periods (in days)
  sessions_retention_days INTEGER DEFAULT 365 CHECK (sessions_retention_days >= 0),
  messages_retention_days INTEGER DEFAULT 365 CHECK (messages_retention_days >= 0),
  field_values_retention_days INTEGER DEFAULT 365 CHECK (field_values_retention_days >= 0),
  audit_logs_retention_days INTEGER DEFAULT 730 CHECK (audit_logs_retention_days >= 0),
  
  -- Privacy settings
  auto_redact_pii BOOLEAN DEFAULT false NOT NULL,
  pii_fields JSONB DEFAULT '[]'::jsonb, -- Array of field keys to redact
  redaction_method TEXT DEFAULT 'mask' CHECK (redaction_method IN ('mask', 'hash', 'delete')) NOT NULL,
  
  -- Compliance
  gdpr_enabled BOOLEAN DEFAULT false NOT NULL,
  ccpa_enabled BOOLEAN DEFAULT false NOT NULL,
  
  -- Auto-deletion
  auto_delete_enabled BOOLEAN DEFAULT false NOT NULL,
  auto_delete_schedule TEXT DEFAULT 'monthly' CHECK (auto_delete_schedule IN ('daily', 'weekly', 'monthly')) NOT NULL,
  last_cleanup_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraint: one setting per user
  UNIQUE(user_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS data_retention_settings_user_id_idx ON data_retention_settings(user_id);
CREATE INDEX IF NOT EXISTS data_retention_settings_auto_delete_enabled_idx ON data_retention_settings(auto_delete_enabled) WHERE auto_delete_enabled = true;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_data_retention_settings_updated_at ON data_retention_settings;
CREATE TRIGGER update_data_retention_settings_updated_at
  BEFORE UPDATE ON data_retention_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE data_retention_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own settings
CREATE POLICY "data_retention_settings_select_own"
  ON data_retention_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "data_retention_settings_insert_own"
  ON data_retention_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "data_retention_settings_update_own"
  ON data_retention_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TABLE: audit_logs
-- Purpose: Track all user actions for compliance and security
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Action details
  action_type TEXT NOT NULL CHECK (action_type IN (
    'login',
    'logout',
    'password_change',
    'profile_update',
    'agent_create',
    'agent_update',
    'agent_delete',
    'agent_publish',
    'session_view',
    'session_export',
    'session_delete',
    'webhook_create',
    'webhook_update',
    'webhook_delete',
    'team_member_invite',
    'team_member_remove',
    'team_member_role_change',
    'subscription_create',
    'subscription_update',
    'subscription_cancel',
    'settings_update',
    'api_key_rotate',
    'data_export',
    'data_delete',
    'admin_action'
  )),
  
  -- Resource information
  resource_type TEXT, -- 'agent', 'session', 'webhook', etc.
  resource_id UUID,
  
  -- Action details
  action_details JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  
  -- Request metadata
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_type_idx ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS audit_logs_resource_type_idx ON audit_logs(resource_type) WHERE resource_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS audit_logs_resource_id_idx ON audit_logs(resource_id) WHERE resource_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can see their own audit logs, admins can see all
CREATE POLICY "audit_logs_select_own"
  ON audit_logs FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "audit_logs_insert_system"
  ON audit_logs FOR INSERT
  WITH CHECK (true); -- System can insert logs for any user

-- =====================================================
-- TABLE: sso_configurations
-- Purpose: Store SSO (SAML/OIDC) configurations for enterprise users
-- =====================================================
CREATE TABLE IF NOT EXISTS sso_configurations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- SSO type
  sso_type TEXT NOT NULL CHECK (sso_type IN ('saml', 'oidc')),
  
  -- SAML configuration
  saml_entity_id TEXT,
  saml_sso_url TEXT,
  saml_x509_cert TEXT,
  saml_metadata_url TEXT,
  
  -- OIDC configuration
  oidc_issuer_url TEXT,
  oidc_client_id TEXT,
  oidc_client_secret_encrypted TEXT,
  oidc_scopes TEXT DEFAULT 'openid profile email',
  
  -- Common settings
  enabled BOOLEAN DEFAULT false NOT NULL,
  auto_provision BOOLEAN DEFAULT true NOT NULL,
  default_role TEXT DEFAULT 'member' CHECK (default_role IN ('owner', 'admin', 'member')) NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraint: one SSO config per user
  UNIQUE(user_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS sso_configurations_user_id_idx ON sso_configurations(user_id);
CREATE INDEX IF NOT EXISTS sso_configurations_enabled_idx ON sso_configurations(enabled) WHERE enabled = true;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_sso_configurations_updated_at ON sso_configurations;
CREATE TRIGGER update_sso_configurations_updated_at
  BEFORE UPDATE ON sso_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE sso_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own SSO config
CREATE POLICY "sso_configurations_select_own"
  ON sso_configurations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "sso_configurations_insert_own"
  ON sso_configurations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sso_configurations_update_own"
  ON sso_configurations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Documentation
-- =====================================================
COMMENT ON TABLE llm_provider_settings IS 'User LLM provider configurations with encrypted API keys';
COMMENT ON TABLE data_retention_settings IS 'Data retention and privacy policies per user';
COMMENT ON TABLE audit_logs IS 'Application-wide audit log for compliance and security';
COMMENT ON TABLE sso_configurations IS 'SSO (SAML/OIDC) configurations for enterprise users';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS sso_configurations CASCADE;
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS data_retention_settings CASCADE;
-- DROP TABLE IF EXISTS llm_provider_settings CASCADE;
