import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Bot } from "lucide-react"
import type { Agent } from "@/types/agent"

interface PreviewPaneProps {
  agent: Partial<Agent>
}

export function PreviewPane({ agent }: PreviewPaneProps) {
  const persona = agent.persona || {}
  const visuals = agent.visuals || {}
  const fields = agent.schema?.fields || []

  const welcomeMessage =
    visuals.welcome_message || persona.welcome_message || "Hi! How can I help you today?"

  return (
    <Card className="bg-[#282A30] border-[#303136] h-full flex flex-col">
      <CardHeader className="border-b border-[#303136]">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#F3F4F6] flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Preview
          </CardTitle>
          <Badge variant="secondary" className="bg-[#4ADE80] text-white">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Welcome Banner */}
        <div
          className="p-6 border-b border-[#303136]"
          style={{
            backgroundColor: visuals.primary_color
              ? `${visuals.primary_color}15`
              : '#24262C',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-12 w-12 border-2 border-[#303136]">
              <AvatarImage src={visuals.avatar_url} />
              <AvatarFallback>
                <Bot className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-[#F3F4F6]">
                {persona.name || agent.name || 'Agent'}
              </h3>
              {visuals.logo_url && (
                <img
                  src={visuals.logo_url}
                  alt="Logo"
                  className="h-6 mt-1 object-contain"
                />
              )}
            </div>
          </div>
          <p className="text-sm text-[#F3F4F6]">{welcomeMessage}</p>
        </div>

        {/* Chat Window */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Agent Message */}
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={visuals.avatar_url} />
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-[#24262C] rounded-lg p-3 border border-[#303136]">
                  <p className="text-sm text-[#F3F4F6]">{welcomeMessage}</p>
                </div>
                <p className="text-xs text-[#A1A1AA] mt-1 ml-1">Just now</p>
              </div>
            </div>

            {/* Visitor Message Example */}
            <div className="flex gap-3 justify-end">
              <div className="flex-1 flex justify-end">
                <div className="bg-[#60A5FA] rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm text-white">Hello! I'd like to get started.</p>
                </div>
              </div>
            </div>

            {/* Agent Response Example */}
            {fields.length > 0 && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={visuals.avatar_url} />
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-[#24262C] rounded-lg p-3 border border-[#303136]">
                    <p className="text-sm text-[#F3F4F6] mb-2">
                      {fields[0].label}
                      {fields[0].required && (
                        <span className="text-[#F87171] ml-1">*</span>
                      )}
                    </p>
                    {fields[0].help_text && (
                      <p className="text-xs text-[#A1A1AA] mb-2">
                        {fields[0].help_text}
                      </p>
                    )}
                    {fields[0].type === 'select' && fields[0].options && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {fields[0].options.slice(0, 3).map((option, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="border-[#303136] text-[#F3F4F6] hover:bg-[#24262C] cursor-pointer"
                          >
                            {option}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[#A1A1AA] mt-1 ml-1">Just now</p>
                </div>
              </div>
            )}

            {fields.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-[#A1A1AA]">
                  Add fields to see how the conversation will flow
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-[#303136] bg-[#24262C]">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#282A30] border border-[#303136] rounded-lg px-4 py-2 text-sm text-[#A1A1AA]">
              Type a message...
            </div>
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              style={{
                backgroundColor: visuals.primary_color || '#F6D365',
                color: '#22242A',
              }}
            >
              <MessageCircle className="h-5 w-5" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
