-- =====================================================
-- Migration: Create Encryption Settings Table
-- Created: 2025-11-23T02:39:32Z
-- Tables: encryption_settings
-- Purpose: Store encryption configuration for data at rest and in transit
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
-- TABLE: encryption_settings
-- Purpose: Store encryption configuration per user/organization
-- =====================================================
CREATE TABLE IF NOT EXISTS encryption_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Encryption at rest
  encryption_at_rest_enabled BOOLEAN DEFAULT true NOT NULL,
  encryption_at_rest_algorithm TEXT DEFAULT 'AES-256-GCM' CHECK (encryption_at_rest_algorithm IN ('AES-256-GCM', 'AES-256-CBC', 'ChaCha20-Poly1305')) NOT NULL,
  encryption_at_rest_key_rotation_days INTEGER DEFAULT 90 CHECK (encryption_at_rest_key_rotation_days > 0),
  last_key_rotation_at TIMESTAMPTZ,
  
  -- Encryption in transit (TLS)
  tls_enabled BOOLEAN DEFAULT true NOT NULL,
  tls_min_version TEXT DEFAULT 'TLSv1.2' CHECK (tls_min_version IN ('TLSv1.0', 'TLSv1.1', 'TLSv1.2', 'TLSv1.3')) NOT NULL,
  tls_certificate_expiry_check BOOLEAN DEFAULT true NOT NULL,
  last_tls_check_at TIMESTAMPTZ,
  
  -- Field-level encryption
  field_level_encryption_enabled BOOLEAN DEFAULT false NOT NULL,
  encrypted_fields JSONB DEFAULT '[]'::jsonb, -- Array of field keys to encrypt
  
  -- Compliance status
  compliance_status TEXT DEFAULT 'compliant' CHECK (compliance_status IN ('compliant', 'warning', 'non-compliant')) NOT NULL,
  compliance_notes TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraint: one setting per user
  UNIQUE(user_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS encryption_settings_user_id_idx ON encryption_settings(user_id);
CREATE INDEX IF NOT EXISTS encryption_settings_compliance_status_idx ON encryption_settings(compliance_status);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_encryption_settings_updated_at ON encryption_settings;
CREATE TRIGGER update_encryption_settings_updated_at
  BEFORE UPDATE ON encryption_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE encryption_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own settings
CREATE POLICY "encryption_settings_select_own"
  ON encryption_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "encryption_settings_insert_own"
  ON encryption_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "encryption_settings_update_own"
  ON encryption_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE encryption_settings IS 'Encryption configuration for data at rest and in transit per user';
COMMENT ON COLUMN encryption_settings.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN encryption_settings.user_id IS 'Owner of this record (references auth.users)';
COMMENT ON COLUMN encryption_settings.encryption_at_rest_enabled IS 'Whether encryption at rest is enabled';
COMMENT ON COLUMN encryption_settings.tls_enabled IS 'Whether TLS encryption in transit is enabled';
COMMENT ON COLUMN encryption_settings.compliance_status IS 'Current compliance status (compliant, warning, non-compliant)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS encryption_settings CASCADE;
