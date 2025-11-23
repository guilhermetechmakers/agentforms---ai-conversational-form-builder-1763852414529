import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Download,
  Shield,
  Send,
  CheckCircle2,
  Trash2,
  ArrowLeft,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useDeleteSession, useResendWebhook, useMarkReviewed } from "@/hooks/useSessions"
import { toast } from "sonner"

interface ActionsSidebarProps {
  sessionId: string
  onExport: () => void
  onRedact: () => void
}

export function ActionsSidebar({ sessionId, onExport, onRedact }: ActionsSidebarProps) {
  const navigate = useNavigate()
  const deleteSession = useDeleteSession()
  const resendWebhook = useResendWebhook()
  const markReviewed = useMarkReviewed()

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
      try {
        await deleteSession.mutateAsync(sessionId)
        toast.success("Session deleted successfully")
        navigate("/dashboard/sessions")
      } catch (error) {
        // Error handled by hook
      }
    }
  }

  const handleResendWebhook = async () => {
    try {
      await resendWebhook.mutateAsync(sessionId)
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleMarkReviewed = async () => {
    try {
      await markReviewed.mutateAsync(sessionId)
    } catch (error) {
      // Error handled by hook
    }
  }

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard/sessions")}
        className="w-full justify-start text-[#A1A1AA] hover:text-[#F3F4F6] hover:bg-[#282A30]"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Sessions
      </Button>

      {/* Actions */}
      <Card className="bg-[#282A30] border-[#303136]">
        <CardHeader>
          <CardTitle className="text-[#F3F4F6]">Actions</CardTitle>
          <CardDescription className="text-[#A1A1AA]">
            Manage this session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            onClick={onExport}
            variant="outline"
            className="w-full justify-start border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>

          <Button
            onClick={onRedact}
            variant="outline"
            className="w-full justify-start border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
          >
            <Shield className="mr-2 h-4 w-4" />
            Redact PII
          </Button>

          <Button
            onClick={handleResendWebhook}
            variant="outline"
            disabled={resendWebhook.isPending}
            className="w-full justify-start border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
          >
            <Send className="mr-2 h-4 w-4" />
            {resendWebhook.isPending ? "Resending..." : "Resend Webhook"}
          </Button>

          <Button
            onClick={handleMarkReviewed}
            variant="outline"
            disabled={markReviewed.isPending}
            className="w-full justify-start border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {markReviewed.isPending ? "Marking..." : "Mark as Reviewed"}
          </Button>

          <div className="pt-2 border-t border-[#303136]">
            <Button
              onClick={handleDelete}
              variant="outline"
              disabled={deleteSession.isPending}
              className="w-full justify-start border-[#F87171]/30 text-[#F87171] hover:bg-[#F87171]/10 hover:border-[#F87171]/50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteSession.isPending ? "Deleting..." : "Delete Session"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
