import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import type { Message } from "@/types/session"
import { Bot, User } from "lucide-react"

interface ConversationTimelineProps {
  messages: Message[]
  agentName?: string
}

export function ConversationTimeline({ messages }: ConversationTimelineProps) {
  if (messages.length === 0) {
    return (
      <Card className="bg-[#282A30] border-[#303136]">
        <CardHeader>
          <CardTitle className="text-[#F3F4F6]">Conversation Timeline</CardTitle>
          <CardDescription className="text-[#A1A1AA]">Full conversation history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-[#A1A1AA]">
            No messages in this conversation yet.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#282A30] border-[#303136]">
      <CardHeader>
        <CardTitle className="text-[#F3F4F6]">Conversation Timeline</CardTitle>
        <CardDescription className="text-[#A1A1AA]">
          {messages.length} message{messages.length !== 1 ? "s" : ""} in this conversation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isAgent = message.role === "agent"
              const showTimestamp =
                index === 0 ||
                new Date(message.created_at).getTime() -
                  new Date(messages[index - 1].created_at).getTime() >
                  300000 // 5 minutes

              return (
                <React.Fragment key={message.id}>
                  {showTimestamp && (
                    <div className="flex items-center justify-center py-2">
                      <div className="text-xs text-[#A1A1AA] bg-[#24262C] px-3 py-1 rounded-full">
                        {format(new Date(message.created_at), "PPp")}
                      </div>
                    </div>
                  )}
                  <div
                    className={`flex gap-3 ${
                      isAgent ? "justify-start" : "justify-end"
                    } animate-fade-in-up`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {isAgent && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#60A5FA]/20 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-[#60A5FA]" />
                      </div>
                    )}
                    <div className="flex flex-col gap-1 max-w-[75%]">
                      <div
                        className={`rounded-xl p-4 ${
                          isAgent
                            ? "bg-[#24262C] border border-[#303136] text-[#F3F4F6]"
                            : "bg-[#F6D365] text-[#22242A]"
                        } transition-all duration-200 hover:shadow-lg`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        {message.field_key && (
                          <Badge
                            variant="outline"
                            className="mt-2 text-xs border-[#303136] text-[#A1A1AA]"
                          >
                            Collected: {message.field_key}
                          </Badge>
                        )}
                      </div>
                      <div
                        className={`text-xs text-[#A1A1AA] ${
                          isAgent ? "text-left" : "text-right"
                        }`}
                      >
                        {format(new Date(message.created_at), "HH:mm:ss")}
                      </div>
                    </div>
                    {!isAgent && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F472B6]/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-[#F472B6]" />
                      </div>
                    )}
                  </div>
                </React.Fragment>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
