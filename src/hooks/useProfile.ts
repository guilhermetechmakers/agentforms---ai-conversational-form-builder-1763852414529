import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { profileApi } from "@/api/profile"
import type { 
  UpdateProfileInput, 
  ChangePasswordInput,
  Verify2FAInput
} from "@/types/profile"

// Query keys
export const profileKeys = {
  all: ["profile"] as const,
  profile: () => [...profileKeys.all, "current"] as const,
  sessions: () => [...profileKeys.all, "sessions"] as const,
  auditLogs: () => [...profileKeys.all, "audit-logs"] as const,
  avatars: () => [...profileKeys.all, "avatars"] as const,
}

/**
 * Get current user profile
 */
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.profile(),
    queryFn: () => profileApi.getCompleteProfile(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => profileApi.updateProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() })
      toast.success("Profile updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile")
    },
  })
}

/**
 * Upload avatar
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() })
      queryClient.invalidateQueries({ queryKey: profileKeys.avatars() })
      toast.success("Avatar uploaded successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload avatar")
    },
  })
}

/**
 * Change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => profileApi.changePassword(input),
    onSuccess: () => {
      toast.success("Password changed successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to change password")
    },
  })
}

/**
 * Setup 2FA - Generate secret and QR code
 */
export function useSetup2FA() {
  return useMutation({
    mutationFn: () => profileApi.setup2FA(),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to setup 2FA")
    },
  })
}

/**
 * Verify and enable 2FA
 */
export function useVerifyAndEnable2FA() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: Verify2FAInput) => profileApi.verifyAndEnable2FA(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() })
      toast.success("Two-factor authentication enabled")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to enable 2FA")
    },
  })
}

/**
 * Enable 2FA (legacy - kept for backward compatibility)
 */
export function useEnable2FA() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (secret: string) => profileApi.enable2FA(secret),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() })
      toast.success("Two-factor authentication enabled")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to enable 2FA")
    },
  })
}

/**
 * Disable 2FA
 */
export function useDisable2FA() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => profileApi.disable2FA(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() })
      toast.success("Two-factor authentication disabled")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to disable 2FA")
    },
  })
}

/**
 * Get active sessions
 */
export function useActiveSessions() {
  return useQuery({
    queryKey: profileKeys.sessions(),
    queryFn: () => profileApi.getActiveSessions(),
    staleTime: 1000 * 60, // 1 minute
  })
}

/**
 * Terminate a session
 */
export function useTerminateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) => profileApi.terminateSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.sessions() })
      toast.success("Session terminated")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to terminate session")
    },
  })
}

/**
 * Logout everywhere
 */
export function useLogoutEverywhere() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => profileApi.logoutEverywhere(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.sessions() })
      toast.success("Logged out from all devices")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to logout everywhere")
    },
  })
}

/**
 * Export user data
 */
export function useExportData() {
  return useMutation({
    mutationFn: () => profileApi.exportData(),
    onSuccess: (blob) => {
      // Download the blob
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `agentforms-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Data exported successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export data")
    },
  })
}

/**
 * Delete account
 */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: (reason?: string) => profileApi.deleteAccount(reason),
    onSuccess: (restoreToken) => {
      toast.success("Account deletion requested. You have been signed out.")
      // Store restore token in localStorage for potential recovery
      if (restoreToken) {
        localStorage.setItem('account_restore_token', restoreToken)
      }
      // Redirect to landing page
      setTimeout(() => {
        window.location.href = "/"
      }, 2000)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete account")
    },
  })
}

/**
 * Get audit logs
 */
export function useAuditLogs(limit: number = 50) {
  return useQuery({
    queryKey: [...profileKeys.auditLogs(), limit],
    queryFn: () => profileApi.getAuditLogs(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Get avatars
 */
export function useAvatars() {
  return useQuery({
    queryKey: profileKeys.avatars(),
    queryFn: () => profileApi.getAvatars(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
