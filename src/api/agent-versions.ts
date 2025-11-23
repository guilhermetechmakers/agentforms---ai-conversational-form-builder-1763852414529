import { supabase } from "@/lib/supabase"
import type { AgentVersion, VersionDiff } from "@/types/agent-version"

export const agentVersionsApi = {
  getByAgentId: async (agentId: string): Promise<AgentVersion[]> => {
    const { data, error } = await supabase
      .from("agent_versions")
      .select("*")
      .eq("agent_id", agentId)
      .order("version_number", { ascending: false })

    if (error) throw error
    return data || []
  },

  getById: async (id: string): Promise<AgentVersion> => {
    const { data, error } = await supabase
      .from("agent_versions")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  },

  getByVersionNumber: async (
    agentId: string,
    versionNumber: number
  ): Promise<AgentVersion> => {
    const { data, error } = await supabase
      .from("agent_versions")
      .select("*")
      .eq("agent_id", agentId)
      .eq("version_number", versionNumber)
      .single()

    if (error) throw error
    return data
  },

  createVersion: async (
    agentId: string,
    changeSummary?: string
  ): Promise<AgentVersion> => {
    const { data, error } = await supabase.rpc("create_agent_version", {
      p_agent_id: agentId,
      p_change_summary: changeSummary || null,
    })

    if (error) throw error

    // Fetch the created version
    const version = await agentVersionsApi.getById(data)
    return version
  },

  getVersionDiff: async (
    agentId: string,
    fromVersion: number,
    toVersion: number
  ): Promise<VersionDiff> => {
    const { data, error } = await supabase.rpc("get_version_diff", {
      p_agent_id: agentId,
      p_from_version: fromVersion,
      p_to_version: toVersion,
    })

    if (error) throw error
    return data || {
      schema_changed: false,
      persona_changed: false,
      knowledge_changed: false,
      visuals_changed: false,
    }
  },
}
