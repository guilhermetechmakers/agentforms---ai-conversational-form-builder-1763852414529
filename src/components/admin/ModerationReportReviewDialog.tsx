import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  MessageSquare,
  Shield,
  FileText,
} from "lucide-react"
import { useModerationItem, useUpdateModerationItem } from "@/hooks/useAdmin"
import { formatDistanceToNow } from "date-fns"
import type { ModerationStatus } from "@/types/admin"

interface ModerationReportReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportId: string
}

export function ModerationReportReviewDialog({
  open,
  onOpenChange,
  reportId,
}: ModerationReportReviewDialogProps) {
  const { data: report, isLoading } = useModerationItem(reportId)
  const updateMutation = useUpdateModerationItem()
  const [status, setStatus] = useState<ModerationStatus>("pending")
  const [resolutionNotes, setResolutionNotes] = useState("")

  // Update status when report data loads
  if (report && status !== report.status) {
    setStatus(report.status)
  }

  const handleStatusUpdate = async (newStatus: ModerationStatus) => {
    if (!report) return

    try {
      await updateMutation.mutateAsync({
        id: report.id,
        data: {
          status: newStatus,
          resolution_notes: resolutionNotes || null,
        },
      })
      setResolutionNotes("")
      if (newStatus === "resolved" || newStatus === "dismissed") {
        onOpenChange(false)
      }
    } catch (error) {
      // Error handling is done in the hook
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-[#FBBF24]" />
      case "reviewing":
        return <AlertCircle className="h-4 w-4 text-[#60A5FA]" />
      case "resolved":
        return <CheckCircle2 className="h-4 w-4 text-[#4ADE80]" />
      case "dismissed":
        return <XCircle className="h-4 w-4 text-[#6B7280]" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#282A30] border-[#303136] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#F3F4F6]">Loading report...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  if (!report) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#282A30] border-[#303136] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#F3F4F6]">Report not found</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#282A30] border-[#303136] max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#F3F4F6] flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Review Moderation Report
          </DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            Review and resolve moderation reports
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Report Details */}
          <Card className="bg-[#24262C] border-[#303136]">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-medium ${getReportTypeColor(
                        report.report_type
                      )}`}
                    >
                      {report.report_type.replace("_", " ")}
                    </span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(report.status)}
                      <span className="text-sm text-[#A1A1AA] capitalize">
                        {report.status}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-[#F3F4F6]">Report Reason</h3>
                  <p className="text-[#A1A1AA] whitespace-pre-wrap">{report.report_reason}</p>
                </div>
                <div className="text-right text-sm text-[#A1A1AA]">
                  <p>
                    Reported{" "}
                    {formatDistanceToNow(new Date(report.reported_at), { addSuffix: true })}
                  </p>
                  {report.reviewed_at && (
                    <p className="mt-1">
                      Reviewed{" "}
                      {formatDistanceToNow(new Date(report.reviewed_at), { addSuffix: true })}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Information */}
          <div className="grid grid-cols-2 gap-4">
            {report.session && (
              <Card className="bg-[#24262C] border-[#303136]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-[#60A5FA]" />
                    <span className="text-xs text-[#A1A1AA]">Session</span>
                  </div>
                  <p className="text-sm font-medium text-[#F3F4F6] truncate">
                    {report.session.id.slice(0, 16)}...
                  </p>
                  <p className="text-xs text-[#A1A1AA] mt-1">
                    Status: {report.session.status}
                  </p>
                </CardContent>
              </Card>
            )}
            {report.agent && (
              <Card className="bg-[#24262C] border-[#303136]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-[#4ADE80]" />
                    <span className="text-xs text-[#A1A1AA]">Agent</span>
                  </div>
                  <p className="text-sm font-medium text-[#F3F4F6] truncate">
                    {report.agent.name}
                  </p>
                </CardContent>
              </Card>
            )}
            {report.reporter && (
              <Card className="bg-[#24262C] border-[#303136]">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-[#F6D365]" />
                    <span className="text-xs text-[#A1A1AA]">Reporter</span>
                  </div>
                  <p className="text-sm font-medium text-[#F3F4F6] truncate">
                    {report.reporter.email}
                  </p>
                  {report.reporter.full_name && (
                    <p className="text-xs text-[#A1A1AA] mt-1">
                      {report.reporter.full_name}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Resolution Notes (if already reviewed) */}
          {report.resolution_notes && (
            <Card className="bg-[#24262C] border-[#303136]">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold text-[#F3F4F6] mb-2">
                  Resolution Notes
                </h4>
                <p className="text-sm text-[#A1A1AA] whitespace-pre-wrap">
                  {report.resolution_notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Review Form */}
          {report.status === "pending" || report.status === "reviewing" ? (
            <div className="space-y-4 border-t border-[#303136] pt-4">
              <h4 className="text-sm font-semibold text-[#F3F4F6]">Review Actions</h4>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-[#F3F4F6]">
                  Update Status
                </Label>
                <Select
                  value={status}
                  onValueChange={(v: ModerationStatus) => setStatus(v)}
                >
                  <SelectTrigger className="bg-[#24262C] border-[#303136] text-[#F3F4F6]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#282A30] border-[#303136]">
                    <SelectItem value="pending" className="text-[#F3F4F6]">
                      Pending
                    </SelectItem>
                    <SelectItem value="reviewing" className="text-[#F3F4F6]">
                      Reviewing
                    </SelectItem>
                    <SelectItem value="resolved" className="text-[#F3F4F6]">
                      Resolved
                    </SelectItem>
                    <SelectItem value="dismissed" className="text-[#F3F4F6]">
                      Dismissed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resolution-notes" className="text-[#F3F4F6]">
                  Resolution Notes
                </Label>
                <Textarea
                  id="resolution-notes"
                  placeholder="Enter notes about the resolution..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA]"
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleStatusUpdate("resolved")}
                  className="bg-[#4ADE80] hover:bg-[#4ADE80]/90 text-white flex-1"
                  disabled={updateMutation.isPending}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Resolved
                </Button>
                <Button
                  onClick={() => handleStatusUpdate("dismissed")}
                  variant="outline"
                  className="border-[#6B7280] text-[#6B7280] hover:bg-[#6B7280]/10 flex-1"
                  disabled={updateMutation.isPending}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Dismiss
                </Button>
              </div>
            </div>
          ) : (
            <Card className="bg-[#24262C] border-[#303136]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-[#A1A1AA]">
                  {getStatusIcon(report.status)}
                  <span className="text-sm">
                    This report has been {report.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
