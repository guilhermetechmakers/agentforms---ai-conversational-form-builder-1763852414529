import * as React from "react"
import { useParams, Link } from "react-router-dom"
import { useSession, useExportSessions, useRedactPII } from "@/hooks/useSessions"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ChevronRight, Home } from "lucide-react"
import { ConversationTimeline } from "@/components/sessions/ConversationTimeline"
import { CollectedDataPanel } from "@/components/sessions/CollectedDataPanel"
import { MetadataSection } from "@/components/sessions/MetadataSection"
import { ActionsSidebar } from "@/components/sessions/ActionsSidebar"
import { AuditTrail } from "@/components/sessions/AuditTrail"
import { ExportOptionsModal } from "@/components/sessions/ExportOptionsModal"
import { ConfirmRedactionDialog } from "@/components/sessions/ConfirmRedactionDialog"

export default function SessionInspector() {
  const { id } = useParams<{ id: string }>()
  const [exportModalOpen, setExportModalOpen] = React.useState(false)
  const [redactionDialogOpen, setRedactionDialogOpen] = React.useState(false)
  const [selectedFieldIds, setSelectedFieldIds] = React.useState<string[]>([])

  const { data: session, isLoading, error } = useSession(id || "")
  const exportSessions = useExportSessions()
  const redactPII = useRedactPII()

  const handleExport = async (format: "csv" | "json") => {
    if (!id) return
    try {
      await exportSessions.mutateAsync({ ids: [id], format })
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleRedact = () => {
    setRedactionDialogOpen(true)
  }

  const handleConfirmRedaction = async () => {
    if (!id) return
    try {
      await redactPII.mutateAsync({
        sessionId: id,
        fieldIds: selectedFieldIds.length > 0 ? selectedFieldIds : undefined,
      })
      setRedactionDialogOpen(false)
      setSelectedFieldIds([])
    } catch (error) {
      // Error handled by hook
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 bg-[#24262C]" />
            <Skeleton className="h-5 w-96 bg-[#24262C]" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full bg-[#24262C]" />
            <Skeleton className="h-64 w-full bg-[#24262C]" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full bg-[#24262C]" />
            <Skeleton className="h-48 w-full bg-[#24262C]" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-[#F3F4F6] mb-2">Session Not Found</h2>
          <p className="text-[#A1A1AA] mb-6">
            {error ? "Failed to load session" : "The session you're looking for doesn't exist."}
          </p>
          <Button asChild variant="outline" className="border-[#303136] text-[#F3F4F6] hover:bg-[#282A30]">
            <Link to="/dashboard/sessions">Back to Sessions</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-[#A1A1AA]">
        <Link
          to="/dashboard"
          className="hover:text-[#F3F4F6] transition-colors flex items-center gap-1"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          to="/dashboard/sessions"
          className="hover:text-[#F3F4F6] transition-colors"
        >
          Sessions
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-[#F3F4F6] font-medium">Session Details</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F3F4F6] mb-2">
            {session.agent?.name || "Session"} Details
          </h1>
          <p className="text-[#A1A1AA] font-mono text-sm">Session ID: {session.id}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Actions */}
        <div className="lg:col-span-1">
          <ActionsSidebar
            sessionId={session.id}
            onExport={() => setExportModalOpen(true)}
            onRedact={handleRedact}
          />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Conversation Timeline */}
          <ConversationTimeline
            messages={session.messages}
            agentName={session.agent?.name}
          />

          {/* Collected Data Panel */}
          <CollectedDataPanel
            fieldValues={session.field_values}
            sessionId={session.id}
          />

          {/* Metadata Section */}
          <MetadataSection session={session} agentName={session.agent?.name} />

          {/* Audit Trail */}
          <AuditTrail sessionId={session.id} />
        </div>
      </div>

      {/* Modals */}
      <ExportOptionsModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        onExport={handleExport}
        isLoading={exportSessions.isPending}
      />

      <ConfirmRedactionDialog
        open={redactionDialogOpen}
        onOpenChange={setRedactionDialogOpen}
        onConfirm={handleConfirmRedaction}
        fieldCount={selectedFieldIds.length > 0 ? selectedFieldIds.length : undefined}
        isLoading={redactPII.isPending}
      />
    </div>
  )
}
