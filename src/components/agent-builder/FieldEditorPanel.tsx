import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import type { Field } from "@/types/agent"

interface FieldEditorPanelProps {
  field: Field | null
  onUpdateField: (updates: Partial<Field>) => void
}

export function FieldEditorPanel({ field, onUpdateField }: FieldEditorPanelProps) {
  if (!field) {
    return (
      <Card className="bg-[#282A30] border-[#303136]">
        <CardContent className="p-8 text-center">
          <p className="text-[#A1A1AA] text-sm">
            Select a field from the sidebar to edit its properties
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#282A30] border-[#303136]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#F3F4F6]">{field.label}</CardTitle>
            <CardDescription className="text-[#A1A1AA]">
              {field.type.replace('-', ' ')} • {field.key}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {field.required && (
              <Badge variant="destructive" className="bg-[#F87171] text-white">
                Required
              </Badge>
            )}
            <Badge variant="secondary" className="capitalize">
              {field.type.replace('-', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="field-label" className="text-[#F3F4F6]">
            Label
          </Label>
          <Input
            id="field-label"
            value={field.label}
            onChange={(e) => onUpdateField({ label: e.target.value })}
            className="bg-[#24262C] border-[#303136] text-[#F3F4F6] focus:ring-[#60A5FA]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="field-placeholder" className="text-[#F3F4F6]">
            Placeholder
          </Label>
          <Input
            id="field-placeholder"
            value={field.placeholder || ''}
            onChange={(e) => onUpdateField({ placeholder: e.target.value || undefined })}
            className="bg-[#24262C] border-[#303136] text-[#F3F4F6] focus:ring-[#60A5FA]"
            placeholder="Enter placeholder text"
          />
        </div>

        {(field.type === 'select' || field.type === 'multi-select') && field.options && (
          <div className="space-y-2">
            <Label className="text-[#F3F4F6]">Options</Label>
            <div className="space-y-1">
              {field.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-[#24262C] rounded-lg border border-[#303136]"
                >
                  <span className="text-sm text-[#F3F4F6] flex-1">{option}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#A1A1AA]">
              Options can be edited in the field dialog
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="field-help" className="text-[#F3F4F6]">
            Help Text
          </Label>
          <Textarea
            id="field-help"
            value={field.help_text || ''}
            onChange={(e) => onUpdateField({ help_text: e.target.value || undefined })}
            className="bg-[#24262C] border-[#303136] text-[#F3F4F6] focus:ring-[#60A5FA]"
            placeholder="Additional guidance for users"
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-[#24262C] rounded-lg border border-[#303136]">
          <div>
            <Label htmlFor="field-required" className="text-[#F3F4F6] cursor-pointer">
              Required Field
            </Label>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Users must provide a value for this field
            </p>
          </div>
          <Switch
            id="field-required"
            checked={field.required}
            onCheckedChange={(checked) => onUpdateField({ required: checked })}
          />
        </div>

        {field.validation && (
          <div className="p-4 bg-[#24262C] rounded-lg border border-[#303136]">
            <Label className="text-[#F3F4F6] mb-2 block">Validation Rules</Label>
            <div className="space-y-2 text-sm text-[#A1A1AA]">
              {field.validation.min !== undefined && (
                <div>Min: {field.validation.min}</div>
              )}
              {field.validation.max !== undefined && (
                <div>Max: {field.validation.max}</div>
              )}
              {field.validation.minLength !== undefined && (
                <div>Min Length: {field.validation.minLength}</div>
              )}
              {field.validation.maxLength !== undefined && (
                <div>Max Length: {field.validation.maxLength}</div>
              )}
              {field.validation.regex && (
                <div className="font-mono text-xs">Regex: {field.validation.regex}</div>
              )}
            </div>
            <p className="text-xs text-[#A1A1AA] mt-2">
              Validation rules can be edited in the field dialog
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
