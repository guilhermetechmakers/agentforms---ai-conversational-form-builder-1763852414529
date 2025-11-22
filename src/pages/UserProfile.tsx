import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Edit,
  Lock,
  Shield,
  Download,
  Trash2,
  Users,
  CreditCard,
  Loader2,
  Mail,
  Building,
  Globe,
  Languages,
} from "lucide-react"
import { useProfile, useDisable2FA, useExportData } from "@/hooks/useProfile"
import { EditProfileDialog } from "@/components/profile/EditProfileDialog"
import { ChangePasswordDialog } from "@/components/profile/ChangePasswordDialog"
import { ActiveSessionsList } from "@/components/profile/ActiveSessionsList"
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog"

export default function UserProfile() {
  const { data: profileData, isLoading } = useProfile()
  const disable2FA = useDisable2FA()
  const exportData = useExportData()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#A1A1AA]" />
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <p className="text-[#A1A1AA]">Unable to load profile data.</p>
      </div>
    )
  }

  const profile = profileData.profile
  const initials = profile?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  const handle2FAToggle = async (enabled: boolean) => {
    if (!enabled && profile?.two_factor_enabled) {
      if (confirm("Are you sure you want to disable two-factor authentication?")) {
        await disable2FA.mutateAsync()
      }
    }
    // Enable 2FA would require a separate flow with QR code generation
    // For now, we'll just handle disabling
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F3F4F6]">User Profile</h1>
          <p className="text-[#A1A1AA] mt-1">Manage your account settings and preferences</p>
        </div>
      </div>

      {/* Profile Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profile Summary</CardTitle>
              <CardDescription>Your personal information and account details</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url || undefined} alt="Avatar" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <p className="text-[#F3F4F6] font-medium">{profileData.email}</p>
                  {profileData.email_verified ? (
                    <span className="inline-flex items-center gap-1 text-xs text-[#4ADE80]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]"></span>
                      Verified
                    </span>
                  ) : (
                    <span className="text-xs text-[#FBBF24]">Not verified</span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                    <Users className="h-4 w-4" />
                    Name
                  </div>
                  <p className="text-[#F3F4F6] font-medium">
                    {profile?.full_name || "Not set"}
                  </p>
                </div>

                {profile?.company && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                      <Building className="h-4 w-4" />
                      Company
                    </div>
                    <p className="text-[#F3F4F6] font-medium">{profile.company}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                    <Shield className="h-4 w-4" />
                    Role
                  </div>
                  <p className="text-[#F3F4F6] font-medium capitalize">{profile?.role || "user"}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                    <Globe className="h-4 w-4" />
                    Timezone
                  </div>
                  <p className="text-[#F3F4F6] font-medium">{profile?.timezone || "UTC"}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                    <Languages className="h-4 w-4" />
                    Language
                  </div>
                  <p className="text-[#F3F4F6] font-medium">
                    {profile?.language ? profile.language.toUpperCase() : "EN"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your security settings and authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Change Password */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#A1A1AA]" />
                <p className="font-medium text-[#F3F4F6]">Password</p>
              </div>
              <p className="text-sm text-[#A1A1AA]">
                Update your password to keep your account secure
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPasswordDialogOpen(true)}
            >
              Change Password
            </Button>
          </div>

          <Separator className="bg-[#303136]" />

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#A1A1AA]" />
                <p className="font-medium text-[#F3F4F6]">Two-Factor Authentication</p>
              </div>
              <p className="text-sm text-[#A1A1AA]">
                Add an extra layer of security to your account
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#A1A1AA]">
                {profile?.two_factor_enabled ? "Enabled" : "Disabled"}
              </span>
              <Switch
                checked={profile?.two_factor_enabled || false}
                onCheckedChange={handle2FAToggle}
                disabled={disable2FA.isPending}
              />
            </div>
          </div>

          <Separator className="bg-[#303136]" />

          {/* Active Sessions */}
          <ActiveSessionsList />
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Access related settings and features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button
              variant="outline"
              className="h-auto justify-start p-4 hover:bg-[#282A30]"
              asChild
            >
              <Link to="/dashboard/settings?tab=team">
                <Users className="mr-3 h-5 w-5 text-[#F6D365]" />
                <div className="text-left">
                  <p className="font-medium text-[#F3F4F6]">Team Management</p>
                  <p className="text-sm text-[#A1A1AA]">Manage team members and roles</p>
                </div>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto justify-start p-4 hover:bg-[#282A30]"
              asChild
            >
              <Link to="/checkout">
                <CreditCard className="mr-3 h-5 w-5 text-[#60A5FA]" />
                <div className="text-left">
                  <p className="font-medium text-[#F3F4F6]">Billing & Subscription</p>
                  <p className="text-sm text-[#A1A1AA]">Manage your plan and payment</p>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Data Controls</CardTitle>
          <CardDescription>Export or delete your account data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-[#303136] bg-[#24262C] p-4">
            <div className="space-y-0.5">
              <p className="font-medium text-[#F3F4F6]">Export Account Data</p>
              <p className="text-sm text-[#A1A1AA]">
                Download a copy of all your data in JSON format
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportData.mutate()}
              disabled={exportData.isPending}
              className="gap-2"
            >
              {exportData.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export Data
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[#F87171]/20 bg-[#F87171]/5 p-4">
            <div className="space-y-0.5">
              <p className="font-medium text-[#F3F4F6]">Delete Account</p>
              <p className="text-sm text-[#A1A1AA]">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="gap-2 text-[#F87171] border-[#F87171]/20 hover:bg-[#F87171]/10 hover:text-[#F87171]"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EditProfileDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} />
      <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
      <DeleteAccountDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
    </div>
  )
}
