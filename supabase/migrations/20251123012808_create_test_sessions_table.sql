-- =====================================================
-- Migration: Create Test Sessions Table
-- Created: 2025-11-23T01:28:08Z
-- Tables: test_sessions
-- Purpose: Store test sessions for Agent Sandbox testing environment
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
-- TABLE: test_sessions
-- Purpose: Store test sessions created in Agent Sandbox for testing and validation
-- =====================================================
CREATE TABLE IF NOT EXISTS test_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  
  -- Session data
  name TEXT,
  conversation_log JSONB DEFAULT '[]'::jsonb NOT NULL,
  collected_fields JSONB DEFAULT '{}'::jsonb NOT NULL,
  missing_fields JSONB DEFAULT '[]'::jsonb NOT NULL,
  
  -- LLM settings used during test
  llm_mode TEXT DEFAULT 'generative' CHECK (llm_mode IN ('deterministic', 'generative')),
  temperature_setting NUMERIC(3, 2) DEFAULT 0.7 CHECK (temperature_setting >= 0 AND temperature_setting <= 2),
  
  -- Validation and errors
  errors JSONB DEFAULT '[]'::jsonb,
  suggestions JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT test_sessions_temperature_range CHECK (temperature_setting >= 0 AND temperature_setting <= 2)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS test_sessions_user_id_idx ON test_sessions(user_id);
CREATE INDEX IF NOT EXISTS test_sessions_agent_id_idx ON test_sessions(agent_id);
CREATE INDEX IF NOT EXISTS test_sessions_created_at_idx ON test_sessions(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_test_sessions_updated_at ON test_sessions;
CREATE TRIGGER update_test_sessions_updated_at
  BEFORE UPDATE ON test_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own test sessions
CREATE POLICY "test_sessions_select_own"
  ON test_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "test_sessions_insert_own"
  ON test_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "test_sessions_update_own"
  ON test_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "test_sessions_delete_own"
  ON test_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE test_sessions IS 'Test sessions created in Agent Sandbox for testing and validation';
COMMENT ON COLUMN test_sessions.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN test_sessions.user_id IS 'Owner of this test session (references auth.users)';
COMMENT ON COLUMN test_sessions.agent_id IS 'Agent being tested (references agents)';
COMMENT ON COLUMN test_sessions.conversation_log IS 'Array of conversation messages in JSON format';
COMMENT ON COLUMN test_sessions.collected_fields IS 'Object mapping field keys to collected values';
COMMENT ON COLUMN test_sessions.missing_fields IS 'Array of field keys that are still missing';
COMMENT ON COLUMN test_sessions.llm_mode IS 'LLM mode used: deterministic or generative';
COMMENT ON COLUMN test_sessions.temperature_setting IS 'Temperature setting used (0-2)';
COMMENT ON COLUMN test_sessions.errors IS 'Array of validation errors encountered';
COMMENT ON COLUMN test_sessions.suggestions IS 'Array of improvement suggestions';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS test_sessions CASCADE;
