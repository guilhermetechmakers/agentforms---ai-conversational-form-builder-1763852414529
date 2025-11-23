import { api } from "@/lib/api"
import type {
  Organization,
  OrganizationUpdate,
  OrganizationWithUser,
  SystemMetric,
  SystemMetricInsert,
  SystemMetricsSummary,
  MetricTimeSeries,
  AuditLog,
  AuditLogInsert,
  AuditLogFilters,
  ModerationQueueItem,
  ModerationQueueItemInsert,
  ModerationQueueItemUpdate,
  ModerationQueueItemWithDetails,
  AdminDashboardData,
  UserManagementUser,
  UserManagementFilters,
  UserActionRequest,
  BillingOverview,
} from "@/types/admin"

export const adminApi = {
  // =====================================================
  // Dashboard Overview
  // =====================================================
  getDashboardData: async (): Promise<AdminDashboardData> => {
    return api.get<AdminDashboardData>("/admin/dashboard")
  },

  // =====================================================
  // System Metrics
  // =====================================================
  getMetricsSummary: async (): Promise<SystemMetricsSummary> => {
    return api.get<SystemMetricsSummary>("/admin/metrics/summary")
  },

  getMetricsTimeSeries: async (
    metricType: string,
    startDate?: string,
    endDate?: string
  ): Promise<MetricTimeSeries[]> => {
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)
    return api.get<MetricTimeSeries[]>(
      `/admin/metrics/${metricType}/timeseries?${params.toString()}`
    )
  },

  createMetric: async (metric: SystemMetricInsert): Promise<SystemMetric> => {
    return api.post<SystemMetric>("/admin/metrics", metric)
  },

  // =====================================================
  // Organizations
  // =====================================================
  getOrganizations: async (
    filters?: {
      search?: string
      status?: string
      page?: number
      pageSize?: number
    }
  ): Promise<{ organizations: OrganizationWithUser[]; total: number; totalPages: number }> => {
    const params = new URLSearchParams()
    if (filters?.search) params.append("search", filters.search)
    if (filters?.status) params.append("status", filters.status)
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.pageSize) params.append("page_size", filters.pageSize.toString())
    return api.get<{ organizations: OrganizationWithUser[]; total: number; totalPages: number }>(
      `/admin/organizations?${params.toString()}`
    )
  },

  getOrganizationById: async (id: string): Promise<OrganizationWithUser> => {
    return api.get<OrganizationWithUser>(`/admin/organizations/${id}`)
  },

  updateOrganization: async (
    id: string,
    data: OrganizationUpdate
  ): Promise<Organization> => {
    return api.patch<Organization>(`/admin/organizations/${id}`, data)
  },

  // =====================================================
  // User Management
  // =====================================================
  getUsers: async (
    filters?: UserManagementFilters
  ): Promise<{ users: UserManagementUser[]; total: number; totalPages: number }> => {
    const params = new URLSearchParams()
    if (filters?.search) params.append("search", filters.search)
    if (filters?.role) params.append("role", filters.role)
    if (filters?.status) params.append("status", filters.status)
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.pageSize) params.append("page_size", filters.pageSize.toString())
    return api.get<{ users: UserManagementUser[]; total: number; totalPages: number }>(
      `/admin/users?${params.toString()}`
    )
  },

  getUserById: async (id: string): Promise<UserManagementUser> => {
    return api.get<UserManagementUser>(`/admin/users/${id}`)
  },

  performUserAction: async (request: UserActionRequest): Promise<void> => {
    return api.post<void>("/admin/users/actions", request)
  },

  impersonateUser: async (userId: string): Promise<{ token: string }> => {
    return api.post<{ token: string }>(`/admin/users/${userId}/impersonate`, {})
  },

  // =====================================================
  // Moderation Queue
  // =====================================================
  getModerationQueue: async (
    filters?: {
      status?: string
      report_type?: string
      page?: number
      pageSize?: number
    }
  ): Promise<{
    items: ModerationQueueItemWithDetails[]
    total: number
    totalPages: number
  }> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.report_type) params.append("report_type", filters.report_type)
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.pageSize) params.append("page_size", filters.pageSize.toString())
    return api.get<{
      items: ModerationQueueItemWithDetails[]
      total: number
      totalPages: number
    }>(`/admin/moderation?${params.toString()}`)
  },

  getModerationItem: async (id: string): Promise<ModerationQueueItemWithDetails> => {
    return api.get<ModerationQueueItemWithDetails>(`/admin/moderation/${id}`)
  },

  updateModerationItem: async (
    id: string,
    data: ModerationQueueItemUpdate
  ): Promise<ModerationQueueItem> => {
    return api.patch<ModerationQueueItem>(`/admin/moderation/${id}`, data)
  },

  createModerationReport: async (
    data: ModerationQueueItemInsert
  ): Promise<ModerationQueueItem> => {
    return api.post<ModerationQueueItem>("/admin/moderation", data)
  },

  // =====================================================
  // Audit Logs
  // =====================================================
  getAuditLogs: async (
    filters?: AuditLogFilters
  ): Promise<{ logs: AuditLog[]; total: number; totalPages: number }> => {
    const params = new URLSearchParams()
    if (filters?.event_type) params.append("event_type", filters.event_type)
    if (filters?.resource_type) params.append("resource_type", filters.resource_type)
    if (filters?.user_id) params.append("user_id", filters.user_id)
    if (filters?.start_date) params.append("start_date", filters.start_date)
    if (filters?.end_date) params.append("end_date", filters.end_date)
    if (filters?.search) params.append("search", filters.search)
    if (filters?.page) params.append("page", filters.page.toString())
    if (filters?.pageSize) params.append("page_size", filters.pageSize.toString())
    return api.get<{ logs: AuditLog[]; total: number; totalPages: number }>(
      `/admin/audit-logs?${params.toString()}`
    )
  },

  createAuditLog: async (log: AuditLogInsert): Promise<AuditLog> => {
    return api.post<AuditLog>("/admin/audit-logs", log)
  },

  // =====================================================
  // Billing Overview
  // =====================================================
  getBillingOverview: async (): Promise<BillingOverview> => {
    return api.get<BillingOverview>("/admin/billing/overview")
  },
}
