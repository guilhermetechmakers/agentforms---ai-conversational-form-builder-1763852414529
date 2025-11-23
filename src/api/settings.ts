import { api } from "@/lib/api"
import type {
  LLMProviderSetting,
  LLMProviderSettingInsert,
  LLMProviderSettingUpdate,
  DataRetentionSetting,
  DataRetentionSettingInsert,
  DataRetentionSettingUpdate,
  AuditLog,
  AuditLogInsert,
  SSOConfiguration,
  SSOConfigurationInsert,
  SSOConfigurationUpdate,
  TeamMember,
  TeamMemberInvite,
  TeamMemberUpdate,
  EncryptionSetting,
  EncryptionSettingInsert,
  EncryptionSettingUpdate,
} from "@/types/settings"

export const settingsApi = {
  // LLM Provider Settings
  getLLMProviders: async (): Promise<LLMProviderSetting[]> => {
    return api.get<LLMProviderSetting[]>("/settings/llm-providers")
  },

  getLLMProvider: async (id: string): Promise<LLMProviderSetting> => {
    return api.get<LLMProviderSetting>(`/settings/llm-providers/${id}`)
  },

  createLLMProvider: async (data: LLMProviderSettingInsert): Promise<LLMProviderSetting> => {
    return api.post<LLMProviderSetting>("/settings/llm-providers", data)
  },

  updateLLMProvider: async (id: string, data: LLMProviderSettingUpdate): Promise<LLMProviderSetting> => {
    return api.patch<LLMProviderSetting>(`/settings/llm-providers/${id}`, data)
  },

  deleteLLMProvider: async (id: string): Promise<void> => {
    await api.delete(`/settings/llm-providers/${id}`)
  },

  setDefaultLLMProvider: async (id: string): Promise<LLMProviderSetting> => {
    return api.post<LLMProviderSetting>(`/settings/llm-providers/${id}/set-default`, {})
  },

  // Data Retention Settings
  getDataRetentionSettings: async (): Promise<DataRetentionSetting | null> => {
    return api.get<DataRetentionSetting | null>("/settings/data-retention")
  },

  createDataRetentionSettings: async (data: DataRetentionSettingInsert): Promise<DataRetentionSetting> => {
    return api.post<DataRetentionSetting>("/settings/data-retention", data)
  },

  updateDataRetentionSettings: async (data: DataRetentionSettingUpdate): Promise<DataRetentionSetting> => {
    return api.patch<DataRetentionSetting>("/settings/data-retention", data)
  },

  // Audit Logs
  getAuditLogs: async (params?: {
    limit?: number;
    offset?: number;
    action_type?: string;
    resource_type?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<{ logs: AuditLog[]; total: number }> => {
    const queryParams = new URLSearchParams()
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    if (params?.action_type) queryParams.append('action_type', params.action_type)
    if (params?.resource_type) queryParams.append('resource_type', params.resource_type)
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)
    
    const query = queryParams.toString()
    return api.get<{ logs: AuditLog[]; total: number }>(`/settings/audit-logs${query ? `?${query}` : ''}`)
  },

  createAuditLog: async (data: AuditLogInsert): Promise<AuditLog> => {
    return api.post<AuditLog>("/settings/audit-logs", data)
  },

  // SSO Configuration
  getSSOConfiguration: async (): Promise<SSOConfiguration | null> => {
    return api.get<SSOConfiguration | null>("/settings/sso")
  },

  createSSOConfiguration: async (data: SSOConfigurationInsert): Promise<SSOConfiguration> => {
    return api.post<SSOConfiguration>("/settings/sso", data)
  },

  updateSSOConfiguration: async (data: SSOConfigurationUpdate): Promise<SSOConfiguration> => {
    return api.patch<SSOConfiguration>("/settings/sso", data)
  },

  deleteSSOConfiguration: async (): Promise<void> => {
    await api.delete("/settings/sso")
  },

  // Team Management
  getTeamMembers: async (teamId?: string): Promise<TeamMember[]> => {
    const query = teamId ? `?team_id=${teamId}` : ''
    return api.get<TeamMember[]>(`/settings/team-members${query}`)
  },

  inviteTeamMember: async (data: TeamMemberInvite): Promise<TeamMember> => {
    return api.post<TeamMember>("/settings/team-members/invite", data)
  },

  updateTeamMember: async (id: string, data: TeamMemberUpdate): Promise<TeamMember> => {
    return api.patch<TeamMember>(`/settings/team-members/${id}`, data)
  },

  removeTeamMember: async (id: string): Promise<void> => {
    await api.delete(`/settings/team-members/${id}`)
  },

  // Encryption Settings
  getEncryptionSettings: async (): Promise<EncryptionSetting | null> => {
    return api.get<EncryptionSetting | null>("/settings/encryption")
  },

  createEncryptionSettings: async (data: EncryptionSettingInsert): Promise<EncryptionSetting> => {
    return api.post<EncryptionSetting>("/settings/encryption", data)
  },

  updateEncryptionSettings: async (data: EncryptionSettingUpdate): Promise<EncryptionSetting> => {
    return api.patch<EncryptionSetting>("/settings/encryption", data)
  },
}
