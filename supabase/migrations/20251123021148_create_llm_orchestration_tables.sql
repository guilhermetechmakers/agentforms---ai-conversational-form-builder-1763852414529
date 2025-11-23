-- =====================================================
-- Migration: Create LLM Orchestration Tables
-- Created: 2025-11-23T02:11:48Z
-- Tables: prompts, responses, usage_logs
-- Purpose: Support LLM orchestration with prompt construction, response caching, and usage tracking
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
-- TABLE: prompts
-- Purpose: Store constructed prompts with persona, knowledge, and schema data
-- =====================================================
CREATE TABLE IF NOT EXISTS prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Prompt construction data
  persona_data JSONB DEFAULT '{}'::jsonb NOT NULL,
  knowledge_data JSONB DEFAULT '{}'::jsonb NOT NULL,
  schema_data JSONB DEFAULT '{}'::jsonb NOT NULL,
  
  -- Constructed prompt text (for reference)
  prompt_text TEXT,
  
  -- Context metadata
  conversation_history JSONB DEFAULT '[]'::jsonb,
  remaining_fields JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT prompts_persona_data_not_null CHECK (persona_data IS NOT NULL),
  CONSTRAINT prompts_knowledge_data_not_null CHECK (knowledge_data IS NOT NULL),
  CONSTRAINT prompts_schema_data_not_null CHECK (schema_data IS NOT NULL)
);

-- Performance indexes for prompts
CREATE INDEX IF NOT EXISTS prompts_user_id_idx ON prompts(user_id);
CREATE INDEX IF NOT EXISTS prompts_agent_id_idx ON prompts(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS prompts_created_at_idx ON prompts(created_at DESC);

-- Auto-update trigger for prompts
DROP TRIGGER IF EXISTS update_prompts_updated_at ON prompts;
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for prompts
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own prompts
CREATE POLICY "prompts_select_own"
  ON prompts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "prompts_insert_own"
  ON prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "prompts_update_own"
  ON prompts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "prompts_delete_own"
  ON prompts FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: responses
-- Purpose: Store LLM responses with provider info and caching flags
-- =====================================================
CREATE TABLE IF NOT EXISTS responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  
  -- LLM provider information
  llm_provider TEXT NOT NULL CHECK (llm_provider IN ('openai', 'anthropic', 'google', 'custom')),
  model_name TEXT,
  
  -- Response data
  response_text TEXT NOT NULL,
  response_data JSONB DEFAULT '{}'::jsonb,
  
  -- Caching
  cached_flag BOOLEAN DEFAULT false NOT NULL,
  cache_key TEXT,
  cache_expires_at TIMESTAMPTZ,
  
  -- Token usage (for cost tracking)
  tokens_used INTEGER,
  tokens_input INTEGER,
  tokens_output INTEGER,
  
  -- Metadata
  temperature DECIMAL(3, 2),
  deterministic_mode BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT responses_llm_provider_not_empty CHECK (length(trim(llm_provider)) > 0),
  CONSTRAINT responses_response_text_not_empty CHECK (length(trim(response_text)) > 0),
  CONSTRAINT responses_tokens_positive CHECK (tokens_used IS NULL OR tokens_used >= 0)
);

-- Performance indexes for responses
CREATE INDEX IF NOT EXISTS responses_prompt_id_idx ON responses(prompt_id);
CREATE INDEX IF NOT EXISTS responses_user_id_idx ON responses(user_id);
CREATE INDEX IF NOT EXISTS responses_agent_id_idx ON responses(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS responses_llm_provider_idx ON responses(llm_provider);
CREATE INDEX IF NOT EXISTS responses_cached_flag_idx ON responses(cached_flag) WHERE cached_flag = true;
CREATE INDEX IF NOT EXISTS responses_cache_key_idx ON responses(cache_key) WHERE cache_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS responses_created_at_idx ON responses(created_at DESC);

-- Auto-update trigger for responses
DROP TRIGGER IF EXISTS update_responses_updated_at ON responses;
CREATE TRIGGER update_responses_updated_at
  BEFORE UPDATE ON responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for responses
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own responses
CREATE POLICY "responses_select_own"
  ON responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "responses_insert_own"
  ON responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "responses_update_own"
  ON responses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "responses_delete_own"
  ON responses FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: usage_logs
-- Purpose: Track LLM usage, costs, and performance metrics per agent
-- =====================================================
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
  response_id UUID REFERENCES responses(id) ON DELETE SET NULL,
  
  -- Usage metrics
  tokens_used INTEGER NOT NULL,
  tokens_input INTEGER,
  tokens_output INTEGER,
  
  -- Cost tracking
  cost DECIMAL(10, 6) DEFAULT 0.0,
  cost_currency TEXT DEFAULT 'USD',
  
  -- LLM provider info
  llm_provider TEXT NOT NULL,
  model_name TEXT,
  
  -- Performance metrics
  response_time_ms INTEGER,
  cache_hit BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT usage_logs_tokens_positive CHECK (tokens_used >= 0),
  CONSTRAINT usage_logs_cost_non_negative CHECK (cost >= 0),
  CONSTRAINT usage_logs_llm_provider_not_empty CHECK (length(trim(llm_provider)) > 0)
);

-- Performance indexes for usage_logs
CREATE INDEX IF NOT EXISTS usage_logs_user_id_idx ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS usage_logs_agent_id_idx ON usage_logs(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS usage_logs_prompt_id_idx ON usage_logs(prompt_id) WHERE prompt_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS usage_logs_response_id_idx ON usage_logs(response_id) WHERE response_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS usage_logs_llm_provider_idx ON usage_logs(llm_provider);
CREATE INDEX IF NOT EXISTS usage_logs_created_at_idx ON usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS usage_logs_created_at_agent_idx ON usage_logs(agent_id, created_at DESC) WHERE agent_id IS NOT NULL;

-- Enable Row Level Security for usage_logs
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own usage logs
CREATE POLICY "usage_logs_select_own"
  ON usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "usage_logs_insert_own"
  ON usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Documentation
-- =====================================================
COMMENT ON TABLE prompts IS 'Stores constructed prompts with persona, knowledge, and schema data for LLM orchestration';
COMMENT ON TABLE responses IS 'Stores LLM responses with provider info, caching, and token usage';
COMMENT ON TABLE usage_logs IS 'Tracks LLM usage, costs, and performance metrics per agent';

COMMENT ON COLUMN prompts.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN prompts.user_id IS 'Owner of this prompt (references auth.users)';
COMMENT ON COLUMN prompts.agent_id IS 'Associated agent (references agents)';
COMMENT ON COLUMN prompts.persona_data IS 'Persona configuration (JSONB)';
COMMENT ON COLUMN prompts.knowledge_data IS 'Knowledge base context (JSONB)';
COMMENT ON COLUMN prompts.schema_data IS 'Field schema for validation (JSONB)';

COMMENT ON COLUMN responses.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN responses.prompt_id IS 'Associated prompt (references prompts)';
COMMENT ON COLUMN responses.cached_flag IS 'Whether this response was served from cache';
COMMENT ON COLUMN responses.tokens_used IS 'Total tokens consumed (input + output)';

COMMENT ON COLUMN usage_logs.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN usage_logs.cost IS 'Cost in specified currency';
COMMENT ON COLUMN usage_logs.response_time_ms IS 'Response time in milliseconds';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS usage_logs CASCADE;
-- DROP TABLE IF EXISTS responses CASCADE;
-- DROP TABLE IF EXISTS prompts CASCADE;
