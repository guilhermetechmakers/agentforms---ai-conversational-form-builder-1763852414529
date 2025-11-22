import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { errorApi } from "@/api/errors"
import type { ErrorReportInsert } from "@/types/error"
import { toast } from "sonner"

// Query keys
export const errorKeys = {
  all: ["errors"] as const,
  reports: () => [...errorKeys.all, "reports"] as const,
  report: (id: string) => [...errorKeys.reports(), id] as const,
}

// Create error report mutation
export function useCreateErrorReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (report: ErrorReportInsert) => errorApi.createErrorReport(report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: errorKeys.reports() })
      toast.success("Error report submitted successfully", {
        description: "Thank you for helping us improve. We'll investigate this issue.",
      })
    },
    onError: (error: Error) => {
      toast.error("Failed to submit error report", {
        description: error.message || "Please try again later.",
      })
    },
  })
}

// Get user's error reports
export function useErrorReports() {
  return useQuery({
    queryKey: errorKeys.reports(),
    queryFn: () => errorApi.getMyErrorReports(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Get a specific error report
export function useErrorReport(id: string) {
  return useQuery({
    queryKey: errorKeys.report(id),
    queryFn: () => errorApi.getErrorReport(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
