import * as React from "react"
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
import { Download } from "lucide-react"

interface ExportOptionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (format: "csv" | "json") => void
  isLoading?: boolean
}

export function ExportOptionsModal({
  open,
  onOpenChange,
  onExport,
  isLoading = false,
}: ExportOptionsModalProps) {
  const [format, setFormat] = React.useState<"csv" | "json">("json")

  const handleExport = () => {
    onExport(format)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#F3F4F6]">Export Session Data</DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            Choose the format for exporting this session's data
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup value={format} onValueChange={(value) => setFormat(value as "csv" | "json")}>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-[#303136] hover:bg-[#282A30] transition-colors">
              <RadioGroupItem value="json" id="json" className="text-[#F6D365]" />
              <Label htmlFor="json" className="flex-1 cursor-pointer text-[#F3F4F6]">
                <div className="font-medium">JSON</div>
                <div className="text-sm text-[#A1A1AA]">Structured data with full details</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-[#303136] hover:bg-[#282A30] transition-colors">
              <RadioGroupItem value="csv" id="csv" className="text-[#F6D365]" />
              <Label htmlFor="csv" className="flex-1 cursor-pointer text-[#F3F4F6]">
                <div className="font-medium">CSV</div>
                <div className="text-sm text-[#A1A1AA]">Spreadsheet-friendly format</div>
              </Label>
            </div>
          </RadioGroup>
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
            onClick={handleExport}
            disabled={isLoading}
            className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
          >
            <Download className="mr-2 h-4 w-4" />
            {isLoading ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
