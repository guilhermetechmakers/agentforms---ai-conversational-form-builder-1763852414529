-- =====================================================
-- Migration: Add Soft Delete and Enhanced Search to Sessions
-- Created: 2025-11-23T02:20:12Z
-- Tables: sessions, messages, field_values
-- Purpose: Add soft-delete support and full-text search capabilities for session management
-- =====================================================

-- Enable required extensions (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For trigram similarity search

-- =====================================================
-- ADD SOFT DELETE SUPPORT TO SESSIONS
-- =====================================================

-- Add soft-delete columns to sessions table
ALTER TABLE sessions 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for soft-delete queries (only non-deleted sessions)
CREATE INDEX IF NOT EXISTS sessions_deleted_at_idx ON sessions(deleted_at) WHERE deleted_at IS NULL;

-- Update existing indexes to exclude deleted sessions
DROP INDEX IF EXISTS sessions_status_idx;
CREATE INDEX IF NOT EXISTS sessions_status_idx ON sessions(status) WHERE deleted_at IS NULL;

DROP INDEX IF EXISTS sessions_started_at_idx;
CREATE INDEX IF NOT EXISTS sessions_started_at_idx ON sessions(started_at DESC) WHERE deleted_at IS NULL;

-- =====================================================
-- ENHANCE SEARCH CAPABILITIES
-- =====================================================

-- Add GIN index for full-text search on visitor_metadata
CREATE INDEX IF NOT EXISTS sessions_visitor_metadata_gin_idx ON sessions USING GIN (visitor_metadata jsonb_path_ops);

-- Add index for searching in field values (via field_key)
CREATE INDEX IF NOT EXISTS field_values_field_key_trgm_idx ON field_values USING GIN (field_key gin_trgm_ops);

-- Add index for searching in message content
CREATE INDEX IF NOT EXISTS messages_content_trgm_idx ON messages USING GIN (content gin_trgm_ops);

-- =====================================================
-- UPDATE RLS POLICIES FOR SOFT DELETE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "sessions_select_agent_owner" ON sessions;
DROP POLICY IF EXISTS "sessions_update_agent_owner" ON sessions;

-- Recreate policies that exclude soft-deleted sessions by default
CREATE POLICY "sessions_select_agent_owner"
  ON sessions FOR SELECT
  USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = sessions.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "sessions_update_agent_owner"
  ON sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = sessions.agent_id 
      AND agents.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = sessions.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

-- Add policy for soft-delete (marking as deleted)
CREATE POLICY "sessions_soft_delete_agent_owner"
  ON sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = sessions.agent_id 
      AND agents.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = sessions.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

-- =====================================================
-- HELPER FUNCTION: Soft Delete Session
-- =====================================================

CREATE OR REPLACE FUNCTION soft_delete_session(session_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE sessions
  SET 
    deleted_at = NOW(),
    deleted_by = auth.uid()
  WHERE id = session_uuid
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = sessions.agent_id 
      AND agents.user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HELPER FUNCTION: Restore Soft-Deleted Session
-- =====================================================

CREATE OR REPLACE FUNCTION restore_session(session_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE sessions
  SET 
    deleted_at = NULL,
    deleted_by = NULL
  WHERE id = session_uuid
    AND deleted_at IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = sessions.agent_id 
      AND agents.user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HELPER FUNCTION: Full-Text Search Sessions
-- =====================================================

CREATE OR REPLACE FUNCTION search_sessions(
  search_text TEXT,
  agent_uuid UUID DEFAULT NULL,
  status_filter TEXT DEFAULT NULL,
  date_from TIMESTAMPTZ DEFAULT NULL,
  date_to TIMESTAMPTZ DEFAULT NULL,
  include_deleted BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  agent_id UUID,
  visitor_id UUID,
  status TEXT,
  visitor_metadata JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.agent_id,
    s.visitor_id,
    s.status,
    s.visitor_metadata,
    s.started_at,
    s.completed_at,
    s.created_at,
    s.updated_at,
    s.deleted_at,
    s.deleted_by,
    -- Calculate relevance score
    CASE 
      WHEN search_text IS NULL OR search_text = '' THEN 1.0
      ELSE (
        -- Search in session ID
        CASE WHEN s.id::TEXT ILIKE '%' || search_text || '%' THEN 2.0 ELSE 0.0 END +
        -- Search in visitor metadata
        CASE WHEN s.visitor_metadata::TEXT ILIKE '%' || search_text || '%' THEN 1.5 ELSE 0.0 END +
        -- Search in field values (via subquery)
        COALESCE((
          SELECT COUNT(*) * 1.0
          FROM field_values fv
          WHERE fv.session_id = s.id
            AND (
              fv.field_key ILIKE '%' || search_text || '%'
              OR fv.value::TEXT ILIKE '%' || search_text || '%'
            )
        ), 0.0) +
        -- Search in messages
        COALESCE((
          SELECT COUNT(*) * 0.5
          FROM messages m
          WHERE m.session_id = s.id
            AND m.content ILIKE '%' || search_text || '%'
        ), 0.0)
      ) / 4.0
    END AS relevance
  FROM sessions s
  WHERE 
    (include_deleted OR s.deleted_at IS NULL)
    AND (agent_uuid IS NULL OR s.agent_id = agent_uuid)
    AND (status_filter IS NULL OR s.status = status_filter)
    AND (date_from IS NULL OR s.started_at >= date_from)
    AND (date_to IS NULL OR s.started_at <= date_to)
    AND EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = s.agent_id 
      AND agents.user_id = auth.uid()
    )
    AND (
      search_text IS NULL 
      OR search_text = ''
      OR s.id::TEXT ILIKE '%' || search_text || '%'
      OR s.visitor_metadata::TEXT ILIKE '%' || search_text || '%'
      OR EXISTS (
        SELECT 1 FROM field_values fv
        WHERE fv.session_id = s.id
          AND (
            fv.field_key ILIKE '%' || search_text || '%'
            OR fv.value::TEXT ILIKE '%' || search_text || '%'
          )
      )
      OR EXISTS (
        SELECT 1 FROM messages m
        WHERE m.session_id = s.id
          AND m.content ILIKE '%' || search_text || '%'
      )
    )
  ORDER BY relevance DESC, s.started_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- UPDATE AUDIT TRAIL FOR SOFT DELETE
-- =====================================================

-- Ensure session_deleted action exists in audit trail
-- (Already exists in the audit trail table, but we'll add a trigger)

CREATE OR REPLACE FUNCTION log_session_soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    INSERT INTO session_audit_trail (
      session_id,
      user_id,
      action,
      action_details,
      description
    ) VALUES (
      NEW.id,
      NEW.deleted_by,
      'session_deleted',
      jsonb_build_object(
        'deleted_at', NEW.deleted_at,
        'soft_delete', true
      ),
      'Session soft-deleted'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for soft-delete logging
DROP TRIGGER IF EXISTS log_session_soft_delete_trigger ON sessions;
CREATE TRIGGER log_session_soft_delete_trigger
  AFTER UPDATE ON sessions
  FOR EACH ROW
  WHEN (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL)
  EXECUTE FUNCTION log_session_soft_delete();

-- =====================================================
-- DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN sessions.deleted_at IS 'Timestamp when session was soft-deleted (NULL if active)';
COMMENT ON COLUMN sessions.deleted_by IS 'User who soft-deleted the session';
COMMENT ON FUNCTION soft_delete_session(UUID) IS 'Soft-delete a session (sets deleted_at timestamp)';
COMMENT ON FUNCTION restore_session(UUID) IS 'Restore a soft-deleted session';
COMMENT ON FUNCTION search_sessions(TEXT, UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, BOOLEAN) IS 'Full-text search across sessions, field values, and messages with relevance scoring';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TRIGGER IF EXISTS log_session_soft_delete_trigger ON sessions;
-- DROP FUNCTION IF EXISTS log_session_soft_delete();
-- DROP FUNCTION IF EXISTS search_sessions(TEXT, UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, BOOLEAN);
-- DROP FUNCTION IF EXISTS restore_session(UUID);
-- DROP FUNCTION IF EXISTS soft_delete_session(UUID);
-- DROP INDEX IF EXISTS messages_content_trgm_idx;
-- DROP INDEX IF EXISTS field_values_field_key_trgm_idx;
-- DROP INDEX IF EXISTS sessions_visitor_metadata_gin_idx;
-- DROP INDEX IF EXISTS sessions_started_at_idx;
-- DROP INDEX IF EXISTS sessions_status_idx;
-- DROP INDEX IF EXISTS sessions_deleted_at_idx;
-- DROP POLICY IF EXISTS sessions_soft_delete_agent_owner ON sessions;
-- DROP POLICY IF EXISTS sessions_update_agent_owner ON sessions;
-- DROP POLICY IF EXISTS sessions_select_agent_owner ON sessions;
-- ALTER TABLE sessions DROP COLUMN IF EXISTS deleted_by;
-- ALTER TABLE sessions DROP COLUMN IF EXISTS deleted_at;
