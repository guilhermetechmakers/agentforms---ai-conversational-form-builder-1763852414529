import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { settingsApi } from "@/api/settings"
import { toast } from "sonner"
import type {
  LLMProviderSettingInsert,
  LLMProviderSettingUpdate,
  DataRetentionSettingInsert,
  DataRetentionSettingUpdate,
  AuditLogInsert,
  SSOConfigurationInsert,
  SSOConfigurationUpdate,
  TeamMemberInvite,
  TeamMemberUpdate,
  EncryptionSettingInsert,
  EncryptionSettingUpdate,
} from "@/types/settings"

// LLM Provider Settings
export function useLLMProviders() {
  return useQuery({
    queryKey: ["llm-providers"],
    queryFn: () => settingsApi.getLLMProviders(),
  })
}

export function useLLMProvider(id: string) {
  return useQuery({
    queryKey: ["llm-provider", id],
    queryFn: () => settingsApi.getLLMProvider(id),
    enabled: !!id,
  })
}

export function useCreateLLMProvider() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: LLMProviderSettingInsert) => settingsApi.createLLMProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llm-providers"] })
      toast.success("LLM provider added successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add LLM provider")
    },
  })
}

export function useUpdateLLMProvider() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LLMProviderSettingUpdate }) =>
      settingsApi.updateLLMProvider(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["llm-providers"] })
      queryClient.invalidateQueries({ queryKey: ["llm-provider", variables.id] })
      toast.success("LLM provider updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update LLM provider")
    },
  })
}

export function useDeleteLLMProvider() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => settingsApi.deleteLLMProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llm-providers"] })
      toast.success("LLM provider deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete LLM provider")
    },
  })
}

export function useSetDefaultLLMProvider() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => settingsApi.setDefaultLLMProvider(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["llm-providers"] })
      toast.success("Default LLM provider updated")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to set default provider")
    },
  })
}

// Data Retention Settings
export function useDataRetentionSettings() {
  return useQuery({
    queryKey: ["data-retention-settings"],
    queryFn: () => settingsApi.getDataRetentionSettings(),
  })
}

export function useCreateDataRetentionSettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: DataRetentionSettingInsert) => settingsApi.createDataRetentionSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-retention-settings"] })
      toast.success("Data retention settings saved")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save data retention settings")
    },
  })
}

export function useUpdateDataRetentionSettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: DataRetentionSettingUpdate) => settingsApi.updateDataRetentionSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-retention-settings"] })
      toast.success("Data retention settings updated")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update data retention settings")
    },
  })
}

// Audit Logs
export function useAuditLogs(params?: {
  limit?: number;
  offset?: number;
  action_type?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
}) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => settingsApi.getAuditLogs(params),
  })
}

export function useCreateAuditLog() {
  return useMutation({
    mutationFn: (data: AuditLogInsert) => settingsApi.createAuditLog(data),
  })
}

// SSO Configuration
export function useSSOConfiguration() {
  return useQuery({
    queryKey: ["sso-configuration"],
    queryFn: () => settingsApi.getSSOConfiguration(),
  })
}

export function useCreateSSOConfiguration() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: SSOConfigurationInsert) => settingsApi.createSSOConfiguration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sso-configuration"] })
      toast.success("SSO configuration created")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create SSO configuration")
    },
  })
}

export function useUpdateSSOConfiguration() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: SSOConfigurationUpdate) => settingsApi.updateSSOConfiguration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sso-configuration"] })
      toast.success("SSO configuration updated")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update SSO configuration")
    },
  })
}

export function useDeleteSSOConfiguration() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => settingsApi.deleteSSOConfiguration(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sso-configuration"] })
      toast.success("SSO configuration deleted")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete SSO configuration")
    },
  })
}

// Team Management
export function useTeamMembers(teamId?: string) {
  return useQuery({
    queryKey: ["team-members", teamId],
    queryFn: () => settingsApi.getTeamMembers(teamId),
  })
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: TeamMemberInvite) => settingsApi.inviteTeamMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] })
      toast.success("Team member invited successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to invite team member")
    },
  })
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TeamMemberUpdate }) =>
      settingsApi.updateTeamMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] })
      toast.success("Team member updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update team member")
    },
  })
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => settingsApi.removeTeamMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] })
      toast.success("Team member removed successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove team member")
    },
  })
}

// Encryption Settings
export function useEncryptionSettings() {
  return useQuery({
    queryKey: ["encryption-settings"],
    queryFn: () => settingsApi.getEncryptionSettings(),
  })
}

export function useCreateEncryptionSettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: EncryptionSettingInsert) => settingsApi.createEncryptionSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encryption-settings"] })
      toast.success("Encryption settings saved")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save encryption settings")
    },
  })
}

export function useUpdateEncryptionSettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: EncryptionSettingUpdate) => settingsApi.updateEncryptionSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encryption-settings"] })
      toast.success("Encryption settings updated")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update encryption settings")
    },
  })
}
