/**
 * Usage metrics and statistics types
 * Generated: 2025-11-23
 */

export interface AgentUsageStats {
  agent_id: string;
  user_id: string;
  agent_name: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  completed_sessions: number;
  in_progress_sessions: number;
  total_sessions: number;
  conversion_rate: number;
  last_activity_at: string | null;
  monthly_sessions: number;
}

export interface UserUsageSummary {
  total_agents: number;
  active_agents: number;
  total_sessions: number;
  monthly_sessions: number;
  conversion_rate: number;
  remaining_quota: {
    agents?: number;
    sessions_per_month?: number;
    llm_calls_per_month?: number;
    storage_mb?: number;
    [key: string]: any;
  };
}

export interface AgentWithStats {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  schema: any;
  persona?: any;
  knowledge?: any;
  visuals?: any;
  status: 'draft' | 'published';
  public_url?: string;
  version: number;
  created_at: string;
  updated_at: string;
  // Stats from agent_usage_stats view
  completed_sessions?: number;
  in_progress_sessions?: number;
  total_sessions?: number;
  conversion_rate?: number;
  last_activity_at?: string | null;
  monthly_sessions?: number;
}
