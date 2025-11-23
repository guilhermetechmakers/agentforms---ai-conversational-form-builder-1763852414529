import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MoreVertical,
} from "lucide-react"
import { useModerationQueue, useUpdateModerationItem } from "@/hooks/useAdmin"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModerationReportReviewDialog } from "./ModerationReportReviewDialog"

export function ModerationQueueSection() {
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "reviewing" | "resolved" | "dismissed">("pending")
  const [currentPage, setCurrentPage] = useState(1)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const pageSize = 20

  const { data: moderationData, isLoading } = useModerationQueue({
    status: statusFilter !== "all" ? statusFilter : undefined,
    page: currentPage,
    pageSize,
  })

  const updateModerationMutation = useUpdateModerationItem()

  const items = moderationData?.items || []
  const totalPages = moderationData?.totalPages || 1

  const handleStatusChange = async (itemId: string, newStatus: "resolved" | "dismissed") => {
    await updateModerationMutation.mutateAsync({
      id: itemId,
      data: {
        status: newStatus,
      },
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-[#FBBF24]" />
      case "reviewing":
        return <AlertCircle className="h-4 w-4 text-[#60A5FA]" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-[#4ADE80]" />
      case "dismissed":
        return <XCircle className="h-4 w-4 text-[#6B7280]" />
      default:
        return null
    }
  }

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case "abuse":
        return "bg-[#F87171]/20 text-[#F87171]"
      case "spam":
        return "bg-[#FBBF24]/20 text-[#FBBF24]"
      case "inappropriate_content":
        return "bg-[#F472B6]/20 text-[#F472B6]"
      case "privacy_violation":
        return "bg-[#60A5FA]/20 text-[#60A5FA]"
      default:
        return "bg-[#6B7280]/20 text-[#6B7280]"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#282A30] border-[#303136]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#F3F4F6]">Moderation Queue</CardTitle>
              <CardDescription className="text-[#A1A1AA]">
                Review and manage flagged sessions and reports
              </CardDescription>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v: any) => {
                setStatusFilter(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[180px] bg-[#24262C] border-[#303136] text-[#F3F4F6]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-[#282A30] border-[#303136]">
                <SelectItem value="all" className="text-[#F3F4F6]">All Status</SelectItem>
                <SelectItem value="pending" className="text-[#F3F4F6]">Pending</SelectItem>
                <SelectItem value="reviewing" className="text-[#F3F4F6]">Reviewing</SelectItem>
                <SelectItem value="resolved" className="text-[#F3F4F6]">Resolved</SelectItem>
                <SelectItem value="dismissed" className="text-[#F3F4F6]">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full bg-[#24262C]" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-[#4ADE80] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#F3F4F6] mb-2">
                No items in queue
              </h3>
              <p className="text-[#A1A1AA]">
                {statusFilter !== "all"
                  ? "No items match the selected filter"
                  : "All clear! No items awaiting moderation"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-[#303136] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#303136] hover:bg-[#24262C]">
                      <TableHead className="text-[#A1A1AA]">Report</TableHead>
                      <TableHead className="text-[#A1A1AA]">Type</TableHead>
                      <TableHead className="text-[#A1A1AA]">Session/Agent</TableHead>
                      <TableHead className="text-[#A1A1AA]">Status</TableHead>
                      <TableHead className="text-[#A1A1AA]">Reported</TableHead>
                      <TableHead className="text-[#A1A1AA] w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow
                        key={item.id}
                        className="border-[#303136] hover:bg-[#24262C]"
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-[#F3F4F6] line-clamp-2">
                              {item.report_reason}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getReportTypeColor(
                              item.report_type
                            )}`}
                          >
                            {item.report_type.replace("_", " ")}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-[#A1A1AA]">
                          {item.session ? (
                            <div>
                              <p>Session: {item.session.id.slice(0, 8)}...</p>
                              {item.agent && <p>Agent: {item.agent.name}</p>}
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.status)}
                            <span className="text-sm text-[#A1A1AA] capitalize">
                              {item.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-[#A1A1AA]">
                          {formatDistanceToNow(new Date(item.reported_at), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[#A1A1AA] hover:text-[#F3F4F6]"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-[#282A30] border-[#303136]"
                            >
                              <DropdownMenuItem
                                className="text-[#F3F4F6] focus:bg-[#24262C]"
                                onClick={() => {
                                  setSelectedReportId(item.id)
                                  setReviewDialogOpen(true)
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {item.status === "pending" && (
                                <>
                                  <DropdownMenuItem
                                    className="text-[#4ADE80] focus:bg-[#24262C] focus:text-[#4ADE80]"
                                    onClick={() => handleStatusChange(item.id, "resolved")}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark Resolved
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-[#6B7280] focus:bg-[#24262C] focus:text-[#6B7280]"
                                    onClick={() => handleStatusChange(item.id, "dismissed")}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Dismiss
                                  </DropdownMenuItem>
                                </>
                              )}
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
                <div className="flex items-center justify-between pt-4 border-t border-[#303136]">
                  <div className="text-sm text-[#A1A1AA]">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, moderationData?.total || 0)} of{" "}
                    {moderationData?.total || 0} items
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-[#303136] text-[#F3F4F6] hover:bg-[#282A30] disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-[#303136] text-[#F3F4F6] hover:bg-[#282A30] disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Moderation Report Review Dialog */}
      {selectedReportId && (
        <ModerationReportReviewDialog
          open={reviewDialogOpen}
          onOpenChange={(open) => {
            setReviewDialogOpen(open)
            if (!open) {
              setSelectedReportId(null)
            }
          }}
          reportId={selectedReportId}
        />
      )}
    </div>
  )
}
