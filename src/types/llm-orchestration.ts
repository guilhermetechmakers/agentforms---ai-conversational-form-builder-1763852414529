/**
 * Database types for LLM Orchestration tables
 * Generated: 2025-11-23T02:11:48Z
 */

import type { Persona, KnowledgeBase, AgentSchema } from './agent'

// =====================================================
// PROMPTS
// =====================================================

export interface Prompt {
  id: string
  user_id: string
  agent_id: string | null
  persona_data: Persona
  knowledge_data: KnowledgeBase
  schema_data: AgentSchema
  prompt_text: string | null
  conversation_history: ConversationMessage[]
  remaining_fields: string[]
  created_at: string
  updated_at: string
}

export interface ConversationMessage {
  role: 'agent' | 'visitor'
  content: string
  timestamp: string
  field_key?: string
}

export interface CreatePromptInput {
  agent_id?: string | null
  persona_data: Persona
  knowledge_data: KnowledgeBase
  schema_data: AgentSchema
  prompt_text?: string | null
  conversation_history?: ConversationMessage[]
  remaining_fields?: string[]
}

export interface UpdatePromptInput {
  persona_data?: Persona
  knowledge_data?: KnowledgeBase
  schema_data?: AgentSchema
  prompt_text?: string | null
  conversation_history?: ConversationMessage[]
  remaining_fields?: string[]
}

// =====================================================
// RESPONSES
// =====================================================

export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'custom'

export interface Response {
  id: string
  prompt_id: string
  user_id: string
  agent_id: string | null
  llm_provider: LLMProvider
  model_name: string | null
  response_text: string
  response_data: Record<string, any>
  cached_flag: boolean
  cache_key: string | null
  cache_expires_at: string | null
  tokens_used: number | null
  tokens_input: number | null
  tokens_output: number | null
  temperature: number | null
  deterministic_mode: boolean
  created_at: string
  updated_at: string
}

export interface CreateResponseInput {
  prompt_id: string
  agent_id?: string | null
  llm_provider: LLMProvider
  model_name?: string | null
  response_text: string
  response_data?: Record<string, any>
  cached_flag?: boolean
  cache_key?: string | null
  cache_expires_at?: string | null
  tokens_used?: number | null
  tokens_input?: number | null
  tokens_output?: number | null
  temperature?: number | null
  deterministic_mode?: boolean
}

export interface UpdateResponseInput {
  response_text?: string
  response_data?: Record<string, any>
  cached_flag?: boolean
  cache_key?: string | null
  cache_expires_at?: string | null
  tokens_used?: number | null
  tokens_input?: number | null
  tokens_output?: number | null
}

// =====================================================
// USAGE LOGS
// =====================================================

export interface UsageLog {
  id: string
  user_id: string
  agent_id: string | null
  prompt_id: string | null
  response_id: string | null
  tokens_used: number
  tokens_input: number | null
  tokens_output: number | null
  cost: number
  cost_currency: string
  llm_provider: LLMProvider
  model_name: string | null
  response_time_ms: number | null
  cache_hit: boolean
  created_at: string
}

export interface CreateUsageLogInput {
  agent_id?: string | null
  prompt_id?: string | null
  response_id?: string | null
  tokens_used: number
  tokens_input?: number | null
  tokens_output?: number | null
  cost?: number
  cost_currency?: string
  llm_provider: LLMProvider
  model_name?: string | null
  response_time_ms?: number | null
  cache_hit?: boolean
}

// =====================================================
// LLM ORCHESTRATION TYPES
// =====================================================

export interface LLMQueryOptions {
  provider?: LLMProvider
  model?: string
  temperature?: number
  deterministic?: boolean
  useCache?: boolean
  maxTokens?: number
}

export interface LLMQueryResult {
  response: Response
  usageLog: UsageLog
  cached: boolean
}

export interface PromptConstructionInput {
  agentId?: string
  persona: Persona
  knowledge: KnowledgeBase
  schema: AgentSchema
  conversationHistory?: ConversationMessage[]
  remainingFields?: string[]
}

export interface UsageSummary {
  total_tokens: number
  total_cost: number
  total_requests: number
  cache_hit_rate: number
  avg_response_time_ms: number
  by_provider: Record<LLMProvider, {
    tokens: number
    cost: number
    requests: number
  }>
  by_agent: Record<string, {
    tokens: number
    cost: number
    requests: number
  }>
}

// Supabase query result types
export type PromptRow = Prompt
export type ResponseRow = Response
export type UsageLogRow = UsageLog
