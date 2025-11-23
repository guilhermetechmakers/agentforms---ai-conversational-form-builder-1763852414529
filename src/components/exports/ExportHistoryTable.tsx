import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Download,
  MoreVertical,
  Trash2,
  RefreshCw,
  FileText,
  FileJson,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { useExports, useDeleteExport, useDownloadExport, useRefreshExportUrl } from "@/hooks/useExports"
import { Skeleton } from "@/components/ui/skeleton"
import type { Export } from "@/types/export"

interface ExportHistoryTableProps {
  page?: number
  pageSize?: number
  onPageChange?: (page: number) => void
}

export function ExportHistoryTable({
  page = 1,
  pageSize = 20,
  onPageChange,
}: ExportHistoryTableProps) {
  const { data, isLoading } = useExports(page, pageSize)
  const deleteExport = useDeleteExport()
  const downloadExport = useDownloadExport()
  const refreshUrl = useRefreshExportUrl()

  const exports = data?.exports || []
  const totalPages = data?.totalPages || 1

  const getStatusBadge = (status: Export["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-[#4ADE80]/20 text-[#4ADE80] border-[#4ADE80]/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-[#60A5FA]/20 text-[#60A5FA] border-[#60A5FA]/30">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-[#F6D365]/20 text-[#F6D365] border-[#F6D365]/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-[#F87171]/20 text-[#F87171] border-[#F87171]/30">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      case "expired":
        return (
          <Badge className="bg-[#6B7280]/20 text-[#6B7280] border-[#6B7280]/30">
            <AlertCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const isUrlExpired = (exportItem: Export) => {
    if (!exportItem.download_url_expires_at) return false
    return new Date(exportItem.download_url_expires_at) < new Date()
  }

  const handleDownload = async (exportItem: Export) => {
    if (isUrlExpired(exportItem)) {
      await refreshUrl.mutateAsync(exportItem.id)
    } else {
      await downloadExport.mutateAsync(exportItem.id)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full bg-[#282A30]" />
        ))}
      </div>
    )
  }

  if (exports.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
        <p className="text-[#A1A1AA] text-lg font-medium mb-2">No exports yet</p>
        <p className="text-[#6B7280] text-sm">Create your first export to see it here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#303136] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[#303136] hover:bg-[#24262C]">
              <TableHead className="text-[#A1A1AA]">Data Type</TableHead>
              <TableHead className="text-[#A1A1AA]">Format</TableHead>
              <TableHead className="text-[#A1A1AA]">Status</TableHead>
              <TableHead className="text-[#A1A1AA]">File Size</TableHead>
              <TableHead className="text-[#A1A1AA]">Created</TableHead>
              <TableHead className="text-[#A1A1AA]">Expires</TableHead>
              <TableHead className="text-[#A1A1AA] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exports.map((exportItem) => (
              <TableRow
                key={exportItem.id}
                className="border-[#303136] hover:bg-[#282A30] transition-colors"
              >
                <TableCell className="text-[#F3F4F6]">
                  <div className="flex items-center gap-2">
                    {exportItem.data_type === "sessions" ? (
                      <FileText className="h-4 w-4 text-[#A1A1AA]" />
                    ) : exportItem.data_type === "agents" ? (
                      <FileText className="h-4 w-4 text-[#A1A1AA]" />
                    ) : (
                      <FileText className="h-4 w-4 text-[#A1A1AA]" />
                    )}
                    <span className="capitalize">{exportItem.data_type}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[#F3F4F6]">
                  <div className="flex items-center gap-2">
                    {exportItem.format === "csv" ? (
                      <FileText className="h-4 w-4 text-[#A1A1AA]" />
                    ) : (
                      <FileJson className="h-4 w-4 text-[#A1A1AA]" />
                    )}
                    <span className="uppercase">{exportItem.format}</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(exportItem.status)}</TableCell>
                <TableCell className="text-[#A1A1AA]">
                  {exportItem.file_size_bytes
                    ? `${(exportItem.file_size_bytes / 1024).toFixed(2)} KB`
                    : "-"}
                </TableCell>
                <TableCell className="text-[#A1A1AA]">
                  <div className="flex flex-col">
                    <span>{format(new Date(exportItem.created_at), "MMM d, yyyy")}</span>
                    <span className="text-xs text-[#6B7280]">
                      {formatDistanceToNow(new Date(exportItem.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-[#A1A1AA]">
                  {exportItem.download_url_expires_at ? (
                    <div className="flex flex-col">
                      <span>{format(new Date(exportItem.download_url_expires_at), "MMM d, yyyy")}</span>
                      <span className="text-xs text-[#6B7280]">
                        {formatDistanceToNow(new Date(exportItem.download_url_expires_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-[#A1A1AA] hover:text-[#F3F4F6] hover:bg-[#282A30]"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#24262C] border-[#303136]">
                      {exportItem.status === "completed" && exportItem.download_url && (
                        <DropdownMenuItem
                          onClick={() => handleDownload(exportItem)}
                          className="text-[#F3F4F6] hover:bg-[#282A30] cursor-pointer"
                        >
                          <Download className="h-4 w-4 mr-2 text-[#A1A1AA]" />
                          {isUrlExpired(exportItem) ? "Refresh & Download" : "Download"}
                        </DropdownMenuItem>
                      )}
                      {exportItem.status === "completed" &&
                        exportItem.download_url &&
                        isUrlExpired(exportItem) && (
                          <DropdownMenuItem
                            onClick={() => refreshUrl.mutate(exportItem.id)}
                            className="text-[#F3F4F6] hover:bg-[#282A30] cursor-pointer"
                          >
                            <RefreshCw className="h-4 w-4 mr-2 text-[#A1A1AA]" />
                            Refresh URL
                          </DropdownMenuItem>
                        )}
                      <DropdownMenuItem
                        onClick={() => deleteExport.mutate(exportItem.id)}
                        className="text-[#F87171] hover:bg-[#282A30] cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#A1A1AA]">
            Page {page} of {totalPages} ({data?.total || 0} total exports)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(Math.max(1, page - 1))}
              disabled={page === 1}
              className="text-[#A1A1AA] border-[#303136] hover:bg-[#282A30]"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="text-[#A1A1AA] border-[#303136] hover:bg-[#282A30]"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
