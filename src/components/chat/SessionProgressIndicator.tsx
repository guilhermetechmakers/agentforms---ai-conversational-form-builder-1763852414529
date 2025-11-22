import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Circle } from "lucide-react"
import type { Field } from "@/types/agent"
import type { FieldValue } from "@/types/session"
import { cn } from "@/lib/utils"

interface SessionProgressIndicatorProps {
  fields: Field[]
  fieldValues: FieldValue[]
  className?: string
  onToggle?: () => void
  isCollapsed?: boolean
}

export function SessionProgressIndicator({
  fields,
  fieldValues,
  className,
  onToggle,
  isCollapsed = false,
}: SessionProgressIndicatorProps) {
  // Only show required fields
  const requiredFields = fields.filter((f) => f.required)
  const completedFields = fieldValues.filter((fv) => fv.validated).length
  const progress = requiredFields.length > 0
    ? Math.round((completedFields / requiredFields.length) * 100)
    : 100

  if (requiredFields.length === 0) {
    return null
  }

  if (isCollapsed) {
    return (
      <button
        onClick={onToggle}
        className={cn(
          "fixed right-4 bottom-20 md:bottom-24 z-10",
          "bg-[#282A30] border border-[#303136] rounded-full p-3",
          "hover:bg-[#24262C] transition-colors shadow-lg",
          className
        )}
        aria-label="Show progress"
      >
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-[#F3F4F6]">
            {completedFields}/{requiredFields.length}
          </div>
          <Progress value={progress} className="w-16 h-2" />
        </div>
      </button>
    )
  }

  return (
    <Card className={cn("p-4 md:p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#F3F4F6]">
          Progress
        </h3>
        {onToggle && (
          <button
            onClick={onToggle}
            className="text-xs text-[#A1A1AA] hover:text-[#F3F4F6] transition-colors"
          >
            Hide
          </button>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#A1A1AA]">
            {completedFields} of {requiredFields.length} completed
          </span>
          <span className="text-xs font-semibold text-[#4ADE80]">
            {progress}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {requiredFields.map((field) => {
          const value = fieldValues.find((fv) => fv.field_key === field.key)
          const isCompleted = value?.validated ?? false

          return (
            <div
              key={field.id}
              className="flex items-center gap-2 text-sm"
            >
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-[#4ADE80] flex-shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-[#A1A1AA] flex-shrink-0" />
              )}
              <span
                className={cn(
                  "text-xs",
                  isCompleted ? "text-[#A1A1AA] line-through" : "text-[#F3F4F6]"
                )}
              >
                {field.label}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
