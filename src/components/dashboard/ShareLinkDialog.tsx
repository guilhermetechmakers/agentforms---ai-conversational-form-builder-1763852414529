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
import { Copy, Check, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import type { AgentWithStats } from "@/types/usage"

interface ShareLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: AgentWithStats
}

export function ShareLinkDialog({
  open,
  onOpenChange,
  agent,
}: ShareLinkDialogProps) {
  const [copied, setCopied] = useState(false)
  const publicUrl = agent.public_url || `${window.location.origin}/a/${agent.id}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#282A30] border-[#303136] text-[#F3F4F6]">
        <DialogHeader>
          <DialogTitle>Share Agent Link</DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            Share this link to allow visitors to interact with your agent
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-[#F3F4F6]">
              Public URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="url"
                value={publicUrl}
                readOnly
                className="bg-[#24262C] border-[#303136] text-[#F3F4F6]"
              />
              <Button
                type="button"
                onClick={handleCopy}
                className="bg-[#282A30] border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-[#4ADE80]" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-[#24262C] border border-[#303136]">
            <p className="text-sm text-[#A1A1AA] mb-2">Agent Status:</p>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  agent.status === "published"
                    ? "bg-[#4ADE80]/20 text-[#4ADE80]"
                    : "bg-[#FBBF24]/20 text-[#FBBF24]"
                }`}
              >
                {agent.status}
              </span>
              {agent.status !== "published" && (
                <span className="text-xs text-[#A1A1AA]">
                  Publish the agent to make it accessible
                </span>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
          >
            Close
          </Button>
          {agent.status === "published" && (
            <Button
              onClick={() => {
                window.open(publicUrl, "_blank")
              }}
              className="bg-[#60A5FA] text-white hover:bg-[#60A5FA]/90"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Link
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
