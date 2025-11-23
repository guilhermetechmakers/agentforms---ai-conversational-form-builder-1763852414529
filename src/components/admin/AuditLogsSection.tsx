import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Search, Calendar, FileText } from "lucide-react"
import { useAuditLogs } from "@/hooks/useAdmin"
import { formatDistanceToNow } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import type { AuditEventType, AuditResourceType } from "@/types/admin"

export function AuditLogsSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all")
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  const { data: logsData, isLoading } = useAuditLogs({
    search: searchQuery || undefined,
    event_type: eventTypeFilter !== "all" ? (eventTypeFilter as AuditEventType) : undefined,
    resource_type: resourceTypeFilter !== "all" ? (resourceTypeFilter as AuditResourceType) : undefined,
    page: currentPage,
    pageSize,
  })

  const logs = logsData?.logs || []
  const totalPages = logsData?.totalPages || 1

  const getEventTypeColor = (eventType: string) => {
    if (eventType.includes("delete") || eventType.includes("suspend")) {
      return "bg-[#F87171]/20 text-[#F87171]"
    }
    if (eventType.includes("update") || eventType.includes("generate")) {
      return "bg-[#60A5FA]/20 text-[#60A5FA]"
    }
    return "bg-[#6B7280]/20 text-[#6B7280]"
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#282A30] border-[#303136]">
        <CardHeader>
          <CardTitle className="text-[#F3F4F6]">Audit Logs</CardTitle>
          <CardDescription className="text-[#A1A1AA]">
            Complete audit trail of all administrative actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA]"
              />
            </div>
            <Select
              value={eventTypeFilter}
              onValueChange={(v) => {
                setEventTypeFilter(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-[#24262C] border-[#303136] text-[#F3F4F6]">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent className="bg-[#282A30] border-[#303136]">
                <SelectItem value="all" className="text-[#F3F4F6]">All Events</SelectItem>
                <SelectItem value="user_suspended" className="text-[#F3F4F6]">User Suspended</SelectItem>
                <SelectItem value="user_deleted" className="text-[#F3F4F6]">User Deleted</SelectItem>
                <SelectItem value="user_impersonated" className="text-[#F3F4F6]">User Impersonated</SelectItem>
                <SelectItem value="session_deleted" className="text-[#F3F4F6]">Session Deleted</SelectItem>
                <SelectItem value="invoice_generated" className="text-[#F3F4F6]">Invoice Generated</SelectItem>
                <SelectItem value="system_config_changed" className="text-[#F3F4F6]">System Config Changed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={resourceTypeFilter}
              onValueChange={(v) => {
                setResourceTypeFilter(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-[#24262C] border-[#303136] text-[#F3F4F6]">
                <SelectValue placeholder="Resource Type" />
              </SelectTrigger>
              <SelectContent className="bg-[#282A30] border-[#303136]">
                <SelectItem value="all" className="text-[#F3F4F6]">All Resources</SelectItem>
                <SelectItem value="user" className="text-[#F3F4F6]">User</SelectItem>
                <SelectItem value="organization" className="text-[#F3F4F6]">Organization</SelectItem>
                <SelectItem value="session" className="text-[#F3F4F6]">Session</SelectItem>
                <SelectItem value="agent" className="text-[#F3F4F6]">Agent</SelectItem>
                <SelectItem value="invoice" className="text-[#F3F4F6]">Invoice</SelectItem>
                <SelectItem value="system" className="text-[#F3F4F6]">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logs Table */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-[#24262C]" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#F3F4F6] mb-2">
                No audit logs found
              </h3>
              <p className="text-[#A1A1AA]">
                {searchQuery || eventTypeFilter !== "all" || resourceTypeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No audit logs recorded yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-[#303136] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#303136] hover:bg-[#24262C]">
                      <TableHead className="text-[#A1A1AA]">Timestamp</TableHead>
                      <TableHead className="text-[#A1A1AA]">User</TableHead>
                      <TableHead className="text-[#A1A1AA]">Event</TableHead>
                      <TableHead className="text-[#A1A1AA]">Resource</TableHead>
                      <TableHead className="text-[#A1A1AA]">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="border-[#303136] hover:bg-[#24262C]"
                      >
                        <TableCell className="text-sm text-[#A1A1AA]">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(log.created_at), {
                              addSuffix: true,
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-[#F3F4F6]">
                              {log.user_email || "System"}
                            </p>
                            {log.user_role && (
                              <p className="text-xs text-[#A1A1AA]">{log.user_role}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getEventTypeColor(
                              log.event_type
                            )}`}
                          >
                            {log.event_type.replace(/_/g, " ")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-[#F3F4F6] capitalize">
                              {log.resource_type}
                            </p>
                            {log.resource_id && (
                              <p className="text-xs text-[#A1A1AA]">
                                {log.resource_id.slice(0, 8)}...
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-[#A1A1AA] max-w-md">
                          <p className="line-clamp-2">{log.action_description}</p>
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
                    {Math.min(currentPage * pageSize, logsData?.total || 0)} of{" "}
                    {logsData?.total || 0} logs
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
    </div>
  )
}
