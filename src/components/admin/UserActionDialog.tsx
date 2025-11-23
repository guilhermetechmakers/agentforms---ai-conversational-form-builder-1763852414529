import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import type { UserManagementUser } from "@/types/admin"

interface UserActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserManagementUser
  action: "suspend" | "delete" | "restore"
  onConfirm: (reason?: string) => void
}

export function UserActionDialog({
  open,
  onOpenChange,
  user,
  action,
  onConfirm,
}: UserActionDialogProps) {
  const [reason, setReason] = useState("")

  const actionLabels = {
    suspend: "Suspend User",
    delete: "Delete User",
    restore: "Restore User",
  }

  const actionDescriptions = {
    suspend: `Are you sure you want to suspend ${user.email}? This will prevent them from accessing the platform.`,
    delete: `Are you sure you want to delete ${user.email}? This action cannot be undone and will permanently remove all user data.`,
    restore: `Are you sure you want to restore ${user.email}? This will allow them to access the platform again.`,
  }

  const handleConfirm = () => {
    onConfirm(reason || undefined)
    setReason("")
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#282A30] border-[#303136]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#F3F4F6]">
            {actionLabels[action]}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#A1A1AA]">
            {actionDescriptions[action]}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-[#F3F4F6]">
              Reason (optional)
            </Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for this action..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA]"
              rows={3}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={`${
              action === "delete"
                ? "bg-[#F87171] hover:bg-[#F87171]/90 text-white"
                : action === "restore"
                ? "bg-[#4ADE80] hover:bg-[#4ADE80]/90 text-white"
                : "bg-[#FBBF24] hover:bg-[#FBBF24]/90 text-[#22242A]"
            }`}
          >
            {actionLabels[action]}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
