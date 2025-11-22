/**
 * Database types for visitors table
 * Generated: 2025-11-23T00:25:46Z
 */

export interface Visitor {
  id: string;
  anonymous_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  consent_given: boolean;
  consent_given_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VisitorInsert {
  id?: string;
  anonymous_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  consent_given?: boolean;
  consent_given_at?: string;
}

export interface VisitorUpdate {
  anonymous_id?: string;
  consent_given?: boolean;
  consent_given_at?: string;
}

// Supabase query result type
export type VisitorRow = Visitor;
