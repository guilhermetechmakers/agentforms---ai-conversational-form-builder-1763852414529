/**
 * Database types for test_sessions table
 * Generated: 2025-11-23T01:28:08Z
 */

export interface TestSession {
  id: string;
  user_id: string;
  agent_id: string;
  name: string | null;
  conversation_log: ConversationMessage[];
  collected_fields: Record<string, any>;
  missing_fields: string[];
  llm_mode: 'deterministic' | 'generative';
  temperature_setting: number;
  errors: ValidationError[];
  suggestions: Suggestion[];
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  role: 'agent' | 'user';
  content: string;
  timestamp: string;
  field_key?: string | null;
  attachment_url?: string | null;
}

export interface ValidationError {
  type: 'validation' | 'llm' | 'schema' | 'persona';
  message: string;
  field_key?: string;
  severity: 'error' | 'warning' | 'info';
}

export interface Suggestion {
  type: 'persona' | 'schema' | 'validation' | 'prompt';
  message: string;
  actionable: boolean;
  field_key?: string;
}

export interface TestSessionInsert {
  id?: string;
  user_id?: string; // Optional - will be set by API layer
  agent_id: string;
  name?: string | null;
  conversation_log?: ConversationMessage[];
  collected_fields?: Record<string, any>;
  missing_fields?: string[];
  llm_mode?: 'deterministic' | 'generative';
  temperature_setting?: number;
  errors?: ValidationError[];
  suggestions?: Suggestion[];
}

export interface TestSessionUpdate {
  name?: string | null;
  conversation_log?: ConversationMessage[];
  collected_fields?: Record<string, any>;
  missing_fields?: string[];
  llm_mode?: 'deterministic' | 'generative';
  temperature_setting?: number;
  errors?: ValidationError[];
  suggestions?: Suggestion[];
}

// Supabase query result type
export type TestSessionRow = TestSession;
