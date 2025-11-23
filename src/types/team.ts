/**
 * Database types for teams and team_members tables
 * Generated: 2025-11-23
 */

export interface Team {
  id: string;
  name: string;
  description: string | null;
  slug: string | null;
  avatar_url: string | null;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TeamInsert {
  id?: string;
  name: string;
  description?: string | null;
  slug?: string | null;
  avatar_url?: string | null;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface TeamUpdate {
  name?: string;
  description?: string | null;
  slug?: string | null;
  avatar_url?: string | null;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export type TeamRow = Team;

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'pending' | 'inactive';
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMemberInsert {
  id?: string;
  team_id: string;
  user_id: string;
  role?: 'owner' | 'admin' | 'member';
  status?: 'active' | 'pending' | 'inactive';
}

export interface TeamMemberUpdate {
  role?: 'owner' | 'admin' | 'member';
  status?: 'active' | 'pending' | 'inactive';
}

export type TeamMemberRow = TeamMember;
