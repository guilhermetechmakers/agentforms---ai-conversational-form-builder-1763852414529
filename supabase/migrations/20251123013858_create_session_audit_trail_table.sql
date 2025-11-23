-- =====================================================
-- Migration: Create Session Audit Trail Table
-- Created: 2025-11-23T01:38:58Z
-- Tables: session_audit_trail
-- Purpose: Track all actions taken on sessions for audit purposes
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: session_audit_trail
-- Purpose: Track all actions taken on sessions (export, redact, resend webhook, mark reviewed, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS session_audit_trail (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  
  -- Actor information
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Action details
  action TEXT NOT NULL CHECK (action IN (
    'exported',
    'redacted_pii',
    'webhook_resent',
    'marked_reviewed',
    'field_updated',
    'session_deleted',
    'viewed'
  )),
  
  -- Action metadata
  action_details JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS session_audit_trail_session_id_idx ON session_audit_trail(session_id);
CREATE INDEX IF NOT EXISTS session_audit_trail_user_id_idx ON session_audit_trail(user_id);
CREATE INDEX IF NOT EXISTS session_audit_trail_action_idx ON session_audit_trail(action);
CREATE INDEX IF NOT EXISTS session_audit_trail_created_at_idx ON session_audit_trail(created_at DESC);

-- Enable Row Level Security
ALTER TABLE session_audit_trail ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Agent owners can see audit trail for their sessions
CREATE POLICY "session_audit_trail_select_agent_owner"
  ON session_audit_trail FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN agents ON agents.id = sessions.agent_id
      WHERE sessions.id = session_audit_trail.session_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "session_audit_trail_insert_agent_owner"
  ON session_audit_trail FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN agents ON agents.id = sessions.agent_id
      WHERE sessions.id = session_audit_trail.session_id
      AND agents.user_id = auth.uid()
    )
  );

-- Documentation
COMMENT ON TABLE session_audit_trail IS 'Audit trail of all actions taken on sessions';
COMMENT ON COLUMN session_audit_trail.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN session_audit_trail.session_id IS 'Session this audit entry belongs to';
COMMENT ON COLUMN session_audit_trail.user_id IS 'User who performed the action';
COMMENT ON COLUMN session_audit_trail.action IS 'Type of action performed';
COMMENT ON COLUMN session_audit_trail.action_details IS 'Additional details about the action (JSONB)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS session_audit_trail CASCADE;
