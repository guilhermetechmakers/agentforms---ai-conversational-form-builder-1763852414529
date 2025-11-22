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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDeleteAccount } from "@/hooks/useProfile"
import { Loader2, AlertTriangle } from "lucide-react"

interface DeleteAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
}: DeleteAccountDialogProps) {
  const deleteAccount = useDeleteAccount()
  const [confirmText, setConfirmText] = useState("")
  const [isConfirmed, setIsConfirmed] = useState(false)

  const requiresConfirmation = confirmText.toLowerCase() === "delete"

  const handleDelete = async () => {
    if (!requiresConfirmation) return

    try {
      await deleteAccount.mutateAsync()
      // Redirect handled by mutation
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#F87171]">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-[#F87171]/20 bg-[#F87171]/10 p-4">
            <p className="text-sm text-[#F3F4F6]">
              <strong>Warning:</strong> Deleting your account will:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#A1A1AA]">
              <li>Permanently delete all your agents and configurations</li>
              <li>Remove all session data and conversation history</li>
              <li>Cancel any active subscriptions</li>
              <li>Delete all uploaded files and media</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-delete">
              Type <strong className="text-[#F87171]">DELETE</strong> to confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value)
                setIsConfirmed(e.target.value.toLowerCase() === "delete")
              }}
              placeholder="DELETE"
              className="bg-[#24262C] border-[#303136]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setConfirmText("")
              setIsConfirmed(false)
              onOpenChange(false)
            }}
            disabled={deleteAccount.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || deleteAccount.isPending}
            className="bg-[#F87171] text-white hover:bg-[#F87171]/90"
          >
            {deleteAccount.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Account"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
