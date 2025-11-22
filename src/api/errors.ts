import { api } from "@/lib/api"
import type { ErrorReport, ErrorReportInsert } from "@/types/error"

export const errorApi = {
  // Create an error report
  createErrorReport: async (report: ErrorReportInsert): Promise<ErrorReport> => {
    return api.post<ErrorReport>("/errors/reports", report)
  },

  // Get error reports for the current user
  getMyErrorReports: async (): Promise<ErrorReport[]> => {
    return api.get<ErrorReport[]>("/errors/reports")
  },

  // Get a specific error report
  getErrorReport: async (id: string): Promise<ErrorReport> => {
    return api.get<ErrorReport>(`/errors/reports/${id}`)
  },
}
