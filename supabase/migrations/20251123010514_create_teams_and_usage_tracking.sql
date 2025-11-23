-- =====================================================
-- Migration: Create Teams and Usage Tracking
-- Created: 2025-11-23T01:05:14Z
-- Tables: teams, team_members, agent_usage_stats (view)
-- Purpose: Support team collaboration and usage metrics for dashboard
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
-- TABLE: teams
-- Purpose: Support team collaboration and organization
-- =====================================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Team identification
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE,
  
  -- Team settings
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT teams_name_not_empty CHECK (length(trim(name)) > 0)
);

-- Performance indexes for teams
CREATE INDEX IF NOT EXISTS teams_slug_idx ON teams(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS teams_is_active_idx ON teams(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS teams_created_at_idx ON teams(created_at DESC);

-- Auto-update trigger for teams
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Team members can access their teams
CREATE POLICY "teams_select_member"
  ON teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = teams.id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "teams_insert_owner"
  ON teams FOR INSERT
  WITH CHECK (true); -- Will be restricted by team_members table

CREATE POLICY "teams_update_member"
  ON teams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = teams.id 
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- TABLE: team_members
-- Purpose: Track team membership and roles
-- =====================================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Member role
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')) NOT NULL,
  
  -- Invitation status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')) NOT NULL,
  
  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraint: one membership per user per team
  UNIQUE(team_id, user_id)
);

-- Performance indexes for team_members
CREATE INDEX IF NOT EXISTS team_members_team_id_idx ON team_members(team_id);
CREATE INDEX IF NOT EXISTS team_members_user_id_idx ON team_members(user_id);
CREATE INDEX IF NOT EXISTS team_members_role_idx ON team_members(role);
CREATE INDEX IF NOT EXISTS team_members_status_idx ON team_members(status) WHERE status = 'active';

-- Auto-update trigger for team_members
DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can see their own memberships and team members
CREATE POLICY "team_members_select_own"
  ON team_members FOR SELECT
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
    )
  );

CREATE POLICY "team_members_insert_owner"
  ON team_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "team_members_update_owner"
  ON team_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- VIEW: agent_usage_stats
-- Purpose: Aggregate usage statistics for dashboard
-- =====================================================
CREATE OR REPLACE VIEW agent_usage_stats AS
SELECT 
  a.id AS agent_id,
  a.user_id,
  a.name AS agent_name,
  a.status,
  a.created_at,
  a.updated_at,
  
  -- Session counts
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed') AS completed_sessions,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'in-progress') AS in_progress_sessions,
  COUNT(DISTINCT s.id) AS total_sessions,
  
  -- Conversion rate (completed / total)
  CASE 
    WHEN COUNT(DISTINCT s.id) > 0 THEN
      ROUND(
        (COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed')::NUMERIC / 
         COUNT(DISTINCT s.id)::NUMERIC) * 100,
        2
      )
    ELSE 0
  END AS conversion_rate,
  
  -- Last activity
  MAX(s.started_at) AS last_activity_at,
  
  -- Monthly sessions (current month)
  COUNT(DISTINCT s.id) FILTER (
    WHERE s.started_at >= date_trunc('month', CURRENT_DATE)
  ) AS monthly_sessions
  
FROM agents a
LEFT JOIN sessions s ON s.agent_id = a.id
GROUP BY a.id, a.user_id, a.name, a.status, a.created_at, a.updated_at;

-- Grant access to the view
GRANT SELECT ON agent_usage_stats TO authenticated;

-- =====================================================
-- FUNCTION: get_user_usage_summary
-- Purpose: Get aggregated usage metrics for a user
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_usage_summary(p_user_id UUID)
RETURNS TABLE (
  total_agents INTEGER,
  active_agents INTEGER,
  total_sessions BIGINT,
  monthly_sessions BIGINT,
  conversion_rate NUMERIC,
  remaining_quota JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT a.id)::INTEGER AS total_agents,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'published')::INTEGER AS active_agents,
    COUNT(DISTINCT s.id) AS total_sessions,
    COUNT(DISTINCT s.id) FILTER (
      WHERE s.started_at >= date_trunc('month', CURRENT_DATE)
    ) AS monthly_sessions,
    CASE 
      WHEN COUNT(DISTINCT s.id) > 0 THEN
        ROUND(
          (COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed')::NUMERIC / 
           COUNT(DISTINCT s.id)::NUMERIC) * 100,
          2
        )
      ELSE 0
    END AS conversion_rate,
    COALESCE(
      (SELECT limits FROM plans p
       JOIN subscriptions sub ON sub.plan_id = p.id
       WHERE sub.user_id = p_user_id 
       AND sub.status = 'active'
       LIMIT 1),
      '{}'::jsonb
    ) AS remaining_quota
  FROM agents a
  LEFT JOIN sessions s ON s.agent_id = a.id
  WHERE a.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_usage_summary(UUID) TO authenticated;

-- =====================================================
-- Documentation
-- =====================================================
COMMENT ON TABLE teams IS 'Teams for collaboration and organization';
COMMENT ON TABLE team_members IS 'Team membership with roles (owner, admin, member)';
COMMENT ON VIEW agent_usage_stats IS 'Aggregated usage statistics per agent for dashboard';
COMMENT ON FUNCTION get_user_usage_summary IS 'Get aggregated usage metrics for a user including quota information';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP FUNCTION IF EXISTS get_user_usage_summary(UUID);
-- DROP VIEW IF EXISTS agent_usage_stats;
-- DROP TABLE IF EXISTS team_members CASCADE;
-- DROP TABLE IF EXISTS teams CASCADE;
