-- =====================================================
-- Migration: Create Help & Support Tables
-- Created: 2025-11-23T00:09:39Z
-- Tables: documentation, faqs, sample_prompts, support_tickets
-- Purpose: Support system for About & Help page with documentation, FAQs, sample prompts, and support tickets
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
-- TABLE: documentation
-- Purpose: Store searchable documentation articles
-- =====================================================
CREATE TABLE IF NOT EXISTS documentation (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('getting-started', 'agents', 'webhooks', 'exports', 'privacy', 'api', 'integrations', 'other')),
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT documentation_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT documentation_content_not_empty CHECK (length(trim(content)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS documentation_category_idx ON documentation(category);
CREATE INDEX IF NOT EXISTS documentation_created_at_idx ON documentation(created_at DESC);
CREATE INDEX IF NOT EXISTS documentation_search_idx ON documentation USING GIN(search_vector);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_documentation_updated_at ON documentation;
CREATE TRIGGER update_documentation_updated_at
  BEFORE UPDATE ON documentation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE documentation ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Documentation is publicly readable
CREATE POLICY "documentation_select_all"
  ON documentation FOR SELECT
  USING (true);

-- Admin-only write access (will be managed via service role)
CREATE POLICY "documentation_insert_admin"
  ON documentation FOR INSERT
  WITH CHECK (false); -- Disabled by default, use service role

CREATE POLICY "documentation_update_admin"
  ON documentation FOR UPDATE
  USING (false)
  WITH CHECK (false); -- Disabled by default, use service role

CREATE POLICY "documentation_delete_admin"
  ON documentation FOR DELETE
  USING (false); -- Disabled by default, use service role

-- Documentation
COMMENT ON TABLE documentation IS 'Searchable documentation articles for the help system';
COMMENT ON COLUMN documentation.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN documentation.category IS 'Category for organizing documentation';
COMMENT ON COLUMN documentation.search_vector IS 'Full-text search vector for title and content';

-- =====================================================
-- TABLE: faqs
-- Purpose: Store frequently asked questions and answers
-- =====================================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT faqs_question_not_empty CHECK (length(trim(question)) > 0),
  CONSTRAINT faqs_answer_not_empty CHECK (length(trim(answer)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS faqs_category_idx ON faqs(category);
CREATE INDEX IF NOT EXISTS faqs_order_idx ON faqs(order_index, created_at DESC);
CREATE INDEX IF NOT EXISTS faqs_created_at_idx ON faqs(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: FAQs are publicly readable
CREATE POLICY "faqs_select_all"
  ON faqs FOR SELECT
  USING (true);

-- Admin-only write access
CREATE POLICY "faqs_insert_admin"
  ON faqs FOR INSERT
  WITH CHECK (false); -- Disabled by default, use service role

CREATE POLICY "faqs_update_admin"
  ON faqs FOR UPDATE
  USING (false)
  WITH CHECK (false); -- Disabled by default, use service role

CREATE POLICY "faqs_delete_admin"
  ON faqs FOR DELETE
  USING (false); -- Disabled by default, use service role

-- Documentation
COMMENT ON TABLE faqs IS 'Frequently asked questions and answers';
COMMENT ON COLUMN faqs.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN faqs.order_index IS 'Display order for FAQs';

-- =====================================================
-- TABLE: sample_prompts
-- Purpose: Store sample persona and field phrasing templates
-- =====================================================
CREATE TABLE IF NOT EXISTS sample_prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  persona TEXT,
  template TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('persona', 'field-phrasing', 'validation', 'welcome-message', 'other')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT sample_prompts_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT sample_prompts_template_not_empty CHECK (length(trim(template)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS sample_prompts_category_idx ON sample_prompts(category);
CREATE INDEX IF NOT EXISTS sample_prompts_tags_idx ON sample_prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS sample_prompts_created_at_idx ON sample_prompts(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_sample_prompts_updated_at ON sample_prompts;
CREATE TRIGGER update_sample_prompts_updated_at
  BEFORE UPDATE ON sample_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE sample_prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Sample prompts are publicly readable
CREATE POLICY "sample_prompts_select_all"
  ON sample_prompts FOR SELECT
  USING (true);

-- Admin-only write access
CREATE POLICY "sample_prompts_insert_admin"
  ON sample_prompts FOR INSERT
  WITH CHECK (false); -- Disabled by default, use service role

CREATE POLICY "sample_prompts_update_admin"
  ON sample_prompts FOR UPDATE
  USING (false)
  WITH CHECK (false); -- Disabled by default, use service role

CREATE POLICY "sample_prompts_delete_admin"
  ON sample_prompts FOR DELETE
  USING (false); -- Disabled by default, use service role

-- Documentation
COMMENT ON TABLE sample_prompts IS 'Sample persona and field phrasing templates for agent builders';
COMMENT ON COLUMN sample_prompts.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN sample_prompts.tags IS 'Array of tags for filtering and searching';

-- =====================================================
-- TABLE: support_tickets
-- Purpose: Store user support ticket submissions
-- =====================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  session_id TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT support_tickets_subject_not_empty CHECK (length(trim(subject)) > 0),
  CONSTRAINT support_tickets_description_not_empty CHECK (length(trim(description)) > 0),
  CONSTRAINT support_tickets_email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS support_tickets_user_id_idx ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON support_tickets(status);
CREATE INDEX IF NOT EXISTS support_tickets_priority_idx ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS support_tickets_created_at_idx ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS support_tickets_session_id_idx ON support_tickets(session_id) WHERE session_id IS NOT NULL;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own tickets
CREATE POLICY "support_tickets_select_own"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "support_tickets_insert_own"
  ON support_tickets FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR 
    (user_id IS NULL AND email IS NOT NULL)
  );

CREATE POLICY "support_tickets_update_own"
  ON support_tickets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin can access all tickets (will be managed via service role)
CREATE POLICY "support_tickets_admin_all"
  ON support_tickets FOR ALL
  USING (false)
  WITH CHECK (false); -- Disabled by default, use service role

-- Documentation
COMMENT ON TABLE support_tickets IS 'User support ticket submissions';
COMMENT ON COLUMN support_tickets.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN support_tickets.user_id IS 'User who created the ticket (nullable for anonymous submissions)';
COMMENT ON COLUMN support_tickets.session_id IS 'Optional session ID for context';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS support_tickets CASCADE;
-- DROP TABLE IF EXISTS sample_prompts CASCADE;
-- DROP TABLE IF EXISTS faqs CASCADE;
-- DROP TABLE IF EXISTS documentation CASCADE;
