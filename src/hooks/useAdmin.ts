import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/api/admin"
import { toast } from "sonner"
import type {
  OrganizationUpdate,
  ModerationQueueItemUpdate,
  AuditLogFilters,
  UserManagementFilters,
} from "@/types/admin"

export const adminKeys = {
  all: ["admin"] as const,
  dashboard: () => [...adminKeys.all, "dashboard"] as const,
  metrics: () => [...adminKeys.all, "metrics"] as const,
  metricsSummary: () => [...adminKeys.metrics(), "summary"] as const,
  metricsTimeSeries: (type: string, startDate?: string, endDate?: string) =>
    [...adminKeys.metrics(), "timeseries", type, startDate, endDate] as const,
  organizations: () => [...adminKeys.all, "organizations"] as const,
  organizationsList: (filters?: any) =>
    [...adminKeys.organizations(), "list", filters] as const,
  organization: (id: string) => [...adminKeys.organizations(), id] as const,
  users: () => [...adminKeys.all, "users"] as const,
  usersList: (filters?: UserManagementFilters) =>
    [...adminKeys.users(), "list", filters] as const,
  user: (id: string) => [...adminKeys.users(), id] as const,
  moderation: () => [...adminKeys.all, "moderation"] as const,
  moderationList: (filters?: any) =>
    [...adminKeys.moderation(), "list", filters] as const,
  moderationItem: (id: string) => [...adminKeys.moderation(), id] as const,
  auditLogs: () => [...adminKeys.all, "audit-logs"] as const,
  auditLogsList: (filters?: AuditLogFilters) =>
    [...adminKeys.auditLogs(), "list", filters] as const,
  billing: () => [...adminKeys.all, "billing"] as const,
  billingOverview: () => [...adminKeys.billing(), "overview"] as const,
}

// =====================================================
// Dashboard
// =====================================================
export const useAdminDashboard = () => {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: adminApi.getDashboardData,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })
}

// =====================================================
// Metrics
// =====================================================
export const useMetricsSummary = () => {
  return useQuery({
    queryKey: adminKeys.metricsSummary(),
    queryFn: adminApi.getMetricsSummary,
    staleTime: 1000 * 60 * 2,
  })
}

export const useMetricsTimeSeries = (
  metricType: string,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: adminKeys.metricsTimeSeries(metricType, startDate, endDate),
    queryFn: () => adminApi.getMetricsTimeSeries(metricType, startDate, endDate),
    enabled: !!metricType,
    staleTime: 1000 * 60 * 5,
  })
}

export const useCreateMetric = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminApi.createMetric,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.metrics() })
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() })
      toast.success("Metric created successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to create metric: ${error.message}`)
    },
  })
}

// =====================================================
// Organizations
// =====================================================
export const useOrganizations = (filters?: {
  search?: string
  status?: string
  page?: number
  pageSize?: number
}) => {
  return useQuery({
    queryKey: adminKeys.organizationsList(filters),
    queryFn: () => adminApi.getOrganizations(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export const useOrganization = (id: string) => {
  return useQuery({
    queryKey: adminKeys.organization(id),
    queryFn: () => adminApi.getOrganizationById(id),
    enabled: !!id,
  })
}

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrganizationUpdate }) =>
      adminApi.updateOrganization(id, data),
    onSuccess: (updatedOrg, variables) => {
      queryClient.setQueryData(adminKeys.organization(variables.id), updatedOrg)
      queryClient.invalidateQueries({ queryKey: adminKeys.organizationsList() })
      toast.success("Organization updated successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to update organization: ${error.message}`)
    },
  })
}

// =====================================================
// User Management
// =====================================================
export const useUsers = (filters?: UserManagementFilters) => {
  return useQuery({
    queryKey: adminKeys.usersList(filters),
    queryFn: () => adminApi.getUsers(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export const useUser = (id: string) => {
  return useQuery({
    queryKey: adminKeys.user(id),
    queryFn: () => adminApi.getUserById(id),
    enabled: !!id,
  })
}

export const useUserAction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminApi.performUserAction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.user(variables.user_id) })
      queryClient.invalidateQueries({ queryKey: adminKeys.usersList() })
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() })
      toast.success("User action performed successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to perform user action: ${error.message}`)
    },
  })
}

export const useImpersonateUser = () => {
  return useMutation({
    mutationFn: adminApi.impersonateUser,
    onSuccess: (data) => {
      // Store impersonation token and redirect
      localStorage.setItem("impersonation_token", data.token)
      toast.success("Impersonation started. Redirecting...")
      window.location.href = "/dashboard"
    },
    onError: (error: Error) => {
      toast.error(`Failed to impersonate user: ${error.message}`)
    },
  })
}

// =====================================================
// Moderation Queue
// =====================================================
export const useModerationQueue = (filters?: {
  status?: string
  report_type?: string
  page?: number
  pageSize?: number
}) => {
  return useQuery({
    queryKey: adminKeys.moderationList(filters),
    queryFn: () => adminApi.getModerationQueue(filters),
    staleTime: 1000 * 60 * 2,
  })
}

export const useModerationItem = (id: string) => {
  return useQuery({
    queryKey: adminKeys.moderationItem(id),
    queryFn: () => adminApi.getModerationItem(id),
    enabled: !!id,
  })
}

export const useUpdateModerationItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ModerationQueueItemUpdate }) =>
      adminApi.updateModerationItem(id, data),
    onSuccess: (updatedItem, variables) => {
      queryClient.setQueryData(adminKeys.moderationItem(variables.id), updatedItem)
      queryClient.invalidateQueries({ queryKey: adminKeys.moderationList() })
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() })
      toast.success("Moderation item updated successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to update moderation item: ${error.message}`)
    },
  })
}

export const useCreateModerationReport = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminApi.createModerationReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.moderationList() })
      toast.success("Report submitted successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit report: ${error.message}`)
    },
  })
}

// =====================================================
// Audit Logs
// =====================================================
export const useAuditLogs = (filters?: AuditLogFilters) => {
  return useQuery({
    queryKey: adminKeys.auditLogsList(filters),
    queryFn: () => adminApi.getAuditLogs(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export const useCreateAuditLog = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adminApi.createAuditLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.auditLogsList() })
    },
    onError: (error: Error) => {
      toast.error(`Failed to create audit log: ${error.message}`)
    },
  })
}

// =====================================================
// Billing Overview
// =====================================================
export const useBillingOverview = () => {
  return useQuery({
    queryKey: adminKeys.billingOverview(),
    queryFn: adminApi.getBillingOverview,
    staleTime: 1000 * 60 * 5,
  })
}
