import { useState, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  isLoading?: boolean
  placeholder?: string
  showAttachment?: boolean
  onAttachmentClick?: () => void
  quickSelects?: string[]
  onQuickSelect?: (value: string) => void
}

export function MessageInput({
  onSend,
  disabled = false,
  isLoading = false,
  placeholder = "Type your message...",
  showAttachment = false,
  onAttachmentClick,
  quickSelects = [],
  onQuickSelect,
}: MessageInputProps) {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (message.trim() && !disabled && !isLoading) {
      onSend(message.trim())
      setMessage("")
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-[#303136] bg-[#282A30] p-4 md:p-6">
      {/* Quick Select Options */}
      {quickSelects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {quickSelects.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                onQuickSelect?.(option)
                setMessage("")
              }}
              disabled={disabled || isLoading}
              className="px-3 py-1.5 text-sm rounded-full bg-[#24262C] border border-[#303136] text-[#A1A1AA] hover:bg-[#303136] hover:text-[#F3F4F6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-3">
        {showAttachment && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onAttachmentClick}
            disabled={disabled || isLoading}
            className="flex-shrink-0"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
        )}

        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={1}
            className={cn(
              "min-h-[44px] max-h-32 resize-none pr-12",
              "focus-visible:ring-2 focus-visible:ring-[#60A5FA]"
            )}
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={disabled || isLoading || !message.trim()}
          size="icon"
          className="flex-shrink-0 bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      <p className="text-xs text-[#A1A1AA] mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}
