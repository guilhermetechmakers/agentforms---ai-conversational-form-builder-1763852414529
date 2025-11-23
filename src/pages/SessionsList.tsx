import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Download,
  MoreVertical,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Archive,
} from "lucide-react"
import { useSessions, useDeleteSession, useDeleteSessions, useRestoreSession } from "@/hooks/useSessions"
import { useAgents } from "@/hooks/useAgents"
import { SessionDetailsModal } from "@/components/sessions/SessionDetailsModal"
import { ExportDialog } from "@/components/sessions/ExportDialog"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow, format } from "date-fns"
import type { SessionFilters } from "@/api/sessions"

export default function SessionsList() {
  const navigate = useNavigate()
  const [selectedAgentId, setSelectedAgentId] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "in-progress" | "completed" | "abandoned">("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set())
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeleted, setShowDeleted] = useState(false)
  const pageSize = 20

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedAgentId, statusFilter, dateFrom, dateTo, searchQuery, showDeleted])

  // Build filters
  const filters: SessionFilters = {
    agent_id: selectedAgentId !== "all" ? selectedAgentId : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchQuery || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    page: currentPage,
    pageSize,
    include_deleted: showDeleted,
  }

  const { data: sessionsData, isLoading } = useSessions(filters)
  const { data: agentsData } = useAgents({ status: "all" })
  const deleteSessionMutation = useDeleteSession()
  const deleteSessionsMutation = useDeleteSessions()
  const restoreSessionMutation = useRestoreSession()

  const sessions = sessionsData?.sessions || []
  const totalPages = sessionsData?.totalPages || 1
  const total = sessionsData?.total || 0
  const agents = agentsData?.agents || []
  const hasSelectedSessions = selectedSessions.size > 0

  const handleSelectSession = (sessionId: string) => {
    const newSelected = new Set(selectedSessions)
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId)
    } else {
      newSelected.add(sessionId)
    }
    setSelectedSessions(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedSessions.size === sessions.length) {
      setSelectedSessions(new Set())
    } else {
      setSelectedSessions(new Set(sessions.map(s => s.id)))
    }
  }

  const handleViewSession = (sessionId: string) => {
    setSelectedSessionId(sessionId)
    setDetailsModalOpen(true)
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm("Are you sure you want to delete this session? It can be restored later.")) {
      await deleteSessionMutation.mutateAsync(sessionId)
      setSelectedSessions(prev => {
        const newSet = new Set(prev)
        newSet.delete(sessionId)
        return newSet
      })
    }
  }

  const handleRestoreSession = async (sessionId: string) => {
    await restoreSessionMutation.mutateAsync(sessionId)
    setSelectedSessions(prev => {
      const newSet = new Set(prev)
      newSet.delete(sessionId)
      return newSet
    })
  }

  const handleBulkDelete = async () => {
    if (selectedSessions.size === 0) return
    if (confirm(`Are you sure you want to delete ${selectedSessions.size} session(s)? They can be restored later.`)) {
      await deleteSessionsMutation.mutateAsync(Array.from(selectedSessions))
      setSelectedSessions(new Set())
    }
  }

  const handleExport = () => {
    setExportDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[#4ADE80]/20 text-[#4ADE80] border-[#4ADE80]/30"
      case "in-progress":
        return "bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]/30"
      case "abandoned":
        return "bg-[#F87171]/20 text-[#F87171] border-[#F87171]/30"
      default:
        return "bg-[#A1A1AA]/20 text-[#A1A1AA] border-[#A1A1AA]/30"
    }
  }

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId)
    return agent?.name || "Unknown Agent"
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F3F4F6]">Sessions</h1>
          <p className="text-[#A1A1AA] mt-1">
            View and manage all conversation sessions
          </p>
        </div>
        <div className="flex gap-2">
          {hasSelectedSessions && (
            <>
              <Button
                variant="outline"
                onClick={handleExport}
                className="text-[#A1A1AA] border-[#303136] hover:bg-[#282A30]"
              >
                <Download className="mr-2 h-4 w-4" />
                Export ({selectedSessions.size})
              </Button>
              <Button
                variant="outline"
                onClick={handleBulkDelete}
                disabled={deleteSessionsMutation.isPending}
                className="text-[#F87171] border-[#F87171]/30 hover:bg-[#F87171]/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedSessions.size})
              </Button>
            </>
          )}
          {!hasSelectedSessions && (
            <Button
              variant="outline"
              onClick={() => setExportDialogOpen(true)}
              className="text-[#A1A1AA] border-[#303136] hover:bg-[#282A30]"
            >
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-[#282A30] border-[#303136]">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Agent Selector */}
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger className="w-full bg-[#24262C] border-[#303136] text-[#F3F4F6]">
                <SelectValue placeholder="All Agents" />
              </SelectTrigger>
              <SelectContent className="bg-[#282A30] border-[#303136]">
                <SelectItem value="all" className="text-[#F3F4F6] hover:bg-[#24262C]">
                  All Agents
                </SelectItem>
                {agents.map((agent) => (
                  <SelectItem
                    key={agent.id}
                    value={agent.id}
                    className="text-[#F3F4F6] hover:bg-[#24262C]"
                  >
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-full bg-[#24262C] border-[#303136] text-[#F3F4F6]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#282A30] border-[#303136]">
                <SelectItem value="all" className="text-[#F3F4F6] hover:bg-[#24262C]">
                  All Status
                </SelectItem>
                <SelectItem value="completed" className="text-[#F3F4F6] hover:bg-[#24262C]">
                  Completed
                </SelectItem>
                <SelectItem value="in-progress" className="text-[#F3F4F6] hover:bg-[#24262C]">
                  In Progress
                </SelectItem>
                <SelectItem value="abandoned" className="text-[#F3F4F6] hover:bg-[#24262C]">
                  Abandoned
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Date From */}
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="From Date"
              className="bg-[#24262C] border-[#303136] text-[#F3F4F6]"
            />

            {/* Date To */}
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="To Date"
              className="bg-[#24262C] border-[#303136] text-[#F3F4F6]"
            />

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
              <Input
                placeholder="Search sessions, messages, fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#24262C] border-[#303136] text-[#F3F4F6]"
              />
            </div>
          </div>
          {/* Show Deleted Toggle */}
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="show-deleted"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
              className="h-4 w-4 rounded border-[#303136] bg-[#24262C] text-[#F6D365] focus:ring-[#60A5FA]"
            />
            <label htmlFor="show-deleted" className="text-sm text-[#A1A1AA] cursor-pointer">
              Show deleted sessions
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card className="bg-[#282A30] border-[#303136]">
        <CardHeader>
          <CardTitle className="text-[#F3F4F6]">Sessions</CardTitle>
          <CardDescription className="text-[#A1A1AA]">
            {total} total session(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#A1A1AA] text-lg">No sessions found</p>
              <p className="text-[#6B7280] text-sm mt-2">
                Try adjusting your filters or create a new agent to get started
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-[#303136] overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#24262C]">
                    <TableRow className="border-[#303136] hover:bg-[#24262C]">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedSessions.size === sessions.length && sessions.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="text-[#F3F4F6] font-semibold">Session ID</TableHead>
                      <TableHead className="text-[#F3F4F6] font-semibold">Agent</TableHead>
                      <TableHead className="text-[#F3F4F6] font-semibold">Started</TableHead>
                      <TableHead className="text-[#F3F4F6] font-semibold">Status</TableHead>
                      <TableHead className="text-[#F3F4F6] font-semibold">Visitor Info</TableHead>
                      <TableHead className="text-[#F3F4F6] font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow
                        key={session.id}
                        className="border-[#303136] hover:bg-[#24262C]/50 transition-colors"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedSessions.has(session.id)}
                            onCheckedChange={() => handleSelectSession(session.id)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm text-[#A1A1AA]">
                          <div className="flex items-center gap-2">
                            {session.id.slice(0, 8)}...
                            {session.deleted_at && (
                              <Badge className="bg-[#6B7280]/20 text-[#6B7280] border-[#6B7280]/30 text-xs">
                                <Archive className="h-3 w-3 mr-1" />
                                Deleted
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-[#F3F4F6]">
                          {getAgentName(session.agent_id)}
                        </TableCell>
                        <TableCell className="text-[#A1A1AA]">
                          <div className="flex flex-col">
                            <span>{format(new Date(session.started_at), "MMM d, yyyy")}</span>
                            <span className="text-xs">
                              {formatDistanceToNow(new Date(session.started_at), { addSuffix: true })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(session.status)}>
                            {session.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#A1A1AA] text-sm">
                          {session.visitor_metadata?.ip_address || "N/A"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-[#A1A1AA] hover:text-[#F3F4F6]"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-[#282A30] border-[#303136]"
                            >
                              {!session.deleted_at ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleViewSession(session.id)}
                                    className="text-[#F3F4F6] hover:bg-[#24262C] cursor-pointer"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => navigate(`/dashboard/sessions/${session.id}`)}
                                    className="text-[#F3F4F6] hover:bg-[#24262C] cursor-pointer"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Open Inspector
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-[#303136]" />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteSession(session.id)}
                                    className="text-[#F87171] hover:bg-[#F87171]/10 cursor-pointer"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleRestoreSession(session.id)}
                                    disabled={restoreSessionMutation.isPending}
                                    className="text-[#4ADE80] hover:bg-[#4ADE80]/10 cursor-pointer"
                                  >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Restore
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-[#303136]" />
                                  <DropdownMenuItem
                                    onClick={() => handleViewSession(session.id)}
                                    className="text-[#F3F4F6] hover:bg-[#24262C] cursor-pointer"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
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
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-[#A1A1AA]">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, total)} of {total} sessions
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="text-[#A1A1AA] border-[#303136] hover:bg-[#282A30]"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="text-[#A1A1AA] border-[#303136] hover:bg-[#282A30]"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-[#F3F4F6] px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="text-[#A1A1AA] border-[#303136] hover:bg-[#282A30]"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="text-[#A1A1AA] border-[#303136] hover:bg-[#282A30]"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <SessionDetailsModal
        sessionId={selectedSessionId}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        onExport={(sessionId) => {
          setSelectedSessions(new Set([sessionId]))
          handleExport()
        }}
      />

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        sessionIds={
          hasSelectedSessions
            ? Array.from(selectedSessions)
            : sessions.map(s => s.id)
        }
      />
    </div>
  )
}
