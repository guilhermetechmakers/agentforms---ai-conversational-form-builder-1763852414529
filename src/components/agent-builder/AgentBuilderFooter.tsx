import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ValidationWarning {
  type: 'error' | 'warning' | 'info'
  message: string
}

interface AgentBuilderFooterProps {
  isSaving: boolean
  lastSaved: Date | null
  validationWarnings: ValidationWarning[]
}

export function AgentBuilderFooter({
  isSaving,
  lastSaved,
  validationWarnings,
}: AgentBuilderFooterProps) {
  const errors = validationWarnings.filter(w => w.type === 'error')
  const warnings = validationWarnings.filter(w => w.type === 'warning')
  const infos = validationWarnings.filter(w => w.type === 'info')

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  return (
    <div className="border-t border-[#303136] bg-[#22242A] px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Autosave Status */}
        <div className="flex items-center gap-2">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 text-[#60A5FA] animate-spin" />
              <span className="text-sm text-[#A1A1AA]">Saving...</span>
            </>
          ) : lastSaved ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-[#4ADE80]" />
              <span className="text-sm text-[#A1A1AA]">
                Saved at {formatTime(lastSaved)}
              </span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4 text-[#6B7280]" />
              <span className="text-sm text-[#6B7280]">Not saved</span>
            </>
          )}
        </div>

        {/* Validation Warnings */}
        {validationWarnings.length > 0 && (
          <div className="flex items-center gap-2">
            {errors.length > 0 && (
              <Badge
                variant="destructive"
                className="bg-[#F87171] text-white flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                {errors.length} error{errors.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {warnings.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-[#FBBF24] text-white flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {infos.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-[#60A5FA] text-white flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                {infos.length} info
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Validation Messages */}
      {validationWarnings.length > 0 && (
        <div className="flex-1 max-w-2xl">
          <div className="space-y-1">
            {validationWarnings.slice(0, 3).map((warning, index) => (
              <div
                key={index}
                className={cn(
                  "text-xs flex items-center gap-2",
                  warning.type === 'error' && "text-[#F87171]",
                  warning.type === 'warning' && "text-[#FBBF24]",
                  warning.type === 'info' && "text-[#60A5FA]"
                )}
              >
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{warning.message}</span>
              </div>
            ))}
            {validationWarnings.length > 3 && (
              <p className="text-xs text-[#A1A1AA]">
                +{validationWarnings.length - 3} more
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
