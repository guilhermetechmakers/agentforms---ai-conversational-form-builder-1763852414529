import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Globe, Monitor, Calendar, Clock, Hash } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import type { Session } from "@/types/session"

interface MetadataSectionProps {
  session: Session
  agentName?: string
}

export function MetadataSection({ session, agentName }: MetadataSectionProps) {
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

  const duration = session.completed_at
    ? formatDistanceToNow(new Date(session.completed_at), { addSuffix: false })
    : "In progress"

  return (
    <Card className="bg-[#282A30] border-[#303136]">
      <CardHeader>
        <CardTitle className="text-[#F3F4F6]">Session Metadata</CardTitle>
        <CardDescription className="text-[#A1A1AA]">
          Detailed information about this session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
              <Hash className="h-4 w-4" />
              Session ID
            </div>
            <p className="text-[#F3F4F6] font-mono text-sm break-all">{session.id}</p>
          </div>
          {agentName && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                <Monitor className="h-4 w-4" />
                Agent
              </div>
              <p className="text-[#F3F4F6] font-medium">{agentName}</p>
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
              <Calendar className="h-4 w-4" />
              Status
            </div>
            <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
              <Clock className="h-4 w-4" />
              Duration
            </div>
            <p className="text-[#F3F4F6]">{duration}</p>
          </div>
        </div>

        <Separator className="bg-[#303136]" />

        {/* Timestamps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-[#A1A1AA]">Started At</p>
            <p className="text-[#F3F4F6] text-sm">
              {format(new Date(session.started_at), "PPp")}
            </p>
          </div>
          {session.completed_at && (
            <div className="space-y-1">
              <p className="text-sm text-[#A1A1AA]">Completed At</p>
              <p className="text-[#F3F4F6] text-sm">
                {format(new Date(session.completed_at), "PPp")}
              </p>
            </div>
          )}
        </div>

        {/* Visitor Metadata */}
        {session.visitor_metadata && Object.keys(session.visitor_metadata).length > 0 && (
          <>
            <Separator className="bg-[#303136]" />
            <div>
              <p className="text-sm font-medium text-[#F3F4F6] mb-3">Visitor Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {session.visitor_metadata.ip_address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-[#A1A1AA] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#A1A1AA]">IP Address</p>
                      <p className="text-[#F3F4F6] text-sm font-mono">
                        {session.visitor_metadata.ip_address}
                      </p>
                    </div>
                  </div>
                )}
                {session.visitor_metadata.referrer && (
                  <div className="flex items-start gap-2">
                    <Globe className="h-4 w-4 text-[#A1A1AA] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#A1A1AA]">Referrer</p>
                      <p className="text-[#F3F4F6] text-sm truncate">
                        {session.visitor_metadata.referrer}
                      </p>
                    </div>
                  </div>
                )}
                {session.visitor_metadata.user_agent && (
                  <div className="flex items-start gap-2 md:col-span-2">
                    <Monitor className="h-4 w-4 text-[#A1A1AA] mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-[#A1A1AA]">User Agent</p>
                      <p className="text-[#F3F4F6] text-sm break-all">
                        {session.visitor_metadata.user_agent}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
