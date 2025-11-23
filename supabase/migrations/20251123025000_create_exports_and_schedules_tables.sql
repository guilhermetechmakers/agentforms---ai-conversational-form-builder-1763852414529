-- =====================================================
-- Migration: Create Exports and Schedules Tables
-- Created: 2025-11-23T02:50:00Z
-- Tables: exports, export_schedules
-- Purpose: Enable on-demand and scheduled data exports
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
-- TABLE: exports
-- Purpose: Track export requests and their status
-- =====================================================
CREATE TABLE IF NOT EXISTS exports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Export configuration
  data_type TEXT NOT NULL CHECK (data_type IN ('sessions', 'agents', 'all')),
  format TEXT NOT NULL CHECK (format IN ('csv', 'json')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
  
  -- Data selection filters
  filters JSONB DEFAULT '{}'::jsonb, -- Store agent_ids, date ranges, status filters, etc.
  
  -- Export metadata
  file_name TEXT,
  file_size_bytes BIGINT,
  download_url TEXT, -- Signed URL (temporary)
  download_url_expires_at TIMESTAMPTZ,
  
  -- Error handling
  error_message TEXT,
  error_details JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT exports_data_type_not_empty CHECK (length(trim(data_type)) > 0),
  CONSTRAINT exports_format_not_empty CHECK (length(trim(format)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS exports_user_id_idx ON exports(user_id);
CREATE INDEX IF NOT EXISTS exports_status_idx ON exports(status);
CREATE INDEX IF NOT EXISTS exports_created_at_idx ON exports(created_at DESC);
CREATE INDEX IF NOT EXISTS exports_data_type_idx ON exports(data_type);
CREATE INDEX IF NOT EXISTS exports_download_url_expires_at_idx ON exports(download_url_expires_at) WHERE download_url_expires_at IS NOT NULL;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_exports_updated_at ON exports;
CREATE TRIGGER update_exports_updated_at
  BEFORE UPDATE ON exports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own exports
CREATE POLICY "exports_select_own"
  ON exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "exports_insert_own"
  ON exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "exports_update_own"
  ON exports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "exports_delete_own"
  ON exports FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE exports IS 'Tracks export requests for session and agent data';
COMMENT ON COLUMN exports.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN exports.user_id IS 'Owner of this export (references auth.users)';
COMMENT ON COLUMN exports.data_type IS 'Type of data to export: sessions, agents, or all';
COMMENT ON COLUMN exports.format IS 'Export format: csv or json';
COMMENT ON COLUMN exports.status IS 'Export status: pending, processing, completed, failed, or expired';
COMMENT ON COLUMN exports.filters IS 'JSONB object storing export filters (agent_ids, date ranges, status, etc.)';
COMMENT ON COLUMN exports.download_url IS 'Temporary signed URL for downloading the export file';
COMMENT ON COLUMN exports.download_url_expires_at IS 'Timestamp when the download URL expires';

-- =====================================================
-- TABLE: export_schedules
-- Purpose: Store recurring export schedules
-- =====================================================
CREATE TABLE IF NOT EXISTS export_schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Schedule configuration
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true NOT NULL,
  
  -- Export configuration
  data_type TEXT NOT NULL CHECK (data_type IN ('sessions', 'agents', 'all')),
  format TEXT NOT NULL CHECK (format IN ('csv', 'json')),
  
  -- Data selection filters
  filters JSONB DEFAULT '{}'::jsonb, -- Store agent_ids, date ranges, status filters, etc.
  
  -- Schedule frequency
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  frequency_config JSONB DEFAULT '{}'::jsonb, -- For custom schedules (cron expression, timezone, etc.)
  
  -- Delivery configuration
  delivery_method TEXT DEFAULT 'download' CHECK (delivery_method IN ('download', 'webhook', 'both')),
  webhook_url TEXT,
  webhook_headers JSONB DEFAULT '{}'::jsonb,
  webhook_auth_type TEXT CHECK (webhook_auth_type IN ('none', 'bearer', 'basic', 'custom')),
  webhook_auth_config JSONB DEFAULT '{}'::jsonb,
  
  -- Schedule tracking
  last_run_at TIMESTAMPTZ,
  last_run_status TEXT CHECK (last_run_status IN ('success', 'failed', 'skipped')),
  next_run_at TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0 NOT NULL,
  failure_count INTEGER DEFAULT 0 NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT export_schedules_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT export_schedules_data_type_not_empty CHECK (length(trim(data_type)) > 0),
  CONSTRAINT export_schedules_format_not_empty CHECK (length(trim(format)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS export_schedules_user_id_idx ON export_schedules(user_id);
CREATE INDEX IF NOT EXISTS export_schedules_enabled_idx ON export_schedules(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS export_schedules_next_run_at_idx ON export_schedules(next_run_at) WHERE enabled = true AND next_run_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS export_schedules_created_at_idx ON export_schedules(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_export_schedules_updated_at ON export_schedules;
CREATE TRIGGER update_export_schedules_updated_at
  BEFORE UPDATE ON export_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE export_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own schedules
CREATE POLICY "export_schedules_select_own"
  ON export_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "export_schedules_insert_own"
  ON export_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "export_schedules_update_own"
  ON export_schedules FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "export_schedules_delete_own"
  ON export_schedules FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE export_schedules IS 'Stores recurring export schedule configurations';
COMMENT ON COLUMN export_schedules.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN export_schedules.user_id IS 'Owner of this schedule (references auth.users)';
COMMENT ON COLUMN export_schedules.name IS 'Human-readable name for the schedule';
COMMENT ON COLUMN export_schedules.enabled IS 'Whether the schedule is active';
COMMENT ON COLUMN export_schedules.data_type IS 'Type of data to export: sessions, agents, or all';
COMMENT ON COLUMN export_schedules.format IS 'Export format: csv or json';
COMMENT ON COLUMN export_schedules.frequency IS 'How often to run: daily, weekly, monthly, or custom';
COMMENT ON COLUMN export_schedules.frequency_config IS 'JSONB object for custom schedule configuration (cron, timezone, etc.)';
COMMENT ON COLUMN export_schedules.delivery_method IS 'How to deliver: download link, webhook, or both';
COMMENT ON COLUMN export_schedules.next_run_at IS 'When the schedule should run next';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS export_schedules CASCADE;
-- DROP TABLE IF EXISTS exports CASCADE;
