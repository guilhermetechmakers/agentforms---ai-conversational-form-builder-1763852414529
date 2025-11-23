-- =====================================================
-- Migration: Create Agent Versions Table
-- Created: 2025-11-23T02:44:50Z
-- Tables: agent_versions
-- Purpose: Track version history for agents with diffs and optimistic locking
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: agent_versions
-- Purpose: Store version history for agents with full configuration snapshots
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Version metadata
  version_number INTEGER NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Full agent configuration snapshot (JSONB for flexibility)
  schema JSONB NOT NULL,
  persona JSONB DEFAULT '{}'::jsonb,
  knowledge JSONB DEFAULT '{}'::jsonb,
  visuals JSONB DEFAULT '{}'::jsonb,
  
  -- Change tracking
  change_summary TEXT, -- Human-readable summary of changes
  changes JSONB DEFAULT '{}'::jsonb, -- Structured diff of changes
  
  -- Public URL (for published versions)
  public_slug TEXT,
  public_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT agent_versions_version_positive CHECK (version_number > 0),
  CONSTRAINT agent_versions_unique_agent_version UNIQUE (agent_id, version_number)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS agent_versions_agent_id_idx ON agent_versions(agent_id);
CREATE INDEX IF NOT EXISTS agent_versions_user_id_idx ON agent_versions(user_id);
CREATE INDEX IF NOT EXISTS agent_versions_version_number_idx ON agent_versions(agent_id, version_number DESC);
CREATE INDEX IF NOT EXISTS agent_versions_status_idx ON agent_versions(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS agent_versions_created_at_idx ON agent_versions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE agent_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access versions of their own agents
CREATE POLICY "agent_versions_select_own"
  ON agent_versions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "agent_versions_insert_own"
  ON agent_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: Versions are immutable once created, so no UPDATE or DELETE policies

-- Function to create a new version from an agent
CREATE OR REPLACE FUNCTION create_agent_version(
  p_agent_id UUID,
  p_change_summary TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_version_number INTEGER;
  v_agent RECORD;
  v_version_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get agent and verify ownership
  SELECT * INTO v_agent
  FROM agents
  WHERE id = p_agent_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Agent not found or access denied';
  END IF;

  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_version_number
  FROM agent_versions
  WHERE agent_id = p_agent_id;

  -- Create version record
  INSERT INTO agent_versions (
    agent_id,
    user_id,
    version_number,
    status,
    schema,
    persona,
    knowledge,
    visuals,
    change_summary,
    public_slug,
    public_url
  )
  VALUES (
    p_agent_id,
    v_user_id,
    v_version_number,
    v_agent.status,
    v_agent.schema,
    v_agent.persona,
    v_agent.knowledge,
    v_agent.visuals,
    p_change_summary,
    v_agent.public_slug,
    v_agent.public_url
  )
  RETURNING id INTO v_version_id;

  RETURN v_version_id;
END;
$$;

-- Function to get version diff
CREATE OR REPLACE FUNCTION get_version_diff(
  p_agent_id UUID,
  p_from_version INTEGER,
  p_to_version INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_from_version RECORD;
  v_to_version RECORD;
  v_diff JSONB;
BEGIN
  -- Get versions
  SELECT * INTO v_from_version
  FROM agent_versions
  WHERE agent_id = p_agent_id AND version_number = p_from_version;

  SELECT * INTO v_to_version
  FROM agent_versions
  WHERE agent_id = p_agent_id AND version_number = p_to_version;

  IF NOT FOUND THEN
    RETURN '{}'::jsonb;
  END IF;

  -- Simple diff (can be enhanced with proper diff algorithm)
  v_diff := jsonb_build_object(
    'schema_changed', v_from_version.schema != v_to_version.schema,
    'persona_changed', v_from_version.persona != v_to_version.persona,
    'knowledge_changed', v_from_version.knowledge != v_to_version.knowledge,
    'visuals_changed', v_from_version.visuals != v_to_version.visuals
  );

  RETURN v_diff;
END;
$$;

-- Documentation
COMMENT ON TABLE agent_versions IS 'Version history for agents with full configuration snapshots';
COMMENT ON COLUMN agent_versions.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN agent_versions.agent_id IS 'Reference to the agent';
COMMENT ON COLUMN agent_versions.version_number IS 'Sequential version number for this agent';
COMMENT ON COLUMN agent_versions.schema IS 'Full schema snapshot at this version';
COMMENT ON COLUMN agent_versions.changes IS 'Structured diff of changes from previous version';
COMMENT ON FUNCTION create_agent_version IS 'Creates a new version snapshot of an agent';
COMMENT ON FUNCTION get_version_diff IS 'Returns a diff between two agent versions';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP FUNCTION IF EXISTS get_version_diff(UUID, INTEGER, INTEGER);
-- DROP FUNCTION IF EXISTS create_agent_version(UUID, TEXT);
-- DROP TABLE IF EXISTS agent_versions CASCADE;
