-- =====================================================
-- Migration: Create User Profiles and Sessions Tables
-- Created: 2025-11-23T00:53:04Z
-- Tables: user_profiles, user_sessions
-- Purpose: Support user profile management, 2FA, and session tracking
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
-- TABLE: user_profiles
-- Purpose: Extended user profile information beyond auth.users
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Profile information
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  
  -- Security settings
  two_factor_enabled BOOLEAN DEFAULT false NOT NULL,
  two_factor_secret TEXT, -- Encrypted TOTP secret
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes for user_profiles
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS user_profiles_role_idx ON user_profiles(role);

-- Auto-update trigger for user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own profile, admins can access all
CREATE POLICY "user_profiles_select_own"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "user_profiles_insert_own"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update_own"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_delete_own"
  ON user_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: user_sessions
-- Purpose: Track active user sessions for security management
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Session information
  session_token TEXT NOT NULL UNIQUE, -- Supabase session token
  device_info JSONB DEFAULT '{}'::jsonb, -- {browser, os, device}
  ip_address INET,
  user_agent TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true NOT NULL,
  last_activity_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT user_sessions_token_not_empty CHECK (length(trim(session_token)) > 0)
);

-- Performance indexes for user_sessions
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_token_idx ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS user_sessions_active_idx ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS user_sessions_last_activity_idx ON user_sessions(last_activity_at DESC);

-- Auto-update trigger for user_sessions
DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_last_activity
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  WHEN (OLD.is_active = true AND NEW.is_active = true)
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own sessions
CREATE POLICY "user_sessions_select_own"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_sessions_insert_own"
  ON user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_sessions_update_own"
  ON user_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_sessions_delete_own"
  ON user_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTION: Create profile on user signup
-- Purpose: Automatically create profile when user signs up
-- =====================================================
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Documentation
COMMENT ON TABLE user_profiles IS 'Extended user profile information including preferences and security settings';
COMMENT ON TABLE user_sessions IS 'Active user sessions for security management and logout everywhere functionality';
COMMENT ON COLUMN user_profiles.user_id IS 'References auth.users(id) - one profile per user';
COMMENT ON COLUMN user_profiles.two_factor_secret IS 'Encrypted TOTP secret for 2FA (RFC 6238)';
COMMENT ON COLUMN user_sessions.session_token IS 'Supabase session token for tracking active sessions';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS create_user_profile();
-- DROP TABLE IF EXISTS user_sessions CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;
