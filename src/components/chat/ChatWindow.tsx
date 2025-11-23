import { useEffect, useRef, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import type { Message } from "@/types/session"
import { CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatWindowProps {
  messages: Message[]
  agentName: string
  agentAvatarUrl?: string
  isTyping?: boolean
  className?: string
  fieldValues?: Array<{
    field_key: string
    validated: boolean
    validation_error?: string | null
  }>
}

export function ChatWindow({
  messages,
  agentName,
  agentAvatarUrl,
  isTyping = false,
  className,
  fieldValues = [],
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [visibleMessages, setVisibleMessages] = useState<Set<string>>(new Set())

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Animate messages in with stagger effect
  useEffect(() => {
    messages.forEach((message, index) => {
      if (!visibleMessages.has(message.id)) {
        setTimeout(() => {
          setVisibleMessages((prev) => new Set([...prev, message.id]))
        }, index * 50) // Stagger by 50ms
      }
    })
  }, [messages, visibleMessages])

  // Get validation status for a message
  const getValidationStatus = (message: Message) => {
    if (message.field_key) {
      const fieldValue = fieldValues.find((fv) => fv.field_key === message.field_key)
      if (fieldValue) {
        if (fieldValue.validated) {
          return "valid"
        } else if (fieldValue.validation_error) {
          return "error"
        }
      }
    }
    return null
  }

  return (
    <ScrollArea className={`flex-1 ${className}`}>
      <div className="flex flex-col gap-4 p-4 md:p-6 min-h-full">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-[#A1A1AA] text-sm">
            Start the conversation by sending a message...
          </div>
        )}

        {messages.map((message, index) => {
          const validationStatus = getValidationStatus(message)
          const isVisible = visibleMessages.has(message.id)
          
          return (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 transition-all duration-300",
                message.role === "agent" ? "justify-start" : "justify-end",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {message.role === "agent" && (
                <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-[#303136]">
                  {agentAvatarUrl ? (
                    <AvatarImage src={agentAvatarUrl} alt={agentName} />
                  ) : (
                    <AvatarFallback className="bg-[#24262C] text-[#F6D365]">
                      {agentName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              )}

              <div
                className={cn(
                  "flex flex-col max-w-[80%] md:max-w-[70%] transition-all duration-200",
                  message.role === "agent" ? "items-start" : "items-end",
                  "hover:scale-[1.01]"
                )}
              >
                <div
                  className={cn(
                    "rounded-xl px-4 py-2.5 transition-all duration-200",
                    "shadow-card hover:shadow-lg",
                    message.role === "agent"
                      ? "bg-[#24262C] text-[#F3F4F6] border border-[#303136]"
                      : "bg-[#F6D365] text-[#22242A]",
                    validationStatus === "valid" && "ring-2 ring-[#4ADE80] ring-offset-2 ring-offset-[#22242A]",
                    validationStatus === "error" && "ring-2 ring-[#F87171] ring-offset-2 ring-offset-[#22242A]"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  {message.attachment_url && (
                    <div className="mt-2">
                      <a
                        href={message.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#60A5FA] hover:underline flex items-center gap-1"
                      >
                        <span>📎</span>
                        <span>Attachment</span>
                      </a>
                    </div>
                  )}
                  {/* Validation indicator */}
                  {validationStatus && message.role === "visitor" && (
                    <div className="mt-2 flex items-center gap-1.5">
                      {validationStatus === "valid" ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#4ADE80]" />
                          <span className="text-xs text-[#4ADE80]">Validated</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5 text-[#F87171]" />
                          <span className="text-xs text-[#F87171]">
                            {fieldValues.find((fv) => fv.field_key === message.field_key)?.validation_error || "Validation error"}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#A1A1AA] px-1">
                    {format(new Date(message.created_at), "h:mm a")}
                  </span>
                  {validationStatus === "valid" && message.role === "visitor" && (
                    <CheckCircle2 className="h-3 w-3 text-[#4ADE80]" />
                  )}
                </div>
              </div>

              {message.role === "visitor" && (
                <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-[#303136]">
                  <AvatarFallback className="bg-[#60A5FA] text-[#22242A] font-semibold">
                    You
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          )
        })}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 justify-start animate-fade-in-up">
            <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-[#303136]">
              {agentAvatarUrl ? (
                <AvatarImage src={agentAvatarUrl} alt={agentName} />
              ) : (
                <AvatarFallback className="bg-[#24262C] text-[#F6D365]">
                  {agentName.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex items-center gap-2 bg-[#24262C] border border-[#303136] rounded-xl px-4 py-2.5 shadow-card">
              <div className="flex gap-1">
                <span className="h-2 w-2 bg-[#A1A1AA] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 bg-[#A1A1AA] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 bg-[#A1A1AA] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-sm text-[#A1A1AA]">Typing...</span>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
