-- =====================================================
-- Migration: Create Visitors and Engagements Tables
-- Created: 2025-11-23T01:00:07Z
-- Tables: visitors, engagements
-- Purpose: Track landing page visitor analytics and engagement
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
-- TABLE: visitors
-- Purpose: Track landing page visitors and their metadata
-- =====================================================
CREATE TABLE IF NOT EXISTS visitors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Visitor identification
  session_id TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  
  -- Interaction tracking
  interaction_history JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  arrival_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_interaction TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT visitors_session_id_not_empty CHECK (length(trim(session_id)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS visitors_arrival_time_idx ON visitors(arrival_time DESC);
CREATE INDEX IF NOT EXISTS visitors_session_id_idx ON visitors(session_id);
CREATE INDEX IF NOT EXISTS visitors_last_interaction_idx ON visitors(last_interaction DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_visitors_updated_at ON visitors;
CREATE TRIGGER update_visitors_updated_at
  BEFORE UPDATE ON visitors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read/write for tracking (no auth required)
CREATE POLICY "visitors_insert_public"
  ON visitors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "visitors_select_public"
  ON visitors FOR SELECT
  USING (true);

CREATE POLICY "visitors_update_public"
  ON visitors FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Documentation
COMMENT ON TABLE visitors IS 'Tracks landing page visitors and their interaction history';
COMMENT ON COLUMN visitors.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN visitors.session_id IS 'Unique session identifier for the visitor';
COMMENT ON COLUMN visitors.interaction_history IS 'JSON array of interaction events';

-- =====================================================
-- TABLE: engagements
-- Purpose: Track specific engagement events (CTA clicks, feature views, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS engagements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  visitor_id UUID REFERENCES visitors(id) ON DELETE CASCADE NOT NULL,
  
  -- Engagement details
  cta_type TEXT NOT NULL CHECK (cta_type IN ('signup', 'demo', 'pricing', 'feature', 'testimonial', 'footer_link', 'contact')),
  engagement_type TEXT NOT NULL CHECK (engagement_type IN ('click', 'view', 'hover', 'scroll')),
  target_element TEXT,
  target_url TEXT,
  
  -- Context
  section TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  engagement_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT engagements_cta_type_not_empty CHECK (length(trim(cta_type)) > 0),
  CONSTRAINT engagements_engagement_type_not_empty CHECK (length(trim(engagement_type)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS engagements_visitor_id_idx ON engagements(visitor_id);
CREATE INDEX IF NOT EXISTS engagements_engagement_time_idx ON engagements(engagement_time DESC);
CREATE INDEX IF NOT EXISTS engagements_cta_type_idx ON engagements(cta_type);
CREATE INDEX IF NOT EXISTS engagements_section_idx ON engagements(section);

-- Enable Row Level Security
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read/write for tracking (no auth required)
CREATE POLICY "engagements_insert_public"
  ON engagements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "engagements_select_public"
  ON engagements FOR SELECT
  USING (true);

-- Documentation
COMMENT ON TABLE engagements IS 'Tracks specific engagement events from landing page visitors';
COMMENT ON COLUMN engagements.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN engagements.visitor_id IS 'References the visitor who engaged';
COMMENT ON COLUMN engagements.cta_type IS 'Type of call-to-action that was engaged';
COMMENT ON COLUMN engagements.engagement_type IS 'Type of engagement (click, view, hover, scroll)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS engagements CASCADE;
-- DROP TABLE IF EXISTS visitors CASCADE;
