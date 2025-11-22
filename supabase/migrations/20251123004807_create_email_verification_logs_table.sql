-- =====================================================
-- Migration: Create Email Verification Logs Table
-- Created: 2025-11-23T00:48:07Z
-- Tables: email_verification_logs
-- Purpose: Track email verification attempts for audit and analytics
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: email_verification_logs
-- Purpose: Track email verification attempts, resends, and outcomes
-- =====================================================
CREATE TABLE IF NOT EXISTS email_verification_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core fields
  email TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('verification_sent', 'verification_attempted', 'verification_success', 'verification_failed', 'resend_requested')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending', 'expired')),
  
  -- Token and metadata
  token_hash TEXT, -- Hashed token for security (optional, for custom tokens)
  ip_address INET,
  user_agent TEXT,
  
  -- Error details (if applicable)
  error_message TEXT,
  error_code TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ, -- When the verification link expires
  
  -- Constraints
  CONSTRAINT email_verification_logs_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS email_verification_logs_user_id_idx ON email_verification_logs(user_id);
CREATE INDEX IF NOT EXISTS email_verification_logs_email_idx ON email_verification_logs(email);
CREATE INDEX IF NOT EXISTS email_verification_logs_status_idx ON email_verification_logs(status);
CREATE INDEX IF NOT EXISTS email_verification_logs_action_idx ON email_verification_logs(action);
CREATE INDEX IF NOT EXISTS email_verification_logs_created_at_idx ON email_verification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS email_verification_logs_user_status_idx ON email_verification_logs(user_id, status) WHERE status IN ('pending', 'failed');

-- Enable Row Level Security
ALTER TABLE email_verification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own verification logs
CREATE POLICY "email_verification_logs_select_own"
  ON email_verification_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "email_verification_logs_insert_own"
  ON email_verification_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all logs (for support purposes)
-- Note: This requires an admin role check function - adjust based on your RBAC setup
CREATE POLICY "email_verification_logs_select_admin"
  ON email_verification_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role')::text = 'admin'
    )
  );

-- Documentation
COMMENT ON TABLE email_verification_logs IS 'Tracks email verification attempts, resends, and outcomes for audit and analytics';
COMMENT ON COLUMN email_verification_logs.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN email_verification_logs.user_id IS 'User who initiated the verification (references auth.users)';
COMMENT ON COLUMN email_verification_logs.email IS 'Email address being verified';
COMMENT ON COLUMN email_verification_logs.action IS 'Type of action: verification_sent, verification_attempted, verification_success, verification_failed, resend_requested';
COMMENT ON COLUMN email_verification_logs.status IS 'Current status: success, failed, pending, expired';
COMMENT ON COLUMN email_verification_logs.token_hash IS 'Hashed verification token (for custom token implementations)';
COMMENT ON COLUMN email_verification_logs.ip_address IS 'IP address of the request';
COMMENT ON COLUMN email_verification_logs.user_agent IS 'User agent string from the request';
COMMENT ON COLUMN email_verification_logs.error_message IS 'Error message if verification failed';
COMMENT ON COLUMN email_verification_logs.error_code IS 'Error code for programmatic error handling';
COMMENT ON COLUMN email_verification_logs.expires_at IS 'When the verification link expires (typically 24 hours from creation)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS email_verification_logs CASCADE;
