-- =====================================================
-- Migration: Create Webhooks and Delivery Logs Tables
-- Created: 2025-11-23T01:44:04Z
-- Tables: webhooks, delivery_logs
-- Purpose: Enable webhook configuration and delivery tracking for AgentForms
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
-- TABLE: webhooks
-- Purpose: Store webhook configurations for agents or global
-- =====================================================
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Core configuration
  url TEXT NOT NULL,
  method TEXT DEFAULT 'POST' CHECK (method IN ('POST', 'PUT', 'PATCH')) NOT NULL,
  
  -- Headers and authentication
  headers JSONB DEFAULT '{}'::jsonb,
  auth_type TEXT DEFAULT 'none' CHECK (auth_type IN ('none', 'bearer', 'basic', 'hmac')),
  auth_token TEXT, -- Encrypted in production
  
  -- Event triggers (array of trigger types)
  triggers JSONB DEFAULT '[]'::jsonb NOT NULL,
  
  -- Retry policy
  retry_policy JSONB DEFAULT '{
    "max_retries": 3,
    "backoff_type": "exponential",
    "initial_delay_ms": 1000
  }'::jsonb NOT NULL,
  
  -- Rate limiting (requests per minute)
  rate_limit_per_minute INTEGER DEFAULT 60,
  
  -- Status
  enabled BOOLEAN DEFAULT true NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'deleted')),
  
  -- Last successful delivery tracking
  last_successful_delivery_at TIMESTAMPTZ,
  last_delivery_status TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT webhooks_url_not_empty CHECK (length(trim(url)) > 0),
  CONSTRAINT webhooks_url_valid CHECK (url ~* '^https?://'),
  CONSTRAINT webhooks_triggers_not_empty CHECK (jsonb_array_length(triggers) > 0),
  CONSTRAINT webhooks_rate_limit_positive CHECK (rate_limit_per_minute > 0)
);

-- Performance indexes for webhooks
CREATE INDEX IF NOT EXISTS webhooks_user_id_idx ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS webhooks_agent_id_idx ON webhooks(agent_id) WHERE agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS webhooks_status_idx ON webhooks(status) WHERE status != 'deleted';
CREATE INDEX IF NOT EXISTS webhooks_enabled_idx ON webhooks(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS webhooks_created_at_idx ON webhooks(created_at DESC);

-- Auto-update trigger for webhooks
DROP TRIGGER IF EXISTS update_webhooks_updated_at ON webhooks;
CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for webhooks
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own webhooks
CREATE POLICY "webhooks_select_own"
  ON webhooks FOR SELECT
  USING (auth.uid() = user_id AND status != 'deleted');

CREATE POLICY "webhooks_insert_own"
  ON webhooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "webhooks_update_own"
  ON webhooks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "webhooks_delete_own"
  ON webhooks FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: delivery_logs
-- Purpose: Track webhook delivery attempts and responses
-- =====================================================
CREATE TABLE IF NOT EXISTS delivery_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  
  -- Delivery attempt details
  attempt_number INTEGER DEFAULT 1 NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'retrying')) NOT NULL,
  
  -- Response details
  response_code INTEGER,
  response_body TEXT,
  response_headers JSONB DEFAULT '{}'::jsonb,
  
  -- Error details
  error_message TEXT,
  error_type TEXT,
  
  -- Request details (for debugging)
  request_payload JSONB,
  request_headers JSONB DEFAULT '{}'::jsonb,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Retry information
  will_retry BOOLEAN DEFAULT false,
  next_retry_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT delivery_logs_attempt_positive CHECK (attempt_number > 0),
  CONSTRAINT delivery_logs_response_code_valid CHECK (response_code IS NULL OR (response_code >= 100 AND response_code < 600))
);

-- Performance indexes for delivery_logs
CREATE INDEX IF NOT EXISTS delivery_logs_webhook_id_idx ON delivery_logs(webhook_id);
CREATE INDEX IF NOT EXISTS delivery_logs_session_id_idx ON delivery_logs(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS delivery_logs_status_idx ON delivery_logs(status);
CREATE INDEX IF NOT EXISTS delivery_logs_created_at_idx ON delivery_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS delivery_logs_webhook_status_idx ON delivery_logs(webhook_id, status);
CREATE INDEX IF NOT EXISTS delivery_logs_next_retry_idx ON delivery_logs(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- =====================================================
-- Documentation
-- =====================================================
COMMENT ON TABLE webhooks IS 'Webhook configurations for agents or global integrations';
COMMENT ON TABLE delivery_logs IS 'Delivery logs tracking webhook attempts and responses';
COMMENT ON COLUMN webhooks.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN webhooks.user_id IS 'Owner of this webhook (references auth.users)';
COMMENT ON COLUMN webhooks.agent_id IS 'Optional agent-specific webhook (null for global)';
COMMENT ON COLUMN webhooks.triggers IS 'JSONB array of trigger types: session_started, session_completed, field_collected, session_updated';
COMMENT ON COLUMN webhooks.retry_policy IS 'JSONB object with max_retries, backoff_type, initial_delay_ms';
COMMENT ON COLUMN delivery_logs.webhook_id IS 'Reference to the webhook that was triggered';
COMMENT ON COLUMN delivery_logs.session_id IS 'Optional reference to the session that triggered the webhook';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS delivery_logs CASCADE;
-- DROP TABLE IF EXISTS webhooks CASCADE;
