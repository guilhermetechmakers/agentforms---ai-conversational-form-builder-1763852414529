import { supabase } from "@/lib/supabase"
import type { 
  UserProfile, 
  UserProfileUpdate, 
  UpdateProfileInput,
  ChangePasswordInput,
  UserSession 
} from "@/types/profile"

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
      return data
    }
  },

  /**
   * Upload avatar image
   */
  uploadAvatar: async (file: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/avatar.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath)

    return data.publicUrl
  },

  /**
   * Change password
   */
  changePassword: async (input: ChangePasswordInput): Promise<void> => {
    if (input.new_password !== input.confirm_password) {
      throw new Error("New passwords do not match")
    }

    // Verify current password by attempting to sign in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) throw new Error("Not authenticated")

    // Note: Supabase doesn't provide a direct way to verify current password
    // We'll need to handle this on the backend or use a different approach
    // For now, we'll update the password directly (backend should verify)
    const { error } = await supabase.auth.updateUser({
      password: input.new_password,
    })

    if (error) throw error
  },

  /**
   * Enable 2FA
   */
  enable2FA: async (secret: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase
      .from("user_profiles")
      .update({
        two_factor_enabled: true,
        two_factor_secret: secret, // Should be encrypted in production
      })
      .eq("user_id", user.id)

    if (error) throw error
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
      })
      .eq("user_id", user.id)

    if (error) throw error
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
  },

  /**
   * Export user data
   */
  exportData: async (): Promise<Blob> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Fetch all user data
    const [profile, sessions, agents, agentSessions] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("user_sessions").select("*").eq("user_id", user.id),
      supabase.from("agents").select("*").eq("user_id", user.id),
      supabase.from("sessions").select("*").eq("user_id", user.id),
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
      exported_at: new Date().toISOString(),
    }

    // Convert to JSON blob
    const json = JSON.stringify(exportData, null, 2)
    return new Blob([json], { type: "application/json" })
  },

  /**
   * Delete account
   * Note: Account deletion requires a backend API endpoint with service role key
   * This function signs out the user and marks the account for deletion
   * The actual deletion should be handled by a Supabase Edge Function or backend API
   */
  deleteAccount: async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Mark profile for deletion (soft delete)
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({ 
        metadata: { 
          deleted: true, 
          deleted_at: new Date().toISOString(),
          deletion_requested: true 
        } 
      })
      .eq("user_id", user.id)

    if (profileError) throw profileError

    // Sign out the user
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) throw signOutError

    // Note: Actual user deletion from auth.users requires a backend API with service role key
    // This should be handled by a Supabase Edge Function that processes deletion requests
  },
}
