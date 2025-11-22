import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useActiveSessions, useTerminateSession, useLogoutEverywhere } from "@/hooks/useProfile"
import { Loader2, LogOut, Monitor, Smartphone, Tablet, Globe } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function ActiveSessionsList() {
  const { data: sessions, isLoading } = useActiveSessions()
  const terminateSession = useTerminateSession()
  const logoutEverywhere = useLogoutEverywhere()

  const getDeviceIcon = (deviceInfo: any) => {
    const device = deviceInfo?.device?.toLowerCase() || ""
    
    if (device.includes("mobile") || device.includes("phone")) {
      return <Smartphone className="h-4 w-4" />
    }
    if (device.includes("tablet")) {
      return <Tablet className="h-4 w-4" />
    }
    return <Monitor className="h-4 w-4" />
  }

  const getDeviceName = (deviceInfo: any) => {
    const browser = deviceInfo?.browser || "Unknown Browser"
    const os = deviceInfo?.os || "Unknown OS"
    const device = deviceInfo?.device || "Unknown Device"
    return `${browser} on ${os}${device ? ` (${device})` : ""}`
  }

  const handleTerminateSession = async (sessionId: string) => {
    if (confirm("Are you sure you want to terminate this session?")) {
      await terminateSession.mutateAsync(sessionId)
    }
  }

  const handleLogoutEverywhere = async () => {
    if (
      confirm(
        "Are you sure you want to logout from all devices? You will need to sign in again on all devices."
      )
    ) {
      await logoutEverywhere.mutateAsync()
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active login sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#A1A1AA]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active login sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#A1A1AA]">No active sessions found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>Manage your active login sessions</CardDescription>
          </div>
          {sessions.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogoutEverywhere}
              disabled={logoutEverywhere.isPending}
              className="gap-2"
            >
              {logoutEverywhere.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Logout Everywhere
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-lg border border-[#303136] bg-[#24262C] p-4 hover:bg-[#282A30] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#282A30] text-[#F6D365]">
                  {getDeviceIcon(session.device_info)}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F3F4F6]">
                    {getDeviceName(session.device_info)}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                    <Globe className="h-3 w-3" />
                    <span>{session.ip_address || "Unknown IP"}</span>
                    <span>•</span>
                    <span>
                      Last active{" "}
                      {formatDistanceToNow(new Date(session.last_activity_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTerminateSession(session.id)}
                disabled={terminateSession.isPending}
                className="text-[#F87171] hover:text-[#F87171] hover:bg-[#F87171]/10"
              >
                {terminateSession.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Terminate
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
