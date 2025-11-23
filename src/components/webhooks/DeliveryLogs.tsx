import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// Using simple state-based expansion instead of Collapsible component
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
} from "lucide-react"
import { useDeliveryLogs } from "@/hooks/useWebhooks"
import { formatDistanceToNow } from "date-fns"
import type { DeliveryLog } from "@/types/webhook"

interface DeliveryLogsProps {
  webhookId?: string
  sessionId?: string
}

export function DeliveryLogs({ webhookId, sessionId }: DeliveryLogsProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'success' | 'failed' | 'retrying'>('all')
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const { data, isLoading } = useDeliveryLogs({
    webhook_id: webhookId,
    session_id: sessionId,
    status: statusFilter === 'all' ? undefined : statusFilter,
    page: currentPage,
    pageSize,
  })

  const logs = data?.logs || []

  const getStatusBadge = (log: DeliveryLog) => {
    switch (log.status) {
      case 'success':
        return (
          <Badge className="bg-[#4ADE80]/20 text-[#4ADE80] border-[#4ADE80]/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Success
          </Badge>
        )
      case 'failed':
        return (
          <Badge className="bg-[#F87171]/20 text-[#F87171] border-[#F87171]/30">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      case 'retrying':
        return (
          <Badge className="bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]/30">
            <RefreshCw className="h-3 w-3 mr-1" />
            Retrying
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-[#282A30] text-[#A1A1AA] border-[#303136]">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  const toggleExpand = (logId: string) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-[#282A30] border-[#303136] animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-[#24262C] rounded w-1/3 mb-4" />
              <div className="h-4 bg-[#24262C] rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <Card className="bg-[#282A30] border-[#303136]">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#24262C] flex items-center justify-center">
              <Clock className="h-8 w-8 text-[#A1A1AA]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#F3F4F6] mb-2">
                No delivery logs yet
              </h3>
              <p className="text-sm text-[#A1A1AA]">
                Delivery logs will appear here when webhooks are triggered.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F3F4F6]">Delivery Logs</h3>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px] bg-[#24262C] border-[#303136] text-[#F3F4F6]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#282A30] border-[#303136] text-[#F3F4F6]">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="retrying">Retrying</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {logs.map((log) => {
          const isExpanded = expandedLogs.has(log.id)
          return (
            <Card key={log.id} className="bg-[#282A30] border-[#303136] hover:bg-[#2A2C32] transition-colors">
              <CardContent className="p-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(log.id)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusBadge(log)}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-[#F3F4F6] font-medium">
                          Attempt #{log.attempt_number}
                        </span>
                        {log.response_code && (
                          <Badge variant="outline" className="bg-[#24262C] border-[#303136] text-[#A1A1AA]">
                            {log.response_code}
                          </Badge>
                        )}
                        {log.duration_ms && (
                          <span className="text-[#A1A1AA]">
                            {log.duration_ms}ms
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#A1A1AA] mt-1">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#A1A1AA] hover:text-[#F3F4F6] hover:bg-[#24262C]"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-4 pt-4 border-t border-[#303136]">
                    {/* Error Message */}
                    {log.error_message && (
                      <div className="p-3 rounded-lg bg-[#F87171]/10 border border-[#F87171]/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#F87171] mb-1">
                              {log.error_type || "Error"}
                            </p>
                            <p className="text-sm text-[#F87171]/80">{log.error_message}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(log.error_message || "")}
                            className="h-6 w-6 text-[#F87171] hover:bg-[#F87171]/20"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Response Details */}
                    {log.response_code && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-[#F3F4F6]">
                            Response ({log.response_code})
                          </Label>
                          {log.response_body && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(log.response_body || "")}
                              className="h-6 text-xs text-[#A1A1AA] hover:text-[#F3F4F6]"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          )}
                        </div>
                        {log.response_body && (
                          <pre className="p-3 rounded-lg bg-[#24262C] border border-[#303136] text-xs text-[#A1A1AA] overflow-x-auto max-h-48 overflow-y-auto">
                            {log.response_body}
                          </pre>
                        )}
                      </div>
                    )}

                    {/* Request Payload */}
                    {log.request_payload && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-[#F3F4F6]">
                            Request Payload
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.stringify(log.request_payload, null, 2))}
                            className="h-6 text-xs text-[#A1A1AA] hover:text-[#F3F4F6]"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <pre className="p-3 rounded-lg bg-[#24262C] border border-[#303136] text-xs text-[#A1A1AA] overflow-x-auto max-h-48 overflow-y-auto">
                          {JSON.stringify(log.request_payload, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Retry Info */}
                    {log.will_retry && log.next_retry_at && (
                      <div className="p-3 rounded-lg bg-[#FBBF24]/10 border border-[#FBBF24]/20">
                        <p className="text-sm text-[#FBBF24]">
                          Will retry {formatDistanceToNow(new Date(log.next_retry_at), { addSuffix: true })}
                        </p>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-[#A1A1AA]">
                      <div>
                        <span className="font-medium text-[#F3F4F6]">Started:</span>{" "}
                        {new Date(log.started_at).toLocaleString()}
                      </div>
                      {log.completed_at && (
                        <div>
                          <span className="font-medium text-[#F3F4F6]">Completed:</span>{" "}
                          {new Date(log.completed_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-[#A1A1AA]">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.total)} of {data.total} logs
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-[#24262C] border-[#303136] text-[#F3F4F6] hover:bg-[#282A30]"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={currentPage === data.totalPages}
              className="bg-[#24262C] border-[#303136] text-[#F3F4F6] hover:bg-[#282A30]"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
