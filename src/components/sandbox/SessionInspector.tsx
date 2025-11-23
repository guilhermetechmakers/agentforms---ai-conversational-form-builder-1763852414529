import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, AlertCircle } from "lucide-react"
import type { Field } from "@/types/agent"
import { cn } from "@/lib/utils"

interface SessionInspectorProps {
  collectedFields: Record<string, any>
  missingFields: string[]
  agentFields: Field[]
  conversationLog: Array<{ id: string; role: string; content: string; timestamp: string }>
  className?: string
}

export function SessionInspector({
  collectedFields,
  missingFields,
  agentFields,
  conversationLog,
  className,
}: SessionInspectorProps) {
  const fieldMap = new Map(agentFields.map(f => [f.key, f]))

  const getFieldLabel = (key: string) => {
    return fieldMap.get(key)?.label || key
  }

  const getFieldType = (key: string) => {
    return fieldMap.get(key)?.type || 'text'
  }

  const isFieldRequired = (key: string) => {
    return fieldMap.get(key)?.required || false
  }

  return (
    <div className={cn("flex flex-col gap-4 h-full", className)}>
      {/* Collected Fields */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-lg">Collected Fields</CardTitle>
          <CardDescription>
            {Object.keys(collectedFields).length} of {agentFields.length} fields collected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {Object.entries(collectedFields).length === 0 ? (
                <div className="text-sm text-[#A1A1AA] text-center py-4">
                  No fields collected yet
                </div>
              ) : (
                Object.entries(collectedFields).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-3 rounded-lg bg-[#24262C] border border-[#303136]"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#F3F4F6]">
                          {getFieldLabel(key)}
                        </span>
                        {isFieldRequired(key) && (
                          <Badge variant="outline" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-[#4ADE80]" />
                    </div>
                    <div className="text-xs text-[#A1A1AA] mb-1">
                      {getFieldType(key)}
                    </div>
                    <div className="text-sm text-[#F3F4F6] mt-2">
                      {Array.isArray(value) ? (
                        <div className="flex flex-wrap gap-1">
                          {value.map((item, idx) => (
                            <Badge key={idx} className="bg-[#60A5FA]/20 text-[#60A5FA]">
                              {String(item)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="break-words">{String(value)}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Missing Fields */}
      {missingFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#FBBF24]" />
              Missing Required Fields
            </CardTitle>
            <CardDescription>
              {missingFields.length} required field(s) still need to be collected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {missingFields.map((key) => (
                <Badge
                  key={key}
                  variant="outline"
                  className="bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/30"
                >
                  {getFieldLabel(key)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversation Log Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conversation Log</CardTitle>
          <CardDescription>
            {conversationLog.length} message(s) in this session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[150px]">
            <div className="space-y-2">
              {conversationLog.length === 0 ? (
                <div className="text-sm text-[#A1A1AA] text-center py-4">
                  No messages yet
                </div>
              ) : (
                conversationLog.map((msg) => (
                  <div
                    key={msg.id}
                    className="text-xs p-2 rounded bg-[#24262C] border border-[#303136]"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          msg.role === "agent"
                            ? "bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/30"
                            : "bg-[#F6D365]/10 text-[#F6D365] border-[#F6D365]/30"
                        )}
                      >
                        {msg.role}
                      </Badge>
                      <span className="text-[#A1A1AA]">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[#F3F4F6] line-clamp-2">
                      {msg.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
