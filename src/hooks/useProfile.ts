import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { profileApi } from "@/api/profile"
import type { 
  UpdateProfileInput, 
  ChangePasswordInput
} from "@/types/profile"

// Query keys
export const profileKeys = {
  all: ["profile"] as const,
  profile: () => [...profileKeys.all, "current"] as const,
  sessions: () => [...profileKeys.all, "sessions"] as const,
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
    onSuccess: async (url) => {
      // Update profile with new avatar URL
      await profileApi.updateProfile({ avatar_url: url })
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() })
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
 * Enable 2FA
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
    mutationFn: () => profileApi.deleteAccount(),
    onSuccess: () => {
      toast.success("Account deleted successfully")
      // Redirect to landing page
      window.location.href = "/"
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete account")
    },
  })
}
