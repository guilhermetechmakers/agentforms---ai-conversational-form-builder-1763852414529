import { supabase } from "./supabase"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const storageApi = {
  /**
   * Upload a file to Supabase Storage
   * @param bucket - Storage bucket name
   * @param file - File to upload
   * @param path - Path within the bucket (e.g., 'avatars/user-123.jpg')
   * @returns Public URL of the uploaded file
   */
  uploadFile: async (
    bucket: string,
    file: File,
    path: string
  ): Promise<string> => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`)
    }

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Upload file
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      })

    if (error) throw error

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path)

    return publicUrl
  },

  /**
   * Delete a file from Supabase Storage
   * @param bucket - Storage bucket name
   * @param path - Path to the file
   */
  deleteFile: async (bucket: string, path: string): Promise<void> => {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) throw error
  },

  /**
   * Upload an agent avatar
   * @param agentId - Agent ID
   * @param file - Image file
   * @returns Public URL of the uploaded avatar
   */
  uploadAgentAvatar: async (agentId: string, file: File): Promise<string> => {
    const extension = file.name.split(".").pop() || "jpg"
    const path = `agents/${agentId}/avatar.${extension}`
    return storageApi.uploadFile("agent-assets", file, path)
  },

  /**
   * Upload an agent logo
   * @param agentId - Agent ID
   * @param file - Image file
   * @returns Public URL of the uploaded logo
   */
  uploadAgentLogo: async (agentId: string, file: File): Promise<string> => {
    const extension = file.name.split(".").pop() || "png"
    const path = `agents/${agentId}/logo.${extension}`
    return storageApi.uploadFile("agent-assets", file, path)
  },

  /**
   * Upload a knowledge base file
   * @param agentId - Agent ID
   * @param file - File to upload
   * @returns Public URL of the uploaded file
   */
  uploadKnowledgeFile: async (agentId: string, file: File): Promise<string> => {
    const timestamp = Date.now()
    const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const path = `agents/${agentId}/knowledge/${timestamp}-${filename}`
    return storageApi.uploadFile("agent-assets", file, path)
  },
}
