-- =====================================================
-- Migration: Create Agents and Sessions Tables
-- Created: 2025-11-23T00:25:46Z
-- Tables: agents, sessions, messages, field_values, visitors
-- Purpose: Foundation for AgentForms public chat system
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
-- TABLE: agents
-- Purpose: Store agent configurations (schema, persona, visuals)
-- =====================================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core fields
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  
  -- Agent configuration (JSONB for flexibility)
  schema JSONB DEFAULT '{"fields": []}'::jsonb NOT NULL,
  persona JSONB DEFAULT '{}'::jsonb,
  knowledge JSONB DEFAULT '{}'::jsonb,
  visuals JSONB DEFAULT '{}'::jsonb,
  
  -- Public URL slug (unique per user)
  public_slug TEXT,
  public_url TEXT,
  
  -- Versioning
  version INTEGER DEFAULT 1 NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT agents_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT agents_version_positive CHECK (version > 0)
);

-- Performance indexes for agents
CREATE INDEX IF NOT EXISTS agents_user_id_idx ON agents(user_id);
CREATE INDEX IF NOT EXISTS agents_status_idx ON agents(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS agents_public_slug_idx ON agents(public_slug) WHERE public_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS agents_created_at_idx ON agents(created_at DESC);

-- Auto-update trigger for agents
DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for agents
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own agents, but published agents are readable by all
CREATE POLICY "agents_select_own"
  ON agents FOR SELECT
  USING (auth.uid() = user_id OR status = 'published');

CREATE POLICY "agents_insert_own"
  ON agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agents_update_own"
  ON agents FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agents_delete_own"
  ON agents FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: visitors
-- Purpose: Track anonymous visitors (for analytics and consent)
-- =====================================================
CREATE TABLE IF NOT EXISTS visitors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Anonymous identifier (cookie/localStorage based)
  anonymous_id TEXT UNIQUE,
  
  -- Visitor metadata
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  consent_given BOOLEAN DEFAULT false,
  consent_given_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes for visitors
CREATE INDEX IF NOT EXISTS visitors_anonymous_id_idx ON visitors(anonymous_id);
CREATE INDEX IF NOT EXISTS visitors_created_at_idx ON visitors(created_at DESC);

-- Auto-update trigger for visitors
DROP TRIGGER IF EXISTS update_visitors_updated_at ON visitors;
CREATE TRIGGER update_visitors_updated_at
  BEFORE UPDATE ON visitors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Visitors table is public (no RLS) - anonymous data only

-- =====================================================
-- TABLE: sessions
-- Purpose: Track chat sessions between visitors and agents
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
  
  -- Session status
  status TEXT DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'abandoned')),
  
  -- Visitor metadata (stored at session creation)
  visitor_metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes for sessions
CREATE INDEX IF NOT EXISTS sessions_agent_id_idx ON sessions(agent_id);
CREATE INDEX IF NOT EXISTS sessions_visitor_id_idx ON sessions(visitor_id);
CREATE INDEX IF NOT EXISTS sessions_status_idx ON sessions(status);
CREATE INDEX IF NOT EXISTS sessions_started_at_idx ON sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON sessions(created_at DESC);

-- Auto-update trigger for sessions
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Agent owners can see all sessions for their agents, visitors can see their own
CREATE POLICY "sessions_select_agent_owner"
  ON sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = sessions.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "sessions_insert_public"
  ON sessions FOR INSERT
  WITH CHECK (true); -- Public sessions can be created by anyone

CREATE POLICY "sessions_update_agent_owner"
  ON sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM agents 
      WHERE agents.id = sessions.agent_id 
      AND agents.user_id = auth.uid()
    )
  );

-- =====================================================
-- TABLE: messages
-- Purpose: Store chat messages between agent and visitor
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  
  -- Message content
  role TEXT NOT NULL CHECK (role IN ('agent', 'visitor')),
  content TEXT NOT NULL,
  
  -- Field collection (if message collected a field value)
  field_key TEXT,
  
  -- Attachment support
  attachment_url TEXT,
  attachment_type TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes for messages
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON messages(session_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at ASC);
CREATE INDEX IF NOT EXISTS messages_field_key_idx ON messages(field_key) WHERE field_key IS NOT NULL;

-- Enable Row Level Security for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Same as sessions - agent owners and session participants
CREATE POLICY "messages_select_agent_owner"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN agents ON agents.id = sessions.agent_id
      WHERE sessions.id = messages.session_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert_public"
  ON messages FOR INSERT
  WITH CHECK (true); -- Public messages can be created by anyone

-- =====================================================
-- TABLE: field_values
-- Purpose: Store collected field values from conversations
-- =====================================================
CREATE TABLE IF NOT EXISTS field_values (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  
  -- Field information
  field_key TEXT NOT NULL,
  value JSONB NOT NULL, -- Flexible: string, number, array, etc.
  
  -- Validation status
  validated BOOLEAN DEFAULT false,
  validation_error TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraint: one value per field per session
  UNIQUE(session_id, field_key)
);

-- Performance indexes for field_values
CREATE INDEX IF NOT EXISTS field_values_session_id_idx ON field_values(session_id);
CREATE INDEX IF NOT EXISTS field_values_field_key_idx ON field_values(field_key);
CREATE INDEX IF NOT EXISTS field_values_validated_idx ON field_values(validated);

-- Auto-update trigger for field_values
DROP TRIGGER IF EXISTS update_field_values_updated_at ON field_values;
CREATE TRIGGER update_field_values_updated_at
  BEFORE UPDATE ON field_values
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for field_values
ALTER TABLE field_values ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Same as sessions
CREATE POLICY "field_values_select_agent_owner"
  ON field_values FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN agents ON agents.id = sessions.agent_id
      WHERE sessions.id = field_values.session_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "field_values_insert_public"
  ON field_values FOR INSERT
  WITH CHECK (true);

CREATE POLICY "field_values_update_agent_owner"
  ON field_values FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      JOIN agents ON agents.id = sessions.agent_id
      WHERE sessions.id = field_values.session_id
      AND agents.user_id = auth.uid()
    )
  );

-- =====================================================
-- Documentation
-- =====================================================
COMMENT ON TABLE agents IS 'Agent configurations with schema, persona, and visual settings';
COMMENT ON TABLE visitors IS 'Anonymous visitor tracking for analytics and consent';
COMMENT ON TABLE sessions IS 'Chat sessions between visitors and agents';
COMMENT ON TABLE messages IS 'Individual messages in chat sessions';
COMMENT ON TABLE field_values IS 'Collected field values from conversations';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS field_values CASCADE;
-- DROP TABLE IF EXISTS messages CASCADE;
-- DROP TABLE IF EXISTS sessions CASCADE;
-- DROP TABLE IF EXISTS visitors CASCADE;
-- DROP TABLE IF EXISTS agents CASCADE;
