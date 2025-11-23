import { supabase } from "@/lib/supabase"
import type { 
  UserProfile, 
  UserProfileUpdate, 
  UpdateProfileInput,
  ChangePasswordInput,
  UserSession,
  TwoFactorSetup,
  Verify2FAInput,
  Avatar,
  AuditLog
} from "@/types/profile"

// Helper function to get client metadata (IP, user agent)
const getClientMetadata = () => {
  return {
    ip_address: null, // Will be set by backend/edge function
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
  }
}

// Helper function to generate backup codes
const generateBackupCodes = (count: number = 10): string[] => {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = Array.from({ length: 8 }, () => 
      Math.random().toString(36).charAt(2)
    ).join('').toUpperCase()
    codes.push(code)
  }
  return codes
}

// Helper function to create QR code URL for TOTP
// Note: This requires a TOTP library like 'otplib' or 'speakeasy'
// For now, we'll generate the otpauth URL format
const generateQRCodeURL = (secret: string, email: string, issuer: string = 'AgentForms'): string => {
  const encodedIssuer = encodeURIComponent(issuer)
  const encodedEmail = encodeURIComponent(email)
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}`
}

export const profileApi = {
  /**
   * Get current user's profile
   */
  getProfile: async (): Promise<UserProfile | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return data
  },

  /**
   * Get complete user profile with auth data
   */
  getCompleteProfile: async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Not authenticated")

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      throw profileError
    }

    return {
      id: user.id,
      email: user.email || "",
      email_verified: !!user.email_confirmed_at,
      profile: profile || null,
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (input: UpdateProfileInput): Promise<UserProfile> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // First ensure profile exists
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single()

    const updateData: UserProfileUpdate = {}
    if (input.full_name !== undefined) updateData.full_name = input.full_name
    if (input.avatar_url !== undefined) updateData.avatar_url = input.avatar_url
    if (input.company !== undefined) updateData.company = input.company
    if (input.contact_number !== undefined) updateData.contact_number = input.contact_number
    if (input.timezone !== undefined) updateData.timezone = input.timezone
    if (input.language !== undefined) updateData.language = input.language

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from("user_profiles")
        .update(updateData)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from("user_profiles")
        .insert({
          user_id: user.id,
          ...updateData,
        })
        .select()
        .single()

      if (error) throw error
      
      // Create audit log
      const metadata = getClientMetadata()
      await supabase.rpc('create_audit_log', {
        p_user_id: user.id,
        p_action_type: 'profile_update',
        p_action_details: { fields_updated: Object.keys(updateData) },
        p_ip_address: metadata.ip_address,
        p_user_agent: metadata.user_agent,
      })
      
      return data
    }
  },

  /**
   * Upload avatar image with database tracking
   */
  uploadAvatar: async (file: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Validate file
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error("File size must be less than 5MB")
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error("File must be an image (JPEG, PNG, GIF, or WebP)")
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Deactivate old avatars
    await supabase
      .from("avatars")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("is_active", true)

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath)

    const publicUrl = urlData.publicUrl

    // Create avatar record
    const { error: avatarError } = await supabase
      .from("avatars")
      .insert({
        user_id: user.id,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_bucket: 'avatars',
        is_active: true,
      })

    if (avatarError) throw avatarError

    // Update profile with new avatar URL
    await supabase
      .from("user_profiles")
      .update({ avatar_url: publicUrl })
      .eq("user_id", user.id)

    // Create audit log
    const metadata = getClientMetadata()
    await supabase.rpc('create_audit_log', {
      p_user_id: user.id,
      p_action_type: 'avatar_upload',
      p_action_details: { file_name: file.name, file_size: file.size },
      p_ip_address: metadata.ip_address,
      p_user_agent: metadata.user_agent,
    })

    return publicUrl
  },

  /**
   * Change password
   */
  changePassword: async (input: ChangePasswordInput): Promise<void> => {
    if (input.new_password !== input.confirm_password) {
      throw new Error("New passwords do not match")
    }

    if (input.new_password.length < 8) {
      throw new Error("Password must be at least 8 characters")
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) throw new Error("Not authenticated")

    // Note: Supabase doesn't provide a direct way to verify current password
    // We'll need to handle this on the backend or use a different approach
    // For now, we'll update the password directly (backend should verify)
    const { error } = await supabase.auth.updateUser({
      password: input.new_password,
    })

    if (error) throw error

    // Create audit log
    const metadata = getClientMetadata()
    await supabase.rpc('create_audit_log', {
      p_user_id: user.id,
      p_action_type: 'password_change',
      p_action_details: {},
      p_ip_address: metadata.ip_address,
      p_user_agent: metadata.user_agent,
    })
  },

  /**
   * Setup 2FA - Generate secret, QR code, and backup codes
   * Note: Requires TOTP library (otplib or speakeasy) for full implementation
   */
  setup2FA: async (): Promise<TwoFactorSetup> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) throw new Error("Not authenticated")

    // Generate a random secret (32 bytes base32 encoded)
    // In production, use a proper TOTP library like 'otplib'
    const secret = Array.from({ length: 32 }, () => 
      Math.random().toString(36).charAt(2)
    ).join('').toUpperCase().slice(0, 32)

    // Generate backup codes
    const backupCodes = generateBackupCodes(10)

    // Generate QR code URL
    const qrCodeURL = generateQRCodeURL(secret, user.email)

    return {
      secret,
      qr_code_url: qrCodeURL,
      backup_codes: backupCodes,
    }
  },

  /**
   * Verify and enable 2FA
   */
  verifyAndEnable2FA: async (input: Verify2FAInput): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Note: In production, verify the token using a TOTP library
    // For now, we'll just store the secret and enable 2FA
    // The actual verification should be done server-side

    const backupCodes = generateBackupCodes(10)

    const { error } = await supabase
      .from("user_profiles")
      .update({
        two_factor_enabled: true,
        two_factor_secret: input.secret, // Should be encrypted in production
        backup_codes: backupCodes,
      })
      .eq("user_id", user.id)

    if (error) throw error

    // Create audit log
    const metadata = getClientMetadata()
    await supabase.rpc('create_audit_log', {
      p_user_id: user.id,
      p_action_type: '2fa_enabled',
      p_action_details: {},
      p_ip_address: metadata.ip_address,
      p_user_agent: metadata.user_agent,
    })
  },

  /**
   * Enable 2FA (legacy - kept for backward compatibility)
   */
  enable2FA: async (secret: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const backupCodes = generateBackupCodes(10)

    const { error } = await supabase
      .from("user_profiles")
      .update({
        two_factor_enabled: true,
        two_factor_secret: secret, // Should be encrypted in production
        backup_codes: backupCodes,
      })
      .eq("user_id", user.id)

    if (error) throw error

    // Create audit log
    const metadata = getClientMetadata()
    await supabase.rpc('create_audit_log', {
      p_user_id: user.id,
      p_action_type: '2fa_enabled',
      p_action_details: {},
      p_ip_address: metadata.ip_address,
      p_user_agent: metadata.user_agent,
    })
  },

  /**
   * Disable 2FA
   */
  disable2FA: async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase
      .from("user_profiles")
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        backup_codes: [],
      })
      .eq("user_id", user.id)

    if (error) throw error

    // Create audit log
    const metadata = getClientMetadata()
    await supabase.rpc('create_audit_log', {
      p_user_id: user.id,
      p_action_type: '2fa_disabled',
      p_action_details: {},
      p_ip_address: metadata.ip_address,
      p_user_agent: metadata.user_agent,
    })
  },

  /**
   * Get active sessions
   */
  getActiveSessions: async (): Promise<UserSession[]> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("last_activity_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Terminate a session
   */
  terminateSession: async (sessionId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase
      .from("user_sessions")
      .update({ is_active: false })
      .eq("id", sessionId)
      .eq("user_id", user.id)

    if (error) throw error

    // Create audit log
    const metadata = getClientMetadata()
    await supabase.rpc('create_audit_log', {
      p_user_id: user.id,
      p_action_type: 'session_terminated',
      p_action_details: { session_id: sessionId },
      p_ip_address: metadata.ip_address,
      p_user_agent: metadata.user_agent,
    })
  },

  /**
   * Logout everywhere (terminate all sessions except current)
   */
  logoutEverywhere: async (): Promise<void> => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Not authenticated")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Terminate all sessions except current
    const { error } = await supabase
      .from("user_sessions")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .neq("session_token", session.access_token)

    if (error) throw error

    // Create audit log
    const metadata = getClientMetadata()
    await supabase.rpc('create_audit_log', {
      p_user_id: user.id,
      p_action_type: 'logout_everywhere',
      p_action_details: {},
      p_ip_address: metadata.ip_address,
      p_user_agent: metadata.user_agent,
    })
  },

  /**
   * Export user data
   */
  exportData: async (): Promise<Blob> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Fetch all user data
    const [profile, sessions, agents, agentSessions, avatars, auditLogs] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("user_sessions").select("*").eq("user_id", user.id),
      supabase.from("agents").select("*").eq("user_id", user.id),
      supabase.from("sessions").select("*").eq("user_id", user.id),
      supabase.from("avatars").select("*").eq("user_id", user.id),
      supabase.from("audit_logs").select("*").eq("user_id", user.id).order("timestamp", { ascending: false }),
    ])

    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        email_verified: !!user.email_confirmed_at,
        created_at: user.created_at,
      },
      profile: profile.data,
      sessions: sessions.data,
      agents: agents.data,
      agent_sessions: agentSessions.data,
      avatars: avatars.data,
      audit_logs: auditLogs.data,
      exported_at: new Date().toISOString(),
    }

    // Create audit log
    const metadata = getClientMetadata()
    await supabase.rpc('create_audit_log', {
      p_user_id: user.id,
      p_action_type: 'data_export',
      p_action_details: {},
      p_ip_address: metadata.ip_address,
      p_user_agent: metadata.user_agent,
    })

    // Convert to JSON blob
    const json = JSON.stringify(exportData, null, 2)
    return new Blob([json], { type: "application/json" })
  },

  /**
   * Delete account (soft delete)
   * Note: Account deletion requires a backend API endpoint with service role key
   * This function signs out the user and marks the account for deletion
   * The actual deletion should be handled by a Supabase Edge Function or backend API
   */
  deleteAccount: async (reason?: string): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Generate restore token
    const { data: tokenData, error: tokenError } = await supabase.rpc('generate_restore_token')
    if (tokenError) throw tokenError

    const restoreToken = tokenData || Array.from({ length: 32 }, () => 
      Math.random().toString(36).charAt(2)
    ).join('').toUpperCase()

    // Create soft delete record
    const metadata = getClientMetadata()
    const { error: softDeleteError } = await supabase
      .from("soft_deletes")
      .insert({
        user_id: user.id,
        restore_token: restoreToken,
        deletion_reason: reason || null,
        ip_address: metadata.ip_address,
        user_agent: metadata.user_agent,
      })

    if (softDeleteError) throw softDeleteError

    // Create audit log
    await supabase.rpc('create_audit_log', {
      p_user_id: user.id,
      p_action_type: 'account_deletion_requested',
      p_action_details: { reason: reason || null },
      p_ip_address: metadata.ip_address,
      p_user_agent: metadata.user_agent,
    })

    // Mark profile for deletion
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({ 
        metadata: { 
          deleted: true, 
          deleted_at: new Date().toISOString(),
          deletion_requested: true,
          restore_token: restoreToken,
        } 
      })
      .eq("user_id", user.id)

    if (profileError) throw profileError

    // Sign out the user
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) throw signOutError

    // Note: Actual user deletion from auth.users requires a backend API with service role key
    // This should be handled by a Supabase Edge Function that processes deletion requests
    
    return restoreToken
  },

  /**
   * Get audit logs for current user
   */
  getAuditLogs: async (limit: number = 50): Promise<AuditLog[]> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("timestamp", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  },

  /**
   * Get avatars for current user
   */
  getAvatars: async (): Promise<Avatar[]> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("avatars")
      .select("*")
      .eq("user_id", user.id)
      .order("upload_date", { ascending: false })

    if (error) throw error
    return data || []
  },
}
