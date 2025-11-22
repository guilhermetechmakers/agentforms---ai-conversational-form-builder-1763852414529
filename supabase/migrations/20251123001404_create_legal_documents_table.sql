-- =====================================================
-- Migration: Create Legal Documents Table
-- Created: 2025-11-23T00:14:04Z
-- Tables: legal_documents, legal_requests
-- Purpose: Store legal documents (Privacy Policy, Terms of Service, Cookie Policy) and handle legal requests from users
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
-- TABLE: legal_documents
-- Purpose: Store versioned legal documents (Privacy Policy, Terms of Service, Cookie Policy)
-- =====================================================
CREATE TABLE IF NOT EXISTS legal_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_type TEXT NOT NULL CHECK (document_type IN ('privacy-policy', 'terms-of-service', 'cookie-policy')),
  content TEXT NOT NULL,
  version_number INTEGER DEFAULT 1 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT legal_documents_content_not_empty CHECK (length(trim(content)) > 0),
  CONSTRAINT legal_documents_version_positive CHECK (version_number > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS legal_documents_type_idx ON legal_documents(document_type);
CREATE INDEX IF NOT EXISTS legal_documents_active_idx ON legal_documents(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS legal_documents_created_at_idx ON legal_documents(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS legal_documents_active_type_idx ON legal_documents(document_type, is_active) WHERE is_active = true;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_legal_documents_updated_at ON legal_documents;
CREATE TRIGGER update_legal_documents_updated_at
  BEFORE UPDATE ON legal_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Legal documents are publicly readable
CREATE POLICY "legal_documents_select_all"
  ON legal_documents FOR SELECT
  USING (true);

-- Admin-only write access (will be managed via service role)
CREATE POLICY "legal_documents_insert_admin"
  ON legal_documents FOR INSERT
  WITH CHECK (false); -- Disabled by default, use service role

CREATE POLICY "legal_documents_update_admin"
  ON legal_documents FOR UPDATE
  USING (false)
  WITH CHECK (false); -- Disabled by default, use service role

CREATE POLICY "legal_documents_delete_admin"
  ON legal_documents FOR DELETE
  USING (false); -- Disabled by default, use service role

-- Documentation
COMMENT ON TABLE legal_documents IS 'Versioned legal documents (Privacy Policy, Terms of Service, Cookie Policy)';
COMMENT ON COLUMN legal_documents.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN legal_documents.document_type IS 'Type of legal document';
COMMENT ON COLUMN legal_documents.version_number IS 'Version number for tracking document changes';
COMMENT ON COLUMN legal_documents.is_active IS 'Whether this version is currently active';

-- =====================================================
-- TABLE: legal_requests
-- Purpose: Store user legal requests (data deletion, inquiries, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS legal_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('data-deletion', 'data-export', 'privacy-inquiry', 'other')),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'rejected')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT legal_requests_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT legal_requests_message_not_empty CHECK (length(trim(message)) > 0),
  CONSTRAINT legal_requests_email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS legal_requests_user_id_idx ON legal_requests(user_id);
CREATE INDEX IF NOT EXISTS legal_requests_email_idx ON legal_requests(email);
CREATE INDEX IF NOT EXISTS legal_requests_type_idx ON legal_requests(request_type);
CREATE INDEX IF NOT EXISTS legal_requests_status_idx ON legal_requests(status);
CREATE INDEX IF NOT EXISTS legal_requests_created_at_idx ON legal_requests(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_legal_requests_updated_at ON legal_requests;
CREATE TRIGGER update_legal_requests_updated_at
  BEFORE UPDATE ON legal_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE legal_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own requests
CREATE POLICY "legal_requests_select_own"
  ON legal_requests FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "legal_requests_insert_own"
  ON legal_requests FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR 
    (user_id IS NULL AND email IS NOT NULL)
  );

CREATE POLICY "legal_requests_update_own"
  ON legal_requests FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin can access all requests (will be managed via service role)
CREATE POLICY "legal_requests_admin_all"
  ON legal_requests FOR ALL
  USING (false)
  WITH CHECK (false); -- Disabled by default, use service role

-- Documentation
COMMENT ON TABLE legal_requests IS 'User legal requests (data deletion, export, privacy inquiries)';
COMMENT ON COLUMN legal_requests.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN legal_requests.user_id IS 'User who created the request (nullable for anonymous submissions)';
COMMENT ON COLUMN legal_requests.request_type IS 'Type of legal request';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS legal_requests CASCADE;
-- DROP TABLE IF EXISTS legal_documents CASCADE;
