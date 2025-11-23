import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, FileJson, CheckCircle2, AlertCircle } from "lucide-react"
import type { ExportDataType, ExportFormat } from "@/types/export"

interface ExportConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  dataType: ExportDataType
  format: ExportFormat
  filters?: {
    agent_ids?: string[]
    date_from?: string
    date_to?: string
    status?: string
  }
  isLoading?: boolean
}

export function ExportConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  dataType,
  format,
  filters,
  isLoading = false,
}: ExportConfirmationModalProps) {
  const formatLabel = format.toUpperCase()
  const dataTypeLabel =
    dataType === "sessions"
      ? "Sessions"
      : dataType === "agents"
        ? "Agents"
        : "All Data"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#F3F4F6] flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#4ADE80]" />
            Confirm Export
          </DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            Please review your export configuration before proceeding
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Export Summary */}
          <div className="p-4 rounded-lg border border-[#303136] bg-[#24262C] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA]">Data Type:</span>
              <Badge variant="outline" className="border-[#303136] text-[#F3F4F6]">
                {dataTypeLabel}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A1A1AA]">Format:</span>
              <div className="flex items-center gap-2">
                {format === "csv" ? (
                  <FileText className="h-4 w-4 text-[#A1A1AA]" />
                ) : (
                  <FileJson className="h-4 w-4 text-[#A1A1AA]" />
                )}
                <Badge variant="outline" className="border-[#303136] text-[#F3F4F6]">
                  {formatLabel}
                </Badge>
              </div>
            </div>
          </div>

          {/* Filters Summary */}
          {filters && (
            <div className="p-4 rounded-lg border border-[#303136] bg-[#24262C] space-y-2">
              <h4 className="text-sm font-semibold text-[#F3F4F6]">Applied Filters:</h4>
              <div className="space-y-1 text-sm text-[#A1A1AA]">
                {filters.agent_ids && filters.agent_ids.length > 0 && (
                  <div>
                    <span className="text-[#F3F4F6]">Agents:</span> {filters.agent_ids.length} selected
                  </div>
                )}
                {filters.date_from && (
                  <div>
                    <span className="text-[#F3F4F6]">From:</span> {new Date(filters.date_from).toLocaleDateString()}
                  </div>
                )}
                {filters.date_to && (
                  <div>
                    <span className="text-[#F3F4F6]">To:</span> {new Date(filters.date_to).toLocaleDateString()}
                  </div>
                )}
                {filters.status && filters.status !== "all" && (
                  <div>
                    <span className="text-[#F3F4F6]">Status:</span> {filters.status}
                  </div>
                )}
                {(!filters.agent_ids?.length &&
                  !filters.date_from &&
                  !filters.date_to &&
                  (!filters.status || filters.status === "all")) && (
                  <div className="text-[#A1A1AA]">No filters applied (all data)</div>
                )}
              </div>
            </div>
          )}

          {/* Info Message */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-[#282A30] border border-[#303136]">
            <AlertCircle className="h-5 w-5 text-[#F6D365] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-[#A1A1AA]">
              <p className="font-medium text-[#F3F4F6] mb-1">Note:</p>
              <p>
                The export will be processed and a download link will be provided. The link will
                expire in 24 hours.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="text-[#A1A1AA] border-[#303136] hover:bg-[#282A30]"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
          >
            {isLoading ? "Creating..." : "Confirm & Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
