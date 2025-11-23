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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Download, FileText, FileJson } from "lucide-react"
import { useExportSessions } from "@/hooks/useSessions"
import { toast } from "sonner"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionIds: string[]
}

export function ExportDialog({ open, onOpenChange, sessionIds }: ExportDialogProps) {
  const [format, setFormat] = useState<"csv" | "json">("csv")
  const exportMutation = useExportSessions()

  const handleExport = async () => {
    if (sessionIds.length === 0) {
      toast.error("No sessions selected for export")
      return
    }

    try {
      await exportMutation.mutateAsync({ ids: sessionIds, format })
      onOpenChange(false)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#F3F4F6]">
            Export Sessions
          </DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            {sessionIds.length > 0
              ? `Export ${sessionIds.length} session(s) in your preferred format`
              : "No sessions selected"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={format} onValueChange={(value) => setFormat(value as "csv" | "json")}>
            <div className="flex items-center space-x-2 p-4 rounded-lg border border-[#303136] hover:bg-[#282A30] transition-colors cursor-pointer">
              <RadioGroupItem value="csv" id="csv" className="text-[#F6D365]" />
              <Label
                htmlFor="csv"
                className="flex-1 cursor-pointer flex items-center gap-2 text-[#F3F4F6]"
              >
                <FileText className="h-4 w-4 text-[#A1A1AA]" />
                <div>
                  <p className="font-medium">CSV Format</p>
                  <p className="text-sm text-[#A1A1AA]">
                    Spreadsheet-compatible format
                  </p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 rounded-lg border border-[#303136] hover:bg-[#282A30] transition-colors cursor-pointer">
              <RadioGroupItem value="json" id="json" className="text-[#F6D365]" />
              <Label
                htmlFor="json"
                className="flex-1 cursor-pointer flex items-center gap-2 text-[#F3F4F6]"
              >
                <FileJson className="h-4 w-4 text-[#A1A1AA]" />
                <div>
                  <p className="font-medium">JSON Format</p>
                  <p className="text-sm text-[#A1A1AA]">
                    Complete session data with all details
                  </p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-[#A1A1AA] border-[#303136] hover:bg-[#282A30]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={exportMutation.isPending || sessionIds.length === 0}
            className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
          >
            {exportMutation.isPending ? (
              <>Exporting...</>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export {sessionIds.length} Session(s)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
