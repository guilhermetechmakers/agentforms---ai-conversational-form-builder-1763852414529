import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useProfile, useUpdateProfile, useUploadAvatar } from "@/hooks/useProfile"
import { Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"

const profileSchema = z.object({
  full_name: z.string().min(1, "Name is required").max(100),
  company: z.string().max(100).optional().or(z.literal("")),
  contact_number: z.string().max(20).optional().or(z.literal("")),
  timezone: z.string().min(1, "Timezone is required"),
  language: z.string().min(1, "Language is required"),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const { data: profileData } = useProfile()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profileData?.profile?.full_name || "",
      company: profileData?.profile?.company || "",
      contact_number: profileData?.profile?.contact_number || "",
      timezone: profileData?.profile?.timezone || "UTC",
      language: profileData?.profile?.language || "en",
    },
  })

  // Reset form when profile data changes
  React.useEffect(() => {
    if (profileData?.profile) {
      reset({
        full_name: profileData.profile.full_name || "",
        company: profileData.profile.company || "",
        contact_number: profileData.profile.contact_number || "",
        timezone: profileData.profile.timezone || "UTC",
        language: profileData.profile.language || "en",
      })
      setAvatarPreview(profileData.profile.avatar_url || null)
    }
  }, [profileData, reset])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Avatar image must be less than 5MB")
        return
      }
      if (!file.type.startsWith("image/")) {
        toast.error("File must be an image")
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Upload avatar if changed
      let avatarUrl = profileData?.profile?.avatar_url
      if (avatarFile) {
        avatarUrl = await uploadAvatar.mutateAsync(avatarFile)
      }

      // Update profile
      await updateProfile.mutateAsync({
        full_name: data.full_name,
        company: data.company || undefined,
        contact_number: data.contact_number || undefined,
        timezone: data.timezone,
        language: data.language,
        avatar_url: avatarUrl,
      })

      onOpenChange(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const avatarUrl = avatarPreview || profileData?.profile?.avatar_url
  const initials = profileData?.profile?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal information and preferences.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl || undefined} alt="Avatar" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4" />
                  Upload Avatar
                </span>
              </Button>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </Label>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              {...register("full_name")}
              placeholder="John Doe"
              className="bg-[#24262C] border-[#303136]"
            />
            {errors.full_name && (
              <p className="text-sm text-[#F87171]">{errors.full_name.message}</p>
            )}
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              {...register("company")}
              placeholder="Acme Inc."
              className="bg-[#24262C] border-[#303136]"
            />
            {errors.company && (
              <p className="text-sm text-[#F87171]">{errors.company.message}</p>
            )}
          </div>

          {/* Contact Number */}
          <div className="space-y-2">
            <Label htmlFor="contact_number">Contact Number</Label>
            <Input
              id="contact_number"
              {...register("contact_number")}
              placeholder="+1 (555) 123-4567"
              className="bg-[#24262C] border-[#303136]"
            />
            {errors.contact_number && (
              <p className="text-sm text-[#F87171]">{errors.contact_number.message}</p>
            )}
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <select
              id="timezone"
              {...register("timezone")}
              className="flex h-10 w-full rounded-md border border-[#303136] bg-[#24262C] px-3 py-2 text-sm text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:ring-offset-2"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
            {errors.timezone && (
              <p className="text-sm text-[#F87171]">{errors.timezone.message}</p>
            )}
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              {...register("language")}
              className="flex h-10 w-full rounded-md border border-[#303136] bg-[#24262C] px-3 py-2 text-sm text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:ring-offset-2"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
              <option value="zh">Chinese</option>
            </select>
            {errors.language && (
              <p className="text-sm text-[#F87171]">{errors.language.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
              disabled={isSubmitting || uploadAvatar.isPending}
            >
              {isSubmitting || uploadAvatar.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
