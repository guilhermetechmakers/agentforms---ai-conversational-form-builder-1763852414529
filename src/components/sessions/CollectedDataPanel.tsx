import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Edit2, Save, X } from "lucide-react"
import type { FieldValue } from "@/types/session"
import { useUpdateFieldValue } from "@/hooks/useSessions"

interface CollectedDataPanelProps {
  fieldValues: FieldValue[]
  sessionId: string
}

export function CollectedDataPanel({ fieldValues, sessionId }: CollectedDataPanelProps) {
  const [editingFieldId, setEditingFieldId] = React.useState<string | null>(null)
  const [editValue, setEditValue] = React.useState<string>("")
  const updateFieldValue = useUpdateFieldValue()

  const handleStartEdit = (field: FieldValue) => {
    setEditingFieldId(field.id)
    setEditValue(
      typeof field.value === "object" ? JSON.stringify(field.value, null, 2) : String(field.value)
    )
  }

  const handleCancelEdit = () => {
    setEditingFieldId(null)
    setEditValue("")
  }

  const handleSaveEdit = async (fieldId: string) => {
    try {
      let parsedValue: string | number | string[] | Record<string, unknown> = editValue

      // Try to parse as JSON if it looks like JSON
      if (editValue.trim().startsWith("{") || editValue.trim().startsWith("[")) {
        try {
          parsedValue = JSON.parse(editValue)
        } catch {
          // If parsing fails, use as string
          parsedValue = editValue
        }
      }

      await updateFieldValue.mutateAsync({
        sessionId,
        fieldId,
        value: parsedValue,
      })
      setEditingFieldId(null)
      setEditValue("")
    } catch (error) {
      // Error is handled by the hook
    }
  }

  if (fieldValues.length === 0) {
    return (
      <Card className="bg-[#282A30] border-[#303136]">
        <CardHeader>
          <CardTitle className="text-[#F3F4F6]">Collected Data</CardTitle>
          <CardDescription className="text-[#A1A1AA]">
            Structured data extracted from the conversation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-[#A1A1AA]">No data collected yet.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#282A30] border-[#303136]">
      <CardHeader>
        <CardTitle className="text-[#F3F4F6]">Collected Data</CardTitle>
        <CardDescription className="text-[#A1A1AA]">
          {fieldValues.length} field{fieldValues.length !== 1 ? "s" : ""} collected
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {fieldValues.map((field) => {
            const isEditing = editingFieldId === field.id
            const isRedacted = field.value === "[REDACTED]"

            return (
              <div
                key={field.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  isEditing
                    ? "border-[#60A5FA] bg-[#24262C]"
                    : "border-[#303136] bg-[#24262C] hover:border-[#303136]/80"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-[#F3F4F6] capitalize">
                        {field.field_key}
                      </span>
                      {field.validated ? (
                        <Badge
                          variant="outline"
                          className="text-xs border-[#4ADE80]/30 text-[#4ADE80] bg-[#4ADE80]/10"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Validated
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs border-[#FBBF24]/30 text-[#FBBF24] bg-[#FBBF24]/10"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                      {isRedacted && (
                        <Badge
                          variant="outline"
                          className="text-xs border-[#F87171]/30 text-[#F87171] bg-[#F87171]/10"
                        >
                          Redacted
                        </Badge>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="bg-[#282A30] border-[#303136] text-[#F3F4F6] focus:border-[#60A5FA]"
                          placeholder="Enter value..."
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(field.id)}
                            disabled={updateFieldValue.isPending}
                            className="bg-[#4ADE80] text-white hover:bg-[#4ADE80]/90 h-8"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={updateFieldValue.isPending}
                            className="border-[#303136] text-[#A1A1AA] hover:bg-[#282A30] h-8"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-[#F3F4F6] break-words">
                        {isRedacted ? (
                          <code className="text-[#F87171]">[REDACTED]</code>
                        ) : typeof field.value === "object" ? (
                          <pre className="whitespace-pre-wrap text-xs bg-[#282A30] p-2 rounded border border-[#303136]">
                            {JSON.stringify(field.value, null, 2)}
                          </pre>
                        ) : (
                          String(field.value)
                        )}
                      </div>
                    )}
                    {field.validation_error && !isEditing && (
                      <p className="text-xs text-[#F87171] mt-1">{field.validation_error}</p>
                    )}
                  </div>
                  {!isEditing && !isRedacted && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartEdit(field)}
                      className="text-[#A1A1AA] hover:text-[#F3F4F6] hover:bg-[#282A30]"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
