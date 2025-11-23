import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  User,
  Mail,
  Calendar,
  Shield,
  Users,
  MessageSquare,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { useUser, useUserAction, useImpersonateUser } from "@/hooks/useAdmin"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

interface UserDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export function UserDetailModal({
  open,
  onOpenChange,
  userId,
}: UserDetailModalProps) {
  const { data: user, isLoading } = useUser(userId)
  const userActionMutation = useUserAction()
  const impersonateMutation = useImpersonateUser()
  const [role, setRole] = useState<"user" | "admin">("user")
  const [actionReason, setActionReason] = useState("")

  // Update role when user data loads
  if (user && role !== user.role) {
    setRole(user.role)
  }

  const handleRoleChange = async () => {
    if (!user) return

    try {
      // Note: Role assignment would need a separate API endpoint
      // For now, we'll show a toast indicating this needs backend support
      toast.info("Role assignment requires backend API support")
      // await userActionMutation.mutateAsync({
      //   user_id: user.id,
      //   action: role === "admin" ? "promote" : "demote",
      //   reason: `Role changed to ${role}`,
      // })
    } catch (error) {
      toast.error("Failed to update user role")
    }
  }

  const handleImpersonate = async () => {
    if (!user) return

    if (
      !confirm(
        `Are you sure you want to impersonate ${user.email}? All actions will be logged for audit purposes.`
      )
    ) {
      return
    }

    try {
      await impersonateMutation.mutateAsync(user.id)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleUserAction = async (action: "suspend" | "restore" | "delete") => {
    if (!user) return

    if (action === "delete") {
      if (
        !confirm(
          `Are you absolutely sure you want to delete ${user.email}? This action cannot be undone and will permanently remove all user data.`
        )
      ) {
        return
      }
    }

    try {
      await userActionMutation.mutateAsync({
        user_id: user.id,
        action,
        reason: actionReason || undefined,
      })
      setActionReason("")
      if (action === "delete") {
        onOpenChange(false)
      }
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#282A30] border-[#303136] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#F3F4F6]">Loading user...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#282A30] border-[#303136] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#F3F4F6]">User not found</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#282A30] border-[#303136] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#F3F4F6] flex items-center gap-2">
            <User className="h-5 w-5" />
            User Details
          </DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            View and manage user account information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Profile Section */}
          <Card className="bg-[#24262C] border-[#303136]">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-[#F472B6]/20 flex items-center justify-center flex-shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name || user.email}
                      className="h-16 w-16 rounded-full"
                    />
                  ) : (
                    <span className="text-2xl text-[#F472B6] font-semibold">
                      {(user.full_name || user.email)[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-[#F3F4F6] mb-1">
                    {user.full_name || "No name"}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-[#A1A1AA]">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                      {user.email_verified ? (
                        <CheckCircle2 className="h-4 w-4 text-[#4ADE80]" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-[#FBBF24]" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[#A1A1AA]">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      user.status === "active"
                        ? "bg-[#4ADE80]/20 text-[#4ADE80]"
                        : user.status === "suspended"
                        ? "bg-[#FBBF24]/20 text-[#FBBF24]"
                        : "bg-[#6B7280]/20 text-[#6B7280]"
                    }`}
                  >
                    {user.status}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-[#F6D365]/20 text-[#F6D365]"
                        : "bg-[#60A5FA]/20 text-[#60A5FA]"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-[#24262C] border-[#303136]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-[#60A5FA]" />
                  <span className="text-xs text-[#A1A1AA]">Agents</span>
                </div>
                <p className="text-2xl font-bold text-[#F3F4F6]">
                  {user.total_agents || 0}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#24262C] border-[#303136]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-[#4ADE80]" />
                  <span className="text-xs text-[#A1A1AA]">Sessions</span>
                </div>
                <p className="text-2xl font-bold text-[#F3F4F6]">
                  {user.total_sessions || 0}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#24262C] border-[#303136]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-[#F6D365]" />
                  <span className="text-xs text-[#A1A1AA]">Organization</span>
                </div>
                <p className="text-lg font-semibold text-[#F3F4F6] truncate">
                  {user.organization?.name || "—"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Role Assignment */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-[#F3F4F6] flex items-center gap-2">
                <Shield className="h-4 w-4" />
                User Role
              </Label>
              <div className="flex gap-2">
                <Select value={role} onValueChange={(v: "user" | "admin") => setRole(v)}>
                  <SelectTrigger className="flex-1 bg-[#24262C] border-[#303136] text-[#F3F4F6]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#282A30] border-[#303136]">
                    <SelectItem value="user" className="text-[#F3F4F6]">
                      User
                    </SelectItem>
                    <SelectItem value="admin" className="text-[#F3F4F6]">
                      Admin
                    </SelectItem>
                  </SelectContent>
                </Select>
                {role !== user.role && (
                  <Button
                    onClick={handleRoleChange}
                    className="bg-[#60A5FA] hover:bg-[#60A5FA]/90 text-white"
                  >
                    Update Role
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4 border-t border-[#303136] pt-4">
            <h4 className="text-sm font-semibold text-[#F3F4F6]">Actions</h4>
            <div className="flex flex-wrap gap-2">
              {user.status === "active" ? (
                <Button
                  variant="outline"
                  onClick={() => handleUserAction("suspend")}
                  className="border-[#FBBF24] text-[#FBBF24] hover:bg-[#FBBF24]/10"
                  disabled={userActionMutation.isPending}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Suspend User
                </Button>
              ) : user.status === "suspended" ? (
                <Button
                  variant="outline"
                  onClick={() => handleUserAction("restore")}
                  className="border-[#4ADE80] text-[#4ADE80] hover:bg-[#4ADE80]/10"
                  disabled={userActionMutation.isPending}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Restore User
                </Button>
              ) : null}
              <Button
                variant="outline"
                onClick={handleImpersonate}
                className="border-[#60A5FA] text-[#60A5FA] hover:bg-[#60A5FA]/10"
                disabled={impersonateMutation.isPending}
              >
                <User className="mr-2 h-4 w-4" />
                Impersonate
              </Button>
              <Button
                variant="outline"
                onClick={() => handleUserAction("delete")}
                className="border-[#F87171] text-[#F87171] hover:bg-[#F87171]/10"
                disabled={userActionMutation.isPending}
              >
                <UserX className="mr-2 h-4 w-4" />
                Delete User
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="action-reason" className="text-[#A1A1AA] text-sm">
                Action Reason (optional)
              </Label>
              <Textarea
                id="action-reason"
                placeholder="Enter reason for action..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA]"
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
