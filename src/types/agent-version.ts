/**
 * Database types for agent_versions table
 * Generated: 2025-11-23T02:44:50Z
 */

import type { AgentSchema, Persona, KnowledgeBase, VisualSettings } from "./agent"

export interface AgentVersion {
  id: string
  agent_id: string
  user_id: string
  version_number: number
  status: 'draft' | 'published' | 'archived'
  schema: AgentSchema
  persona: Persona
  knowledge: KnowledgeBase
  visuals: VisualSettings
  change_summary: string | null
  changes: Record<string, any>
  public_slug: string | null
  public_url: string | null
  created_at: string
}

export interface AgentVersionInsert {
  agent_id: string
  version_number: number
  status?: 'draft' | 'published' | 'archived'
  schema: AgentSchema
  persona?: Persona
  knowledge?: KnowledgeBase
  visuals?: VisualSettings
  change_summary?: string | null
  changes?: Record<string, any>
  public_slug?: string | null
  public_url?: string | null
}

export interface VersionDiff {
  schema_changed: boolean
  persona_changed: boolean
  knowledge_changed: boolean
  visuals_changed: boolean
}

export type AgentVersionRow = AgentVersion
