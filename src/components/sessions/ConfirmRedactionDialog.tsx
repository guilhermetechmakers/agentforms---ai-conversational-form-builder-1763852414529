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
import { AlertTriangle } from "lucide-react"

interface ConfirmRedactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  fieldCount?: number
  isLoading?: boolean
}

export function ConfirmRedactionDialog({
  open,
  onOpenChange,
  onConfirm,
  fieldCount,
  isLoading = false,
}: ConfirmRedactionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#282A30] border-[#303136]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#F87171]/20 p-2">
              <AlertTriangle className="h-5 w-5 text-[#F87171]" />
            </div>
            <div>
              <AlertDialogTitle className="text-[#F3F4F6]">
                Confirm PII Redaction
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-[#A1A1AA] pt-4">
            {fieldCount ? (
              <>
                You are about to redact personally identifiable information from{" "}
                <strong className="text-[#F3F4F6]">{fieldCount}</strong> field(s). This action
                cannot be undone.
              </>
            ) : (
              <>
                You are about to redact all personally identifiable information from this session.
                This action cannot be undone.
              </>
            )}
            <br />
            <br />
            All selected field values will be replaced with <code className="px-1.5 py-0.5 rounded bg-[#24262C] text-[#F87171]">[REDACTED]</code>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading}
            className="text-[#A1A1AA] border-[#303136] hover:bg-[#282A30]"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-[#F87171] text-white hover:bg-[#F87171]/90"
          >
            {isLoading ? "Redacting..." : "Confirm Redaction"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
