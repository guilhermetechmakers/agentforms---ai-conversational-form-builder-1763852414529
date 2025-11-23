import { useState, type KeyboardEvent, useRef, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, Loader2, X, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface MessageInputProps {
  onSend: (message: string, attachment?: { url: string; type: string }) => void
  disabled?: boolean
  isLoading?: boolean
  placeholder?: string
  showAttachment?: boolean
  onAttachmentClick?: () => void
  quickSelects?: string[]
  onQuickSelect?: (value: string) => void
  validationError?: string | null
  maxLength?: number
}

export function MessageInput({
  onSend,
  disabled = false,
  isLoading = false,
  placeholder = "Type your message...",
  showAttachment = true,
  onAttachmentClick,
  quickSelects = [],
  onQuickSelect,
  validationError,
  maxLength = 2000,
}: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [attachment, setAttachment] = useState<{ url: string; type: string; name: string } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (message.trim() && !disabled && !isLoading) {
      onSend(message.trim(), attachment ? { url: attachment.url, type: attachment.type } : undefined)
      setMessage("")
      setAttachment(null)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB")
      return
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "text/plain"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("File type not supported. Please upload an image, PDF, or text file.")
      return
    }

    setIsUploading(true)
    try {
      // In a real implementation, upload to Supabase Storage
      // For now, we'll create a data URL as a placeholder
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setAttachment({
          url: result,
          type: file.type,
          name: file.name,
        })
        setIsUploading(false)
        toast.success("File attached successfully")
      }
      reader.onerror = () => {
        toast.error("Failed to read file")
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error("Failed to attach file")
      setIsUploading(false)
    }
  }

  const handleRemoveAttachment = () => {
    setAttachment(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleAttachmentClick = () => {
    if (onAttachmentClick) {
      onAttachmentClick()
    } else {
      fileInputRef.current?.click()
    }
  }

  const remainingChars = maxLength - message.length
  const isNearLimit = remainingChars < 100

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
              className="px-3 py-1.5 text-sm rounded-full bg-[#24262C] border border-[#303136] text-[#A1A1AA] hover:bg-[#303136] hover:text-[#F3F4F6] hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {/* Attachment Preview */}
      {attachment && (
        <div className="mb-4 p-3 bg-[#24262C] border border-[#303136] rounded-lg flex items-center gap-3 animate-fade-in">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#F3F4F6] truncate">{attachment.name}</p>
            <p className="text-xs text-[#A1A1AA]">{attachment.type}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveAttachment}
            className="flex-shrink-0 h-8 w-8 hover:bg-[#303136]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <div className="mb-4 p-3 bg-[#F87171]/10 border border-[#F87171]/30 rounded-lg flex items-start gap-2 animate-fade-in">
          <AlertCircle className="h-4 w-4 text-[#F87171] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#F87171] flex-1">{validationError}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-3">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,application/pdf,text/plain"
        />
        
        {showAttachment && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAttachmentClick}
            disabled={disabled || isLoading || isUploading}
            className="flex-shrink-0 hover:bg-[#303136] transition-colors"
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Paperclip className="h-5 w-5" />
            )}
          </Button>
        )}

        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => {
              if (e.target.value.length <= maxLength) {
                setMessage(e.target.value)
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={1}
            className={cn(
              "min-h-[44px] max-h-32 resize-none pr-12",
              "focus-visible:ring-2 focus-visible:ring-[#60A5FA]",
              validationError && "border-[#F87171] focus-visible:ring-[#F87171]",
              isNearLimit && "border-[#FBBF24]"
            )}
          />
          {isNearLimit && (
            <div className="absolute bottom-2 right-2 text-xs text-[#FBBF24]">
              {remainingChars}
            </div>
          )}
        </div>

        <Button
          onClick={handleSend}
          disabled={disabled || isLoading || !message.trim() || isUploading}
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

      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-[#A1A1AA]">
          Press Enter to send, Shift+Enter for new line
        </p>
        {message.length > 0 && (
          <div className="flex items-center gap-2">
            {validationError ? (
              <div className="flex items-center gap-1 text-xs text-[#F87171]">
                <AlertCircle className="h-3 w-3" />
                <span>Error</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-[#4ADE80]">
                <CheckCircle2 className="h-3 w-3" />
                <span>Ready</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
