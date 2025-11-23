import { useSession } from "@/hooks/useSessions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Download, ExternalLink, MapPin, Globe } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { Link } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"

interface SessionDetailsModalProps {
  sessionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport?: (sessionId: string) => void
}

export function SessionDetailsModal({
  sessionId,
  open,
  onOpenChange,
  onExport,
}: SessionDetailsModalProps) {
  const { data: session, isLoading } = useSession(sessionId || "")

  if (!sessionId) return null

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#F3F4F6]">
            Session Details
          </DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            {sessionId}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : session ? (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {/* Session Info */}
              <Card className="bg-[#24262C] border-[#303136]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Session Information</CardTitle>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#A1A1AA] mb-1">Agent</p>
                      <p className="text-[#F3F4F6] font-medium">
                        {session.agent?.name || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#A1A1AA] mb-1">Started</p>
                      <p className="text-[#F3F4F6] font-medium">
                        {format(new Date(session.started_at), "PPp")}
                      </p>
                    </div>
                    {session.completed_at && (
                      <div>
                        <p className="text-sm text-[#A1A1AA] mb-1">Completed</p>
                        <p className="text-[#F3F4F6] font-medium">
                          {format(new Date(session.completed_at), "PPp")}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-[#A1A1AA] mb-1">Duration</p>
                      <p className="text-[#F3F4F6] font-medium">
                        {session.completed_at
                          ? formatDistanceToNow(new Date(session.completed_at), {
                              addSuffix: false,
                            })
                          : "In progress"}
                      </p>
                    </div>
                  </div>

                  {session.visitor_metadata && (
                    <>
                      <Separator className="bg-[#303136]" />
                      <div className="grid grid-cols-2 gap-4">
                        {session.visitor_metadata.ip_address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#A1A1AA]" />
                            <div>
                              <p className="text-sm text-[#A1A1AA]">IP Address</p>
                              <p className="text-[#F3F4F6] font-medium">
                                {session.visitor_metadata.ip_address}
                              </p>
                            </div>
                          </div>
                        )}
                        {session.visitor_metadata.referrer && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-[#A1A1AA]" />
                            <div>
                              <p className="text-sm text-[#A1A1AA]">Referrer</p>
                              <p className="text-[#F3F4F6] font-medium truncate">
                                {session.visitor_metadata.referrer}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Collected Fields */}
              {session.field_values && session.field_values.length > 0 && (
                <Card className="bg-[#24262C] border-[#303136]">
                  <CardHeader>
                    <CardTitle className="text-lg">Collected Data</CardTitle>
                    <CardDescription>
                      {session.field_values.length} field(s) collected
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {session.field_values.map((field) => (
                        <div
                          key={field.id}
                          className="p-3 rounded-lg bg-[#282A30] border border-[#303136]"
                        >
                          <p className="text-sm text-[#A1A1AA] mb-1 font-medium">
                            {field.field_key}
                          </p>
                          <p className="text-[#F3F4F6]">
                            {typeof field.value === "object"
                              ? JSON.stringify(field.value, null, 2)
                              : String(field.value)}
                          </p>
                          {field.validation_error && (
                            <p className="text-xs text-[#F87171] mt-1">
                              {field.validation_error}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Messages */}
              {session.messages && session.messages.length > 0 && (
                <Card className="bg-[#24262C] border-[#303136]">
                  <CardHeader>
                    <CardTitle className="text-lg">Conversation</CardTitle>
                    <CardDescription>
                      {session.messages.length} message(s)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {session.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.role === "visitor" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.role === "visitor"
                                ? "bg-[#60A5FA]/20 text-[#F3F4F6]"
                                : "bg-[#282A30] text-[#F3F4F6] border border-[#303136]"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs text-[#A1A1AA] mt-1">
                              {format(new Date(message.created_at), "HH:mm")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <p className="text-[#A1A1AA]">Session not found</p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-[#303136]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-[#A1A1AA] border-[#303136] hover:bg-[#282A30]"
          >
            Close
          </Button>
          <Button
            variant="outline"
            onClick={() => sessionId && onExport?.(sessionId)}
            className="text-[#F3F4F6] border-[#303136] hover:bg-[#282A30]"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            asChild
            className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
          >
            <Link to={`/dashboard/sessions/${sessionId}`}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Full Details
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
