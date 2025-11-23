import { supabase } from "@/lib/supabase"
import type {
  Export,
  ExportInsert,
  ExportSchedule,
  ExportScheduleInsert,
  ExportScheduleUpdate,
  CreateExportRequest,
  CreateExportResponse,
  CreateScheduleRequest,
  CreateScheduleResponse,
  ExportListResponse,
  ScheduleListResponse,
} from "@/types/export"
import { sessionsApi } from "./sessions"
import { agentsApi } from "./agents"

export const exportsApi = {
  /**
   * Create a new export request
   */
  create: async (request: CreateExportRequest): Promise<CreateExportResponse> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Create export record with pending status
    const exportInsert: ExportInsert = {
      user_id: user.id,
      data_type: request.data_type,
      format: request.format,
      status: 'pending',
      filters: request.filters || {},
    }

    const { data: exportData, error } = await supabase
      .from("exports")
      .insert(exportInsert)
      .select()
      .single()

    if (error) throw error

    // Generate export asynchronously (in a real app, this would be a background job)
    // For now, we'll generate it immediately
    try {
      const exportResult = await exportsApi.generateExport(exportData.id, request)
      return {
        export: exportResult.export,
        download_url: exportResult.download_url,
      }
    } catch (err) {
      // Update export status to failed
      await supabase
        .from("exports")
        .update({
          status: 'failed',
          error_message: err instanceof Error ? err.message : 'Unknown error',
          error_details: { error: String(err) },
        })
        .eq("id", exportData.id)

      throw err
    }
  },

  /**
   * Generate export file and create signed URL
   */
  generateExport: async (
    exportId: string,
    request: CreateExportRequest
  ): Promise<{ export: Export; download_url: string }> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Update status to processing
    await supabase
      .from("exports")
      .update({ status: 'processing' })
      .eq("id", exportId)

    let blob: Blob
    let fileName: string

    // Generate export based on data type
    if (request.data_type === 'sessions' || request.data_type === 'all') {
      // Get session IDs from filters
      const sessionFilters: any = {
        agent_id: request.filters?.agent_ids?.[0] || request.filters?.agent_id,
        status: request.filters?.status,
        date_from: request.filters?.date_from,
        date_to: request.filters?.date_to,
        search: request.filters?.search,
      }

      // Fetch all sessions (no pagination for exports)
      const sessionsData = await sessionsApi.getAll({ ...sessionFilters, page: 1, pageSize: 10000 })
      const sessionIds = sessionsData.sessions.map(s => s.id)

      if (sessionIds.length === 0) {
        throw new Error("No sessions found matching the filters")
      }

      // Generate export blob
      blob = await sessionsApi.export(sessionIds, request.format)
      fileName = `sessions-export-${Date.now()}.${request.format}`
    } else {
      // Export agents
      const agentsData = await agentsApi.getAll({ status: 'all' })
      const agents = agentsData.agents || []

      if (request.format === 'csv') {
        const headers = ["ID", "Name", "Description", "Status", "Created At", "Updated At"]
        const rows = agents.map(agent => [
          agent.id,
          agent.name,
          agent.description || "",
          agent.status,
          agent.created_at,
          agent.updated_at,
        ])

        const csvContent = [
          headers.join(","),
          ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        ].join("\n")

        blob = new Blob([csvContent], { type: "text/csv" })
      } else {
        blob = new Blob([JSON.stringify(agents, null, 2)], { type: "application/json" })
      }
      fileName = `agents-export-${Date.now()}.${request.format}`
    }

    // Upload to Supabase Storage (exports bucket)
    const fileExt = request.format
    const filePath = `${user.id}/${exportId}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("exports")
      .upload(filePath, blob, {
        contentType: request.format === 'csv' ? 'text/csv' : 'application/json',
        upsert: false,
      })

    if (uploadError) {
      // If bucket doesn't exist, create a download URL from blob
      const url = window.URL.createObjectURL(blob)
      const downloadUrl = url

      // Update export record
      const { data: updatedExport, error: updateError } = await supabase
        .from("exports")
        .update({
          status: 'completed',
          file_name: fileName,
          file_size_bytes: blob.size,
          download_url: downloadUrl,
          download_url_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          completed_at: new Date().toISOString(),
        })
        .eq("id", exportId)
        .select()
        .single()

      if (updateError) throw updateError
      return { export: updatedExport as Export, download_url: downloadUrl }
    }

    // Create signed URL (valid for 24 hours)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("exports")
      .createSignedUrl(filePath, 24 * 60 * 60) // 24 hours

    if (signedUrlError) throw signedUrlError

    // Update export record
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const { data: updatedExport, error: updateError } = await supabase
      .from("exports")
      .update({
        status: 'completed',
        file_name: fileName,
        file_size_bytes: blob.size,
        download_url: signedUrlData.signedUrl,
        download_url_expires_at: expiresAt,
        completed_at: new Date().toISOString(),
      })
      .eq("id", exportId)
      .select()
      .single()

    if (updateError) throw updateError

    return {
      export: updatedExport as Export,
      download_url: signedUrlData.signedUrl,
    }
  },

  /**
   * Get all exports for the current user
   */
  getAll: async (page: number = 1, pageSize: number = 20): Promise<ExportListResponse> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from("exports")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) throw error

    return {
      exports: (data || []) as Export[],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    }
  },

  /**
   * Get export by ID
   */
  getById: async (id: string): Promise<Export> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("exports")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error) throw error
    return data as Export
  },

  /**
   * Delete export
   */
  delete: async (id: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase
      .from("exports")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) throw error
  },

  /**
   * Refresh download URL (if expired)
   */
  refreshDownloadUrl: async (id: string): Promise<string> => {
    const exportData = await exportsApi.getById(id)

    if (exportData.status !== 'completed' || !exportData.download_url) {
      throw new Error("Export is not completed or has no download URL")
    }

    // Check if URL is expired
    const expiresAt = exportData.download_url_expires_at
    if (expiresAt && new Date(expiresAt) > new Date()) {
      // URL is still valid
      return exportData.download_url
    }

    // Regenerate signed URL
    const filePath = `${exportData.user_id}/${id}.${exportData.format}`
    const { data: signedUrlData, error } = await supabase.storage
      .from("exports")
      .createSignedUrl(filePath, 24 * 60 * 60)

    if (error) throw error

    // Update export record
    const expiresAtNew = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    await supabase
      .from("exports")
      .update({
        download_url: signedUrlData.signedUrl,
        download_url_expires_at: expiresAtNew,
      })
      .eq("id", id)

    return signedUrlData.signedUrl
  },

  // =====================================================
  // Export Schedules
  // =====================================================

  /**
   * Create a new export schedule
   */
  createSchedule: async (request: CreateScheduleRequest): Promise<CreateScheduleResponse> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Calculate next run time based on frequency
    const nextRunAt = calculateNextRunTime(request.frequency, request.frequency_config)

    const scheduleInsert: ExportScheduleInsert = {
      user_id: user.id,
      name: request.name,
      description: request.description,
      enabled: true,
      data_type: request.data_type,
      format: request.format,
      filters: request.filters || {},
      frequency: request.frequency,
      frequency_config: request.frequency_config || {},
      delivery_method: request.delivery_method || 'download',
      webhook_url: request.webhook_url || null,
      webhook_headers: request.webhook_headers || {},
      webhook_auth_type: request.webhook_auth_type || null,
      webhook_auth_config: request.webhook_auth_config || {},
      next_run_at: nextRunAt,
    }

    const { data, error } = await supabase
      .from("export_schedules")
      .insert(scheduleInsert)
      .select()
      .single()

    if (error) throw error

    return { schedule: data as ExportSchedule }
  },

  /**
   * Get all schedules for the current user
   */
  getAllSchedules: async (): Promise<ScheduleListResponse> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error, count } = await supabase
      .from("export_schedules")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return {
      schedules: (data || []) as ExportSchedule[],
      total: count || 0,
    }
  },

  /**
   * Get schedule by ID
   */
  getScheduleById: async (id: string): Promise<ExportSchedule> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("export_schedules")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error) throw error
    return data as ExportSchedule
  },

  /**
   * Update schedule
   */
  updateSchedule: async (id: string, update: ExportScheduleUpdate): Promise<ExportSchedule> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Recalculate next_run_at if frequency changed
    if (update.frequency || update.frequency_config) {
      const currentSchedule = await exportsApi.getScheduleById(id)
      const frequency = update.frequency || currentSchedule.frequency
      const frequencyConfig = update.frequency_config || currentSchedule.frequency_config
      update.next_run_at = calculateNextRunTime(frequency, frequencyConfig)
    }

    const { data, error } = await supabase
      .from("export_schedules")
      .update(update)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error
    return data as ExportSchedule
  },

  /**
   * Delete schedule
   */
  deleteSchedule: async (id: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase
      .from("export_schedules")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) throw error
  },

  /**
   * Toggle schedule enabled status
   */
  toggleSchedule: async (id: string, enabled: boolean): Promise<ExportSchedule> => {
    return exportsApi.updateSchedule(id, { enabled })
  },
}

/**
 * Calculate next run time based on frequency
 */
function calculateNextRunTime(
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom',
  config?: Record<string, any>
): string {
  const now = new Date()
  let nextRun: Date

  switch (frequency) {
    case 'daily':
      nextRun = new Date(now)
      nextRun.setDate(nextRun.getDate() + 1)
      nextRun.setHours(config?.hour || 0, config?.minute || 0, 0, 0)
      break
    case 'weekly':
      nextRun = new Date(now)
      const daysUntilNext = (config?.dayOfWeek || 0) - now.getDay()
      nextRun.setDate(nextRun.getDate() + (daysUntilNext <= 0 ? daysUntilNext + 7 : daysUntilNext))
      nextRun.setHours(config?.hour || 0, config?.minute || 0, 0, 0)
      break
    case 'monthly':
      nextRun = new Date(now)
      nextRun.setMonth(nextRun.getMonth() + 1)
      nextRun.setDate(config?.dayOfMonth || 1)
      nextRun.setHours(config?.hour || 0, config?.minute || 0, 0, 0)
      break
    case 'custom':
      // For custom, we'd parse a cron expression or use config
      // For now, default to daily
      nextRun = new Date(now)
      nextRun.setDate(nextRun.getDate() + 1)
      break
    default:
      nextRun = new Date(now)
      nextRun.setDate(nextRun.getDate() + 1)
  }

  return nextRun.toISOString()
}
