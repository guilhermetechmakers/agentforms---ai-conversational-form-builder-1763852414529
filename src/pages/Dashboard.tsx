import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  MessageSquare,
  TrendingUp,
  Calendar,
  CheckSquare,
  Square,
} from "lucide-react"
import { useAgents, useDeleteAgent, useDuplicateAgent } from "@/hooks/useAgents"
import { UsageSummaryPanel } from "@/components/dashboard/UsageSummaryPanel"
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist"
import { CreateAgentModal } from "@/components/dashboard/CreateAgentModal"
import { ShareLinkDialog } from "@/components/dashboard/ShareLinkDialog"
import { DeleteConfirmationDialog } from "@/components/dashboard/DeleteConfirmationDialog"
import { BulkActionsSheet } from "@/components/dashboard/BulkActionsSheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import type { AgentWithStats } from "@/types/usage"
import type { AgentFilters } from "@/api/agents"

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all")
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set())
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareAgent, setShareAgent] = useState<AgentWithStats | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteAgent, setDeleteAgent] = useState<AgentWithStats | null>(null)
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const filters: AgentFilters = {
    search: searchQuery || undefined,
    status: statusFilter,
    page: currentPage,
    pageSize,
  }

  const { data: agentsData, isLoading } = useAgents(filters)
  const deleteAgentMutation = useDeleteAgent()
  const duplicateAgentMutation = useDuplicateAgent()

  const agents = agentsData?.agents || []
  const hasSelectedAgents = selectedAgents.size > 0

  const handleSelectAgent = (agentId: string) => {
    const newSelected = new Set(selectedAgents)
    if (newSelected.has(agentId)) {
      newSelected.delete(agentId)
    } else {
      newSelected.add(agentId)
    }
    setSelectedAgents(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedAgents.size === agents.length) {
      setSelectedAgents(new Set())
    } else {
      setSelectedAgents(new Set(agents.map(a => a.id)))
    }
  }

  const handleShare = (agent: AgentWithStats) => {
    setShareAgent(agent)
    setShareDialogOpen(true)
  }

  const handleDelete = (agent: AgentWithStats) => {
    setDeleteAgent(agent)
    setDeleteDialogOpen(true)
  }

  const handleDuplicate = async (agent: AgentWithStats) => {
    await duplicateAgentMutation.mutateAsync(agent.id)
  }

  const confirmDelete = async () => {
    if (deleteAgent) {
      await deleteAgentMutation.mutateAsync(deleteAgent.id)
      setDeleteDialogOpen(false)
      setDeleteAgent(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F3F4F6]">Agents</h1>
          <p className="text-[#A1A1AA] mt-1">
            Manage your conversational form agents
          </p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90 btn-hover"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Agent
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#282A30] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA]"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-full sm:w-[180px] bg-[#282A30] border-[#303136] text-[#F3F4F6]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-[#282A30] border-[#303136]">
            <SelectItem value="all" className="text-[#F3F4F6]">All Status</SelectItem>
            <SelectItem value="published" className="text-[#F3F4F6]">Published</SelectItem>
            <SelectItem value="draft" className="text-[#F3F4F6]">Draft</SelectItem>
          </SelectContent>
        </Select>
        {hasSelectedAgents && (
          <Button
            variant="outline"
            onClick={() => setBulkActionsOpen(true)}
            className="border-[#303136] text-[#F3F4F6] hover:bg-[#282A30]"
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            {selectedAgents.size} selected
          </Button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Agent List */}
        <div className="lg:col-span-3 space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-[#282A30] border-[#303136] animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-[#24262C] rounded w-3/4 mb-4" />
                    <div className="h-3 bg-[#24262C] rounded w-full mb-2" />
                    <div className="h-3 bg-[#24262C] rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : agents.length === 0 ? (
            <Card className="bg-[#282A30] border-[#303136]">
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#F3F4F6] mb-2">
                  No agents found
                </h3>
                <p className="text-[#A1A1AA] mb-6">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Get started by creating your first agent"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Button
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Agent
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {hasSelectedAgents && (
                <div className="flex items-center justify-between p-4 rounded-lg bg-[#282A30] border border-[#303136]">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAll}
                      className="text-[#A1A1AA] hover:text-[#F3F4F6]"
                    >
                      {selectedAgents.size === agents.length ? (
                        <CheckSquare className="h-4 w-4 mr-2" />
                      ) : (
                        <Square className="h-4 w-4 mr-2" />
                      )}
                      Select All
                    </Button>
                    <span className="text-sm text-[#A1A1AA]">
                      {selectedAgents.size} agent(s) selected
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkActionsOpen(true)}
                    className="border-[#303136] text-[#F3F4F6] hover:bg-[#282A30]"
                  >
                    Bulk Actions
                  </Button>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isSelected={selectedAgents.has(agent.id)}
                    onSelect={() => handleSelectAgent(agent.id)}
                    onShare={() => handleShare(agent)}
                    onDelete={() => handleDelete(agent)}
                    onDuplicate={() => handleDuplicate(agent)}
                  />
                ))}
              </div>
              {/* Pagination */}
              {agentsData && agentsData.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-[#303136]">
                  <div className="text-sm text-[#A1A1AA]">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, agentsData.total)} of{" "}
                    {agentsData.total} agents
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
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(agentsData.totalPages, p + 1)
                        )
                      }
                      disabled={currentPage === agentsData.totalPages}
                      className="border-[#303136] text-[#F3F4F6] hover:bg-[#282A30] disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <UsageSummaryPanel />
          <OnboardingChecklist />
        </div>
      </div>

      {/* Modals and Dialogs */}
      <CreateAgentModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
      {shareAgent && (
        <ShareLinkDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          agent={shareAgent}
        />
      )}
      {deleteAgent && (
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          agent={deleteAgent}
          onConfirm={confirmDelete}
        />
      )}
      <BulkActionsSheet
        open={bulkActionsOpen}
        onOpenChange={setBulkActionsOpen}
        selectedAgentIds={Array.from(selectedAgents)}
        onComplete={() => setSelectedAgents(new Set())}
      />
    </div>
  )
}

interface AgentCardProps {
  agent: AgentWithStats
  isSelected: boolean
  onSelect: () => void
  onShare: () => void
  onDelete: () => void
  onDuplicate: () => void
}

function AgentCard({
  agent,
  isSelected,
  onSelect,
  onShare,
  onDelete,
  onDuplicate,
}: AgentCardProps) {
  return (
    <Card
      className={`bg-[#282A30] border-[#303136] hover:shadow-card transition-all duration-200 card-hover ${
        isSelected ? "ring-2 ring-[#60A5FA]" : ""
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <Link
                to={`/dashboard/agents/${agent.id}`}
                className="block group"
              >
                <h3 className="font-semibold text-[#F3F4F6] group-hover:text-[#60A5FA] transition-colors mb-1 truncate">
                  {agent.name}
                </h3>
              </Link>
              {agent.description && (
                <p className="text-sm text-[#A1A1AA] line-clamp-2 mb-3">
                  {agent.description}
                </p>
              )}
            </div>
          </div>
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
                asChild
                className="text-[#F3F4F6] focus:bg-[#24262C]"
              >
                <Link to={`/dashboard/agents/${agent.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              {agent.status === "published" && agent.public_url && (
                <DropdownMenuItem
                  onClick={onShare}
                  className="text-[#F3F4F6] focus:bg-[#24262C]"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Share Link
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={onDuplicate}
                className="text-[#F3F4F6] focus:bg-[#24262C]"
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#303136]" />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-[#F87171] focus:bg-[#24262C] focus:text-[#F87171]"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-[#24262C] border border-[#303136]">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="h-3 w-3 text-[#4ADE80]" />
              <span className="text-xs text-[#A1A1AA]">Sessions</span>
            </div>
            <p className="text-lg font-semibold text-[#F3F4F6]">
              {agent.total_sessions || 0}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#24262C] border border-[#303136]">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3 w-3 text-[#60A5FA]" />
              <span className="text-xs text-[#A1A1AA]">Conversion</span>
            </div>
            <p className="text-lg font-semibold text-[#F3F4F6]">
              {agent.conversion_rate?.toFixed(1) || "0.0"}%
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#303136]">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                agent.status === "published"
                  ? "bg-[#4ADE80]/20 text-[#4ADE80]"
                  : "bg-[#FBBF24]/20 text-[#FBBF24]"
              }`}
            >
              {agent.status}
            </span>
            {agent.last_activity_at && (
              <span className="text-xs text-[#A1A1AA] flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(agent.last_activity_at), {
                  addSuffix: true,
                })}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-[#60A5FA] hover:text-[#60A5FA] hover:bg-[#60A5FA]/10"
          >
            <Link to={`/dashboard/sessions?agent=${agent.id}`}>
              View Sessions
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
