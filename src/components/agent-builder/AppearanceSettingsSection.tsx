import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { storageApi } from "@/lib/storage"
import type { VisualSettings } from "@/types/agent"

interface AppearanceSettingsSectionProps {
  visuals: VisualSettings
  onUpdateVisuals: (updates: Partial<VisualSettings>) => void
  agentId?: string
}

export function AppearanceSettingsSection({
  visuals,
  onUpdateVisuals,
  agentId,
}: AppearanceSettingsSectionProps) {
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const handleImageUpload = async (
    type: 'avatar' | 'logo',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file")
      return
    }

    // Validate file size (5MB max for images)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("Image size exceeds 5MB limit")
      return
    }

    if (type === 'avatar') {
      setUploadingAvatar(true)
    } else {
      setUploadingLogo(true)
    }

    try {
      if (!agentId) {
        // For new agents, create a preview and upload after agent creation
        const reader = new FileReader()
        reader.onloadend = () => {
          const url = reader.result as string
          if (type === 'avatar') {
            onUpdateVisuals({ avatar_url: url })
          } else {
            onUpdateVisuals({ logo_url: url })
          }
        }
        reader.readAsDataURL(file)
        toast.info("Image will be uploaded when you save the agent")
        if (type === 'avatar') {
          setUploadingAvatar(false)
        } else {
          setUploadingLogo(false)
        }
        return
      }

      // Upload to Supabase Storage
      const fileUrl = type === 'avatar'
        ? await storageApi.uploadAgentAvatar(agentId, file)
        : await storageApi.uploadAgentLogo(agentId, file)

      if (type === 'avatar') {
        onUpdateVisuals({ avatar_url: fileUrl })
      } else {
        onUpdateVisuals({ logo_url: fileUrl })
      }

      toast.success(`${type === 'avatar' ? 'Avatar' : 'Logo'} uploaded successfully!`)
    } catch (error) {
      console.error("Image upload error:", error)
      toast.error(`Failed to upload ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      if (type === 'avatar') {
        setUploadingAvatar(false)
      } else {
        setUploadingLogo(false)
      }
    }
  }

  const handleRemoveImage = async (type: 'avatar' | 'logo') => {
    const url = type === 'avatar' ? visuals.avatar_url : visuals.logo_url
    if (url && agentId) {
      try {
        // Extract path from URL and delete from storage
        const urlParts = url.split('/')
        const pathIndex = urlParts.indexOf('agent-assets')
        if (pathIndex !== -1) {
          const path = urlParts.slice(pathIndex + 1).join('/')
          await storageApi.deleteFile('agent-assets', path)
        }
      } catch (error) {
        console.error("Image deletion error:", error)
        // Continue with removal even if deletion fails
      }
    }

    if (type === 'avatar') {
      onUpdateVisuals({ avatar_url: undefined })
    } else {
      onUpdateVisuals({ logo_url: undefined })
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[#282A30] border-[#303136]">
        <CardHeader>
          <CardTitle className="text-[#F3F4F6]">Appearance Settings</CardTitle>
          <CardDescription className="text-[#A1A1AA]">
            Customize the visual branding of your agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="primary-color" className="text-[#F3F4F6]">
              Primary Color
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="primary-color"
                type="color"
                value={visuals.primary_color || '#F6D365'}
                onChange={(e) => onUpdateVisuals({ primary_color: e.target.value })}
                className="h-12 w-24 cursor-pointer"
              />
              <Input
                type="text"
                value={visuals.primary_color || '#F6D365'}
                onChange={(e) => onUpdateVisuals({ primary_color: e.target.value })}
                placeholder="#F6D365"
                className="bg-[#24262C] border-[#303136] text-[#F3F4F6] focus:ring-[#60A5FA] flex-1"
              />
            </div>
            <p className="text-xs text-[#A1A1AA]">
              Used for buttons, highlights, and accent elements
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-[#F3F4F6]">Agent Avatar</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-[#303136]">
                <AvatarImage src={visuals.avatar_url} alt="Agent avatar" />
                <AvatarFallback className="bg-[#F472B6] text-[#22242A] text-lg">
                  {uploadingAvatar ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <ImageIcon className="h-8 w-8" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingAvatar}
                      className="border-[#303136] text-[#F3F4F6] hover:bg-[#24262C] disabled:opacity-50"
                      asChild
                    >
                      <span>
                        {uploadingAvatar ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        {uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                      </span>
                    </Button>
                    <input
                      id="avatar-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('avatar', e)}
                      disabled={uploadingAvatar}
                    />
                  </Label>
                  {visuals.avatar_url && !uploadingAvatar && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveImage('avatar')}
                      className="border-[#303136] text-[#F87171] hover:bg-[#24262C]"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-[#A1A1AA]">
                  Recommended: 200x200px, square image
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#F3F4F6]">Logo</Label>
            <div className="flex items-center gap-4">
              {visuals.logo_url ? (
                <div className="relative">
                  <img
                    src={visuals.logo_url}
                    alt="Logo"
                    className="h-16 object-contain"
                  />
                  {!uploadingLogo && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveImage('logo')}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-[#282A30] border border-[#303136] text-[#F87171] hover:bg-[#24262C]"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#303136] rounded-lg p-4">
                  {uploadingLogo ? (
                    <Loader2 className="h-8 w-8 text-[#60A5FA] animate-spin mx-auto mb-2" />
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 text-[#6B7280] mb-2" />
                      <p className="text-xs text-[#A1A1AA] mb-2">No logo uploaded</p>
                    </>
                  )}
                </div>
              )}
              <div className="flex-1 space-y-2">
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingLogo}
                    className="border-[#303136] text-[#F3F4F6] hover:bg-[#24262C] disabled:opacity-50"
                    asChild
                  >
                    <span>
                      {uploadingLogo ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    </span>
                  </Button>
                  <input
                    id="logo-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('logo', e)}
                    disabled={uploadingLogo}
                  />
                </Label>
                <p className="text-xs text-[#A1A1AA]">
                  Recommended: Transparent PNG, max height 100px
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcome-message-visual" className="text-[#F3F4F6]">
              Welcome Message
            </Label>
            <Input
              id="welcome-message-visual"
              value={visuals.welcome_message || ''}
              onChange={(e) =>
                onUpdateVisuals({ welcome_message: e.target.value || undefined })
              }
              placeholder="Welcome to our service!"
              className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA]"
            />
            <p className="text-xs text-[#A1A1AA]">
              Displayed in the welcome banner (overrides persona welcome message if set)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
