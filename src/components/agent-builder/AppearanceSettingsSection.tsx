import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import type { VisualSettings } from "@/types/agent"

interface AppearanceSettingsSectionProps {
  visuals: VisualSettings
  onUpdateVisuals: (updates: Partial<VisualSettings>) => void
}

export function AppearanceSettingsSection({
  visuals,
  onUpdateVisuals,
}: AppearanceSettingsSectionProps) {
  const handleImageUpload = (
    type: 'avatar' | 'logo',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real implementation, upload to Supabase Storage
      // For now, create a local preview
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
                  <ImageIcon className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
                      asChild
                    >
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Avatar
                      </span>
                    </Button>
                    <input
                      id="avatar-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('avatar', e)}
                    />
                  </Label>
                  {visuals.avatar_url && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateVisuals({ avatar_url: undefined })}
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onUpdateVisuals({ logo_url: undefined })}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-[#282A30] border border-[#303136] text-[#F87171] hover:bg-[#24262C]"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#303136] rounded-lg p-4">
                  <ImageIcon className="h-8 w-8 text-[#6B7280] mb-2" />
                  <p className="text-xs text-[#A1A1AA] mb-2">No logo uploaded</p>
                </div>
              )}
              <div className="flex-1 space-y-2">
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </span>
                  </Button>
                  <input
                    id="logo-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('logo', e)}
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
