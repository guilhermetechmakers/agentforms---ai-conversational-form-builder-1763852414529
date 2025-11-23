import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Search,
  Download,
  Loader2,
  User,
  Activity,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuditLogs } from "@/hooks/useSettings"
import { format } from "date-fns"

export function AuditLogsSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [actionType, setActionType] = useState<string>("all")
  const [resourceType, setResourceType] = useState<string>("all")
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading } = useAuditLogs({
    limit,
    offset: (page - 1) * limit,
    action_type: actionType !== "all" ? actionType : undefined,
    resource_type: resourceType !== "all" ? resourceType : undefined,
  })

  const logs = data?.logs || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  const actionTypeColors: Record<string, string> = {
    login: "bg-[#4ADE80]",
    logout: "bg-[#A1A1AA]",
    password_change: "bg-[#F87171]",
    agent_create: "bg-[#60A5FA]",
    agent_update: "bg-[#60A5FA]",
    agent_delete: "bg-[#F87171]",
    session_export: "bg-[#F6D365]",
    admin_action: "bg-[#F472B6]",
  }

  const filteredLogs = logs.filter((log) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        log.description?.toLowerCase().includes(searchLower) ||
        log.action_type.toLowerCase().includes(searchLower) ||
        log.resource_type?.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#A1A1AA]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Logs
          </CardTitle>
          <CardDescription>
            View and filter application audit logs for compliance tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#24262C] border-[#303136]"
              />
            </div>
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger className="w-full md:w-[200px] bg-[#24262C] border-[#303136]">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="password_change">Password Change</SelectItem>
                <SelectItem value="agent_create">Agent Create</SelectItem>
                <SelectItem value="agent_update">Agent Update</SelectItem>
                <SelectItem value="agent_delete">Agent Delete</SelectItem>
                <SelectItem value="session_export">Session Export</SelectItem>
                <SelectItem value="admin_action">Admin Action</SelectItem>
              </SelectContent>
            </Select>
            <Select value={resourceType} onValueChange={setResourceType}>
              <SelectTrigger className="w-full md:w-[200px] bg-[#24262C] border-[#303136]">
                <SelectValue placeholder="Resource Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="session">Session</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Logs List */}
          {filteredLogs.length > 0 ? (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-[#303136] bg-[#24262C] hover:bg-[#282A30] transition-colors"
                >
                  <div className="p-2 rounded-lg bg-[#282A30]">
                    <Activity className="h-5 w-5 text-[#60A5FA]" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        className={`${
                          actionTypeColors[log.action_type] || "bg-[#282A30]"
                        } text-white capitalize`}
                      >
                        {log.action_type.replace(/_/g, " ")}
                      </Badge>
                      {log.resource_type && (
                        <Badge variant="outline" className="capitalize">
                          {log.resource_type}
                        </Badge>
                      )}
                      <span className="text-sm text-[#A1A1AA]">
                        {format(new Date(log.created_at), "MMM dd, yyyy HH:mm:ss")}
                      </span>
                    </div>
                    {log.description && (
                      <p className="text-sm text-[#F3F4F6]">{log.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-[#A1A1AA]">
                      {log.user_id && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{log.user_id.slice(0, 8)}...</span>
                        </div>
                      )}
                      {log.ip_address && (
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          <span>{log.ip_address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-[#A1A1AA] mx-auto mb-4" />
              <p className="text-[#A1A1AA]">No audit logs found</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#303136]">
              <div className="text-sm text-[#A1A1AA]">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} logs
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
