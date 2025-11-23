-- =====================================================
-- Migration: Create Admin Tables
-- Created: 2025-11-23T01:13:15Z
-- Tables: organizations, system_metrics, audit_logs, moderation_queue
-- Purpose: Foundation for Admin Dashboard functionality
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
-- TABLE: organizations
-- Purpose: Track organizations/accounts for admin management
-- =====================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core fields
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  
  -- Account status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted', 'pending')) NOT NULL,
  
  -- Organization metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT organizations_name_not_empty CHECK (length(trim(name)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS organizations_user_id_idx ON organizations(user_id);
CREATE INDEX IF NOT EXISTS organizations_slug_idx ON organizations(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS organizations_status_idx ON organizations(status) WHERE status != 'deleted';
CREATE INDEX IF NOT EXISTS organizations_created_at_idx ON organizations(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can access their own organizations, admins can access all
CREATE POLICY "organizations_select_own"
  ON organizations FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "organizations_insert_own"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "organizations_update_admin"
  ON organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- =====================================================
-- TABLE: system_metrics
-- Purpose: Store system-wide metrics for admin dashboard
-- =====================================================
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Metric identification
  metric_type TEXT NOT NULL CHECK (metric_type IN ('total_agents', 'monthly_sessions', 'llm_usage', 'error_rate', 'active_users', 'revenue', 'mrr', 'churn_rate')),
  metric_value DECIMAL(15, 4) NOT NULL,
  metric_unit TEXT,
  
  -- Time period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS system_metrics_type_idx ON system_metrics(metric_type);
CREATE INDEX IF NOT EXISTS system_metrics_period_idx ON system_metrics(period_start DESC, period_end DESC);
CREATE INDEX IF NOT EXISTS system_metrics_created_at_idx ON system_metrics(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_system_metrics_updated_at ON system_metrics;
CREATE TRIGGER update_system_metrics_updated_at
  BEFORE UPDATE ON system_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can access metrics
CREATE POLICY "system_metrics_select_admin"
  ON system_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "system_metrics_insert_admin"
  ON system_metrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- =====================================================
-- TABLE: audit_logs
-- Purpose: Track all administrative actions for audit trail
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Actor information
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_role TEXT,
  
  -- Action details
  event_type TEXT NOT NULL CHECK (event_type IN ('user_suspended', 'user_deleted', 'user_impersonated', 'session_deleted', 'session_redacted', 'webhook_resent', 'invoice_generated', 'plan_updated', 'system_config_changed')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('user', 'organization', 'session', 'agent', 'webhook', 'invoice', 'plan', 'system')),
  resource_id UUID,
  
  -- Action details
  action_description TEXT NOT NULL,
  action_details JSONB DEFAULT '{}'::jsonb,
  
  -- IP and metadata
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_event_type_idx ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS audit_logs_resource_idx ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can access audit logs
CREATE POLICY "audit_logs_select_admin"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "audit_logs_insert_system"
  ON audit_logs FOR INSERT
  WITH CHECK (true); -- System can always insert

-- =====================================================
-- TABLE: moderation_queue
-- Purpose: Track flagged sessions and abuse reports
-- =====================================================
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Related resources
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Report details
  report_type TEXT NOT NULL CHECK (report_type IN ('abuse', 'spam', 'inappropriate_content', 'privacy_violation', 'other')),
  report_reason TEXT NOT NULL,
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Moderation status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')) NOT NULL,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS moderation_queue_session_id_idx ON moderation_queue(session_id);
CREATE INDEX IF NOT EXISTS moderation_queue_status_idx ON moderation_queue(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS moderation_queue_created_at_idx ON moderation_queue(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_moderation_queue_updated_at ON moderation_queue;
CREATE TRIGGER update_moderation_queue_updated_at
  BEFORE UPDATE ON moderation_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admins can access all, users can report
CREATE POLICY "moderation_queue_select_admin"
  ON moderation_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "moderation_queue_insert_all"
  ON moderation_queue FOR INSERT
  WITH CHECK (true); -- Anyone can report

CREATE POLICY "moderation_queue_update_admin"
  ON moderation_queue FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Documentation
COMMENT ON TABLE organizations IS 'Organizations/accounts for admin management';
COMMENT ON TABLE system_metrics IS 'System-wide metrics for admin dashboard';
COMMENT ON TABLE audit_logs IS 'Audit trail of all administrative actions';
COMMENT ON TABLE moderation_queue IS 'Flagged sessions and abuse reports for moderation';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS moderation_queue CASCADE;
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS system_metrics CASCADE;
-- DROP TABLE IF EXISTS organizations CASCADE;
