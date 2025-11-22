import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import type { Message } from "@/types/session"
import { Loader2 } from "lucide-react"

interface ChatWindowProps {
  messages: Message[]
  agentName: string
  agentAvatarUrl?: string
  isTyping?: boolean
  className?: string
}

export function ChatWindow({
  messages,
  agentName,
  agentAvatarUrl,
  isTyping = false,
  className,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  return (
    <ScrollArea className={`flex-1 ${className}`}>
      <div className="flex flex-col gap-4 p-4 md:p-6 min-h-full">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-[#A1A1AA] text-sm">
            Start the conversation by sending a message...
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 animate-fade-in-up ${
              message.role === "agent" ? "justify-start" : "justify-end"
            }`}
          >
            {message.role === "agent" && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                {agentAvatarUrl ? (
                  <AvatarImage src={agentAvatarUrl} alt={agentName} />
                ) : (
                  <AvatarFallback>
                    {agentName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
            )}

            <div
              className={`flex flex-col max-w-[80%] md:max-w-[70%] ${
                message.role === "agent" ? "items-start" : "items-end"
              }`}
            >
              <div
                className={`rounded-xl px-4 py-2.5 ${
                  message.role === "agent"
                    ? "bg-[#24262C] text-[#F3F4F6] border border-[#303136]"
                    : "bg-[#F6D365] text-[#22242A]"
                }`}
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
                      className="text-xs text-[#60A5FA] hover:underline"
                    >
                      📎 Attachment
                    </a>
                  </div>
                )}
              </div>
              <span className="text-xs text-[#A1A1AA] mt-1 px-1">
                {format(new Date(message.created_at), "h:mm a")}
              </span>
            </div>

            {message.role === "visitor" && (
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-[#60A5FA]">
                  You
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 justify-start animate-fade-in-up">
            <Avatar className="h-8 w-8 flex-shrink-0">
              {agentAvatarUrl ? (
                <AvatarImage src={agentAvatarUrl} alt={agentName} />
              ) : (
                <AvatarFallback>
                  {agentName.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex items-center gap-1 bg-[#24262C] border border-[#303136] rounded-xl px-4 py-2.5">
              <Loader2 className="h-4 w-4 text-[#A1A1AA] animate-spin" />
              <span className="text-sm text-[#A1A1AA]">Typing...</span>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
