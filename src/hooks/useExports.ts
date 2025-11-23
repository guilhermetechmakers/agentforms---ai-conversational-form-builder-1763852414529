import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { exportsApi } from "@/api/exports"
import type {
  CreateExportRequest,
  CreateScheduleRequest,
  ExportScheduleUpdate,
} from "@/types/export"
import { toast } from "sonner"

export const exportKeys = {
  all: ["exports"] as const,
  lists: () => [...exportKeys.all, "list"] as const,
  list: (page?: number, pageSize?: number) => [...exportKeys.lists(), { page, pageSize }] as const,
  details: () => [...exportKeys.all, "detail"] as const,
  detail: (id: string) => [...exportKeys.details(), id] as const,
  schedules: () => [...exportKeys.all, "schedules"] as const,
  schedule: (id: string) => [...exportKeys.schedules(), id] as const,
}

/**
 * Get all exports for the current user
 */
export const useExports = (page: number = 1, pageSize: number = 20) => {
  return useQuery({
    queryKey: exportKeys.list(page, pageSize),
    queryFn: () => exportsApi.getAll(page, pageSize),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Get export by ID
 */
export const useExport = (id: string) => {
  return useQuery({
    queryKey: exportKeys.detail(id),
    queryFn: () => exportsApi.getById(id),
    enabled: !!id,
  })
}

/**
 * Create a new export
 */
export const useCreateExport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateExportRequest) => exportsApi.create(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: exportKeys.lists() })
      toast.success("Export created successfully! Download link is ready.")
      
      // Trigger download if URL is available
      if (data.download_url) {
        const link = document.createElement("a")
        link.href = data.download_url
        link.download = data.export.file_name || `export-${data.export.id}.${data.export.format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to create export: ${error.message}`)
    },
  })
}

/**
 * Delete an export
 */
export const useDeleteExport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: exportsApi.delete,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: exportKeys.detail(deletedId) })
      queryClient.invalidateQueries({ queryKey: exportKeys.lists() })
      toast.success("Export deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete export: ${error.message}`)
    },
  })
}

/**
 * Refresh download URL for an export
 */
export const useRefreshExportUrl = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: exportsApi.refreshDownloadUrl,
    onSuccess: (url, exportId) => {
      queryClient.invalidateQueries({ queryKey: exportKeys.detail(exportId) })
      toast.success("Download link refreshed")
      
      // Trigger download
      const link = document.createElement("a")
      link.href = url
      link.download = `export-${exportId}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    onError: (error: Error) => {
      toast.error(`Failed to refresh download link: ${error.message}`)
    },
  })
}

/**
 * Download export file
 */
export const useDownloadExport = () => {
  return useMutation({
    mutationFn: async (exportId: string) => {
      const exportData = await exportsApi.getById(exportId)
      
      if (!exportData.download_url) {
        throw new Error("No download URL available")
      }

      // Check if URL is expired
      const expiresAt = exportData.download_url_expires_at
      if (expiresAt && new Date(expiresAt) < new Date()) {
        // Refresh URL
        const newUrl = await exportsApi.refreshDownloadUrl(exportId)
        return newUrl
      }

      return exportData.download_url
    },
    onSuccess: (url, exportId) => {
      const link = document.createElement("a")
      link.href = url
      link.download = `export-${exportId}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Download started")
    },
    onError: (error: Error) => {
      toast.error(`Failed to download export: ${error.message}`)
    },
  })
}

// =====================================================
// Export Schedules
// =====================================================

/**
 * Get all export schedules
 */
export const useExportSchedules = () => {
  return useQuery({
    queryKey: exportKeys.schedules(),
    queryFn: () => exportsApi.getAllSchedules(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Get schedule by ID
 */
export const useExportSchedule = (id: string) => {
  return useQuery({
    queryKey: exportKeys.schedule(id),
    queryFn: () => exportsApi.getScheduleById(id),
    enabled: !!id,
  })
}

/**
 * Create a new export schedule
 */
export const useCreateExportSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateScheduleRequest) => exportsApi.createSchedule(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exportKeys.schedules() })
      toast.success("Export schedule created successfully")
    },
    onError: (error: Error) => {
      toast.error(`Failed to create schedule: ${error.message}`)
    },
  })
}

/**
 * Update export schedule
 */
export const useUpdateExportSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, update }: { id: string; update: ExportScheduleUpdate }) =>
      exportsApi.updateSchedule(id, update),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: exportKeys.schedule(variables.id) })
      queryClient.invalidateQueries({ queryKey: exportKeys.schedules() })
      toast.success("Schedule updated successfully")
    },
    onError: (error: Error) => {
      toast.error(`Failed to update schedule: ${error.message}`)
    },
  })
}

/**
 * Delete export schedule
 */
export const useDeleteExportSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: exportsApi.deleteSchedule,
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: exportKeys.schedule(deletedId) })
      queryClient.invalidateQueries({ queryKey: exportKeys.schedules() })
      toast.success("Schedule deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete schedule: ${error.message}`)
    },
  })
}

/**
 * Toggle schedule enabled status
 */
export const useToggleExportSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      exportsApi.toggleSchedule(id, enabled),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: exportKeys.schedule(variables.id) })
      queryClient.invalidateQueries({ queryKey: exportKeys.schedules() })
      toast.success(`Schedule ${variables.enabled ? "enabled" : "disabled"}`)
    },
    onError: (error: Error) => {
      toast.error(`Failed to toggle schedule: ${error.message}`)
    },
  })
}
