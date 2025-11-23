import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  UserPlus,
  MoreVertical,
  Mail,
  Shield,
  Trash2,
  Loader2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTeamMembers, useInviteTeamMember, useUpdateTeamMember, useRemoveTeamMember } from "@/hooks/useSettings"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["owner", "admin", "member"]),
})

type InviteFormData = z.infer<typeof inviteSchema>

export function TeamManagementSection() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const { data: teamMembers, isLoading } = useTeamMembers()
  const inviteMember = useInviteTeamMember()
  const updateMember = useUpdateTeamMember()
  const removeMember = useRemoveTeamMember()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: "member",
    },
  })

  const onSubmit = async (data: InviteFormData) => {
    try {
      await inviteMember.mutateAsync({
        email: data.email,
        role: data.role,
      })
      reset()
      setInviteDialogOpen(false)
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleRoleChange = async (memberId: string, newRole: "owner" | "admin" | "member") => {
    try {
      await updateMember.mutateAsync({
        id: memberId,
        data: { role: newRole },
      })
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleRemove = async (memberId: string) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      try {
        await removeMember.mutateAsync(memberId)
      } catch (error) {
        // Error handled by hook
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#A1A1AA]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Team Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>Manage your team members and their roles</CardDescription>
            </div>
            <Button
              onClick={() => setInviteDialogOpen(true)}
              className="bg-[#F6D365] hover:bg-[#F6D365]/90 text-[#22242A]"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {teamMembers && teamMembers.length > 0 ? (
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-[#303136] bg-[#24262C] hover:bg-[#282A30] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-[#F472B6] flex items-center justify-center text-white font-semibold">
                      {member.user_id.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-[#F3F4F6]">
                        {member.status === "pending" ? "Pending Invitation" : "Team Member"}
                      </div>
                      <div className="text-sm text-[#A1A1AA] flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {member.user_id}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        member.role === "owner"
                          ? "default"
                          : member.role === "admin"
                          ? "secondary"
                          : "outline"
                      }
                      className="capitalize"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {member.role}
                    </Badge>
                    <Badge
                      variant={member.status === "active" ? "default" : "outline"}
                      className="capitalize"
                    >
                      {member.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(member.id, "owner")}
                          disabled={member.role === "owner"}
                        >
                          Set as Owner
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(member.id, "admin")}
                          disabled={member.role === "admin"}
                        >
                          Set as Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(member.id, "member")}
                          disabled={member.role === "member"}
                        >
                          Set as Member
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRemove(member.id)}
                          className="text-[#F87171]"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-[#A1A1AA] mx-auto mb-4" />
              <p className="text-[#A1A1AA] mb-4">No team members yet</p>
              <Button
                onClick={() => setInviteDialogOpen(true)}
                className="bg-[#F6D365] hover:bg-[#F6D365]/90 text-[#22242A]"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Your First Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SSO Configuration (Enterprise) */}
      <Card>
        <CardHeader>
          <CardTitle>Single Sign-On (SSO)</CardTitle>
          <CardDescription>
            Configure SAML or OIDC for enterprise authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[#A1A1AA] mb-4">
            SSO configuration is available for enterprise plans. Contact support to enable SSO for your organization.
          </p>
          <Button variant="outline" disabled>
            Configure SSO
          </Button>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your team. They will receive an email with instructions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                {...register("email")}
                className="bg-[#24262C] border-[#303136]"
              />
              {errors.email && (
                <p className="text-sm text-[#F87171]">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={watch("role")}
                onValueChange={(value) => setValue("role", value as "owner" | "admin" | "member")}
              >
                <SelectTrigger className="bg-[#24262C] border-[#303136]">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-[#F87171]">{errors.role.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#F6D365] hover:bg-[#F6D365]/90 text-[#22242A]"
                disabled={inviteMember.isPending}
              >
                {inviteMember.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
