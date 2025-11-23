import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { useSessionAuditTrail } from "@/hooks/useSessions"
import type { SessionAuditTrail as AuditTrailType } from "@/types/session"
import {
  Download,
  Shield,
  Send,
  CheckCircle2,
  Edit,
  Trash2,
  Eye,
} from "lucide-react"

interface AuditTrailProps {
  sessionId: string
}

const actionIcons: Record<string, React.ReactNode> = {
  exported: <Download className="h-4 w-4" />,
  redacted_pii: <Shield className="h-4 w-4" />,
  webhook_resent: <Send className="h-4 w-4" />,
  marked_reviewed: <CheckCircle2 className="h-4 w-4" />,
  field_updated: <Edit className="h-4 w-4" />,
  session_deleted: <Trash2 className="h-4 w-4" />,
  viewed: <Eye className="h-4 w-4" />,
}

const actionColors: Record<string, string> = {
  exported: "bg-[#60A5FA]/20 text-[#60A5FA] border-[#60A5FA]/30",
  redacted_pii: "bg-[#F87171]/20 text-[#F87171] border-[#F87171]/30",
  webhook_resent: "bg-[#F6D365]/20 text-[#F6D365] border-[#F6D365]/30",
  marked_reviewed: "bg-[#4ADE80]/20 text-[#4ADE80] border-[#4ADE80]/30",
  field_updated: "bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]/30",
  session_deleted: "bg-[#F87171]/20 text-[#F87171] border-[#F87171]/30",
  viewed: "bg-[#A1A1AA]/20 text-[#A1A1AA] border-[#A1A1AA]/30",
}

export function AuditTrail({ sessionId }: AuditTrailProps) {
  const { data: auditTrail, isLoading } = useSessionAuditTrail(sessionId)

  if (isLoading) {
    return (
      <Card className="bg-[#282A30] border-[#303136]">
        <CardHeader>
          <CardTitle className="text-[#F3F4F6]">Audit Trail</CardTitle>
          <CardDescription className="text-[#A1A1AA]">
            History of all actions taken on this session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full bg-[#24262C]" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!auditTrail || auditTrail.length === 0) {
    return (
      <Card className="bg-[#282A30] border-[#303136]">
        <CardHeader>
          <CardTitle className="text-[#F3F4F6]">Audit Trail</CardTitle>
          <CardDescription className="text-[#A1A1AA]">
            History of all actions taken on this session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-[#A1A1AA]">
            No audit trail entries yet.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#282A30] border-[#303136]">
      <CardHeader>
        <CardTitle className="text-[#F3F4F6]">Audit Trail</CardTitle>
        <CardDescription className="text-[#A1A1AA]">
          {auditTrail.length} action{auditTrail.length !== 1 ? "s" : ""} recorded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {auditTrail.map((entry: AuditTrailType) => (
              <div
                key={entry.id}
                className="p-3 rounded-lg bg-[#24262C] border border-[#303136] hover:border-[#303136]/80 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      actionColors[entry.action] || actionColors.viewed
                    }`}
                  >
                    {actionIcons[entry.action] || actionIcons.viewed}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          actionColors[entry.action] || actionColors.viewed
                        }`}
                      >
                        {entry.action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Badge>
                      <span className="text-xs text-[#A1A1AA]">
                        {format(new Date(entry.created_at), "PPp")}
                      </span>
                    </div>
                    {entry.description && (
                      <p className="text-sm text-[#F3F4F6]">{entry.description}</p>
                    )}
                    {entry.action_details &&
                      Object.keys(entry.action_details).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-[#A1A1AA] cursor-pointer hover:text-[#F3F4F6]">
                            View details
                          </summary>
                          <pre className="mt-2 text-xs bg-[#282A30] p-2 rounded border border-[#303136] text-[#A1A1AA] overflow-x-auto">
                            {JSON.stringify(entry.action_details, null, 2)}
                          </pre>
                        </details>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
