import { useEffect, useRef, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2 } from "lucide-react"
import { format } from "date-fns"
import type { ConversationMessage } from "@/types/test-session"
import { cn } from "@/lib/utils"

interface SandboxChatWindowProps {
  messages: ConversationMessage[]
  agentName: string
  agentAvatarUrl?: string
  isTyping?: boolean
  onSendMessage: (message: string) => void
  disabled?: boolean
  className?: string
}

export function SandboxChatWindow({
  messages,
  agentName,
  agentAvatarUrl,
  isTyping = false,
  onSendMessage,
  disabled = false,
  className,
}: SandboxChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [inputValue, setInputValue] = useState("")

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSend = () => {
    if (!inputValue.trim() || disabled) return
    onSendMessage(inputValue.trim())
    setInputValue("")
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 p-4 md:p-6 min-h-full">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-[#A1A1AA] text-sm">
              Start testing by sending a message...
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-fade-in-up",
                message.role === "agent" ? "justify-start" : "justify-end"
              )}
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
                className={cn(
                  "flex flex-col max-w-[80%] md:max-w-[70%]",
                  message.role === "agent" ? "items-start" : "items-end"
                )}
              >
                <div
                  className={cn(
                    "rounded-xl px-4 py-2.5",
                    message.role === "agent"
                      ? "bg-[#24262C] text-[#F3F4F6] border border-[#303136]"
                      : "bg-[#F6D365] text-[#22242A]"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  {message.field_key && (
                    <div className="mt-2 text-xs text-[#A1A1AA]">
                      Field: <span className="text-[#60A5FA]">{message.field_key}</span>
                    </div>
                  )}
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
                  {format(new Date(message.timestamp), "h:mm a")}
                </span>
              </div>

              {message.role === "user" && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-[#60A5FA]">
                    You
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

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
              <div className="bg-[#24262C] border border-[#303136] rounded-xl px-4 py-2.5">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#A1A1AA] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-[#A1A1AA] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-[#A1A1AA] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-[#303136] p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={disabled}
            className="flex-1 bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA]"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || disabled}
            className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90 hover:scale-[1.02] transition-all"
          >
            {disabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
