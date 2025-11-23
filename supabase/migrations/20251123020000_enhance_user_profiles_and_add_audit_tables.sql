-- =====================================================
-- Migration: Enhance User Profiles and Add Audit Tables
-- Created: 2025-11-23T02:00:00Z
-- Tables: user_profiles (update), avatars, audit_logs, soft_deletes
-- Purpose: Add contact_number, backup_codes to profiles and create audit/avatar/soft-delete tables
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- UPDATE: user_profiles table
-- Add contact_number and backup_codes columns
-- =====================================================
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS contact_number TEXT,
  ADD COLUMN IF NOT EXISTS backup_codes TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add index for contact_number if it doesn't exist
CREATE INDEX IF NOT EXISTS user_profiles_contact_number_idx ON user_profiles(contact_number) WHERE contact_number IS NOT NULL;

-- =====================================================
-- TABLE: avatars
-- Purpose: Track avatar uploads and versions
-- =====================================================
CREATE TABLE IF NOT EXISTS avatars (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- File information
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'avatars' NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  -- Timestamps
  upload_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT avatars_file_path_not_empty CHECK (length(trim(file_path)) > 0),
  CONSTRAINT avatars_file_name_not_empty CHECK (length(trim(file_name)) > 0)
);

-- Performance indexes for avatars
CREATE INDEX IF NOT EXISTS avatars_user_id_idx ON avatars(user_id);
CREATE INDEX IF NOT EXISTS avatars_active_idx ON avatars(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS avatars_upload_date_idx ON avatars(upload_date DESC);

-- Auto-update trigger for avatars
DROP TRIGGER IF EXISTS update_avatars_updated_at ON avatars;
CREATE TRIGGER update_avatars_updated_at
  BEFORE UPDATE ON avatars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for avatars
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own avatars
CREATE POLICY "avatars_select_own"
  ON avatars FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "avatars_insert_own"
  ON avatars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "avatars_update_own"
  ON avatars FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "avatars_delete_own"
  ON avatars FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: audit_logs
-- Purpose: Track all profile changes and significant actions
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Action information
  action_type TEXT NOT NULL CHECK (action_type IN (
    'profile_update',
    'password_change',
    '2fa_enabled',
    '2fa_disabled',
    'avatar_upload',
    'avatar_delete',
    'session_terminated',
    'logout_everywhere',
    'data_export',
    'account_deletion_requested',
    'account_restored'
  )),
  action_details JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT audit_logs_action_type_not_empty CHECK (length(trim(action_type)) > 0)
);

-- Performance indexes for audit_logs
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_type_idx ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS audit_logs_timestamp_idx ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS audit_logs_user_action_idx ON audit_logs(user_id, action_type, timestamp DESC);

-- Enable Row Level Security for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own audit logs, admins can access all
CREATE POLICY "audit_logs_select_own"
  ON audit_logs FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "audit_logs_insert_own"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TABLE: soft_deletes
-- Purpose: Track account deletion requests with restore capability
-- =====================================================
CREATE TABLE IF NOT EXISTS soft_deletes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Deletion information
  deletion_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  restore_token TEXT NOT NULL UNIQUE,
  deletion_reason TEXT,
  
  -- Status
  is_restored BOOLEAN DEFAULT false NOT NULL,
  restored_at TIMESTAMPTZ,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days') NOT NULL,
  
  -- Constraints
  CONSTRAINT soft_deletes_restore_token_not_empty CHECK (length(trim(restore_token)) > 0)
);

-- Performance indexes for soft_deletes
CREATE INDEX IF NOT EXISTS soft_deletes_user_id_idx ON soft_deletes(user_id);
CREATE INDEX IF NOT EXISTS soft_deletes_restore_token_idx ON soft_deletes(restore_token);
CREATE INDEX IF NOT EXISTS soft_deletes_deletion_date_idx ON soft_deletes(deletion_date DESC);
CREATE INDEX IF NOT EXISTS soft_deletes_restored_idx ON soft_deletes(is_restored) WHERE is_restored = false;

-- Enable Row Level Security for soft_deletes
ALTER TABLE soft_deletes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own soft delete records
CREATE POLICY "soft_deletes_select_own"
  ON soft_deletes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "soft_deletes_insert_own"
  ON soft_deletes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "soft_deletes_update_own"
  ON soft_deletes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTION: Create audit log entry
-- Purpose: Helper function to create audit log entries
-- =====================================================
CREATE OR REPLACE FUNCTION create_audit_log(
  p_user_id UUID,
  p_action_type TEXT,
  p_action_details JSONB DEFAULT '{}'::jsonb,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action_type,
    action_details,
    ip_address,
    user_agent
  )
  VALUES (
    p_user_id,
    p_action_type,
    p_action_details,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Generate restore token
-- Purpose: Generate a secure restore token for account recovery
-- =====================================================
CREATE OR REPLACE FUNCTION generate_restore_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Documentation
COMMENT ON TABLE avatars IS 'Avatar uploads and versions for user profiles';
COMMENT ON TABLE audit_logs IS 'Audit trail for all profile changes and security actions';
COMMENT ON TABLE soft_deletes IS 'Soft delete records for account deletion with restore capability';
COMMENT ON COLUMN user_profiles.contact_number IS 'User contact phone number';
COMMENT ON COLUMN user_profiles.backup_codes IS 'Array of backup codes for 2FA recovery';
COMMENT ON COLUMN avatars.file_path IS 'Path to file in storage bucket';
COMMENT ON COLUMN audit_logs.action_type IS 'Type of action being logged';
COMMENT ON COLUMN soft_deletes.restore_token IS 'Secure token for account restoration (valid for 30 days)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP FUNCTION IF EXISTS generate_restore_token();
-- DROP FUNCTION IF EXISTS create_audit_log(UUID, TEXT, JSONB, INET, TEXT);
-- DROP TABLE IF EXISTS soft_deletes CASCADE;
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS avatars CASCADE;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS backup_codes;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS contact_number;
