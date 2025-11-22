-- =====================================================
-- Migration: Create Error Reports Table
-- Created: 2025-11-23T00:22:00Z
-- Tables: error_reports
-- Purpose: Store error reports from users when they encounter server errors
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
-- TABLE: error_reports
-- Purpose: Store user-submitted error reports with session context
-- =====================================================
CREATE TABLE IF NOT EXISTS error_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  error_description TEXT,
  user_comments TEXT,
  error_type TEXT DEFAULT 'server_error' CHECK (error_type IN ('server_error', 'client_error', 'validation_error', 'other')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT error_reports_description_or_comments CHECK (
    error_description IS NOT NULL OR user_comments IS NOT NULL
  )
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS error_reports_user_id_idx ON error_reports(user_id);
CREATE INDEX IF NOT EXISTS error_reports_session_id_idx ON error_reports(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS error_reports_status_idx ON error_reports(status);
CREATE INDEX IF NOT EXISTS error_reports_error_type_idx ON error_reports(error_type);
CREATE INDEX IF NOT EXISTS error_reports_created_at_idx ON error_reports(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_error_reports_updated_at ON error_reports;
CREATE TRIGGER update_error_reports_updated_at
  BEFORE UPDATE ON error_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own error reports
CREATE POLICY "error_reports_select_own"
  ON error_reports FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "error_reports_insert_own"
  ON error_reports FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR 
    (user_id IS NULL)
  );

CREATE POLICY "error_reports_update_own"
  ON error_reports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin can access all error reports (will be managed via service role)
CREATE POLICY "error_reports_admin_all"
  ON error_reports FOR ALL
  USING (false)
  WITH CHECK (false); -- Disabled by default, use service role

-- Documentation
COMMENT ON TABLE error_reports IS 'User-submitted error reports for server errors and issues';
COMMENT ON COLUMN error_reports.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN error_reports.user_id IS 'User who reported the error (nullable for anonymous reports)';
COMMENT ON COLUMN error_reports.session_id IS 'Session ID captured at time of error for context';
COMMENT ON COLUMN error_reports.error_description IS 'System-generated error description';
COMMENT ON COLUMN error_reports.user_comments IS 'User-provided additional comments about the error';
COMMENT ON COLUMN error_reports.error_type IS 'Type of error that occurred';
COMMENT ON COLUMN error_reports.status IS 'Status of the error report investigation';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS error_reports CASCADE;
