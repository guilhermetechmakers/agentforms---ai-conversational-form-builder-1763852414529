import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react"
import type { ValidationError, Suggestion } from "@/types/test-session"
import { cn } from "@/lib/utils"

interface ErrorValidationLogProps {
  errors: ValidationError[]
  suggestions: Suggestion[]
  className?: string
}

export function ErrorValidationLog({
  errors,
  suggestions,
  className,
}: ErrorValidationLogProps) {
  const getErrorIcon = (severity: ValidationError['severity']) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-[#F87171]" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-[#FBBF24]" />
      case 'info':
        return <Info className="h-4 w-4 text-[#60A5FA]" />
      default:
        return <Info className="h-4 w-4 text-[#A1A1AA]" />
    }
  }

  const getErrorBadgeColor = (severity: ValidationError['severity']) => {
    switch (severity) {
      case 'error':
        return "bg-[#F87171]/10 text-[#F87171] border-[#F87171]/30"
      case 'warning':
        return "bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/30"
      case 'info':
        return "bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/30"
      default:
        return "bg-[#A1A1AA]/10 text-[#A1A1AA] border-[#A1A1AA]/30"
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'validation':
        return "bg-[#F87171]/10 text-[#F87171] border-[#F87171]/30"
      case 'llm':
        return "bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/30"
      case 'schema':
        return "bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/30"
      case 'persona':
        return "bg-[#F472B6]/10 text-[#F472B6] border-[#F472B6]/30"
      default:
        return "bg-[#A1A1AA]/10 text-[#A1A1AA] border-[#A1A1AA]/30"
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-[#FBBF24]" />
          Error & Validation Log
        </CardTitle>
        <CardDescription>
          {errors.length} error(s) and {suggestions.length} suggestion(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {/* Errors */}
            {errors.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[#F3F4F6] mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-[#F87171]" />
                  Errors ({errors.length})
                </h4>
                <div className="space-y-2">
                  {errors.map((error, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#24262C] border border-[#303136]"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {getErrorIcon(error.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className={cn("text-xs", getErrorBadgeColor(error.severity))}
                            >
                              {error.severity}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn("text-xs", getTypeBadgeColor(error.type))}
                            >
                              {error.type}
                            </Badge>
                            {error.field_key && (
                              <Badge variant="outline" className="text-xs">
                                {error.field_key}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-[#F3F4F6]">{error.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[#F3F4F6] mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4 text-[#60A5FA]" />
                  Suggestions ({suggestions.length})
                </h4>
                <div className="space-y-2">
                  {suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 rounded-lg border",
                        suggestion.actionable
                          ? "bg-[#4ADE80]/5 border-[#4ADE80]/30"
                          : "bg-[#24262C] border-[#303136]"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <CheckCircle2
                          className={cn(
                            "h-4 w-4 flex-shrink-0 mt-0.5",
                            suggestion.actionable
                              ? "text-[#4ADE80]"
                              : "text-[#A1A1AA]"
                          )}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className={cn("text-xs", getTypeBadgeColor(suggestion.type))}
                            >
                              {suggestion.type}
                            </Badge>
                            {suggestion.field_key && (
                              <Badge variant="outline" className="text-xs">
                                {suggestion.field_key}
                              </Badge>
                            )}
                            {suggestion.actionable && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/30"
                              >
                                Actionable
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-[#F3F4F6]">{suggestion.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {errors.length === 0 && suggestions.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-[#4ADE80] mx-auto mb-3 opacity-50" />
                <p className="text-sm text-[#A1A1AA]">
                  No errors or suggestions. Your agent configuration looks good!
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
