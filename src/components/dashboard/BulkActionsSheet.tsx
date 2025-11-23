import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
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
import { Trash2, Copy } from "lucide-react"
import { useBulkDeleteAgents, useDuplicateAgent } from "@/hooks/useAgents"
import { toast } from "sonner"

interface BulkActionsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedAgentIds: string[]
  onComplete: () => void
}

export function BulkActionsSheet({
  open,
  onOpenChange,
  selectedAgentIds,
  onComplete,
}: BulkActionsSheetProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const bulkDelete = useBulkDeleteAgents()
  const duplicateAgent = useDuplicateAgent()

  const handleBulkDelete = async () => {
    try {
      await bulkDelete.mutateAsync(selectedAgentIds)
      onComplete()
      onOpenChange(false)
      setDeleteConfirmOpen(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleBulkDuplicate = async () => {
    try {
      await Promise.all(
        selectedAgentIds.map((id) => duplicateAgent.mutateAsync(id))
      )
      toast.success(`${selectedAgentIds.length} agent(s) duplicated!`)
      onComplete()
      onOpenChange(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="bg-[#282A30] border-[#303136] text-[#F3F4F6] w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Bulk Actions</SheetTitle>
            <SheetDescription className="text-[#A1A1AA]">
              {selectedAgentIds.length} agent(s) selected
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <Button
              variant="outline"
              onClick={handleBulkDuplicate}
              disabled={duplicateAgent.isPending}
              className="w-full justify-start border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate Selected
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(true)}
              className="w-full justify-start border-[#F87171] text-[#F87171] hover:bg-[#F87171]/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-[#282A30] border-[#303136] text-[#F3F4F6]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedAgentIds.length} Agent(s)?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#A1A1AA]">
              This action cannot be undone. All selected agents and their associated
              sessions and data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteConfirmOpen(false)}
              className="border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkDelete.isPending}
              className="bg-[#F87171] text-white hover:bg-[#F87171]/90"
            >
              {bulkDelete.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
