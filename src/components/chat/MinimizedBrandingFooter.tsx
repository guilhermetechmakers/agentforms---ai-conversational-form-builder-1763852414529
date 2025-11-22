import { Copy, QrCode, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"
import type { Agent } from "@/types/agent"

interface MinimizedBrandingFooterProps {
  agent: Agent
  sessionUrl: string
  className?: string
}

export function MinimizedBrandingFooter({
  agent,
  sessionUrl,
  className,
}: MinimizedBrandingFooterProps) {
  const [showQR, setShowQR] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sessionUrl)
    toast.success("Link copied to clipboard!")
  }

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: `Chat with ${agent.name}`,
          text: `Start a conversation with ${agent.name}`,
          url: sessionUrl,
        })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <div
      className={`border-t border-[#303136] bg-[#22242A] px-4 py-3 ${className}`}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {agent.visuals?.logo_url ? (
            <img
              src={agent.visuals.logo_url}
              alt={agent.name}
              className="h-6 w-6 object-contain"
            />
          ) : null}
          <span className="text-xs text-[#A1A1AA]">
            Powered by {agent.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="h-8 px-2 text-[#A1A1AA] hover:text-[#F3F4F6]"
          >
            <Copy className="h-4 w-4" />
          </Button>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-8 px-2 text-[#A1A1AA] hover:text-[#F3F4F6]"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQR(!showQR)}
            className="h-8 px-2 text-[#A1A1AA] hover:text-[#F3F4F6]"
          >
            <QrCode className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* QR Code Modal (simplified - would need QR library in production) */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#282A30] rounded-xl p-6 max-w-sm w-full mx-4 border border-[#303136]">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-[#F3F4F6] mb-4">
                Scan to share
              </h3>
              <div className="bg-white p-4 rounded-lg mb-4 flex items-center justify-center">
                {/* QR Code would be generated here - placeholder */}
                <div className="text-[#22242A] text-xs">
                  QR Code Placeholder
                  <br />
                  (Install qrcode library to generate)
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowQR(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
