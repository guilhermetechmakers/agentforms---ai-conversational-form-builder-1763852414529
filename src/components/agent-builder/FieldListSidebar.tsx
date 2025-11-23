import { useState } from "react"
import { GripVertical, Plus, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Field } from "@/types/agent"

interface FieldListSidebarProps {
  fields: Field[]
  selectedFieldId: string | null
  onSelectField: (fieldId: string | null) => void
  onAddField: () => void
  onEditField: (field: Field) => void
  onDeleteField: (fieldId: string) => void
  onReorderFields: (fields: Field[]) => void
}

export function FieldListSidebar({
  fields,
  selectedFieldId,
  onSelectField,
  onAddField,
  onEditField,
  onDeleteField,
  onReorderFields,
}: FieldListSidebarProps) {
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    setDraggedFieldId(fieldId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', fieldId)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)

    if (!draggedFieldId) return

    const draggedIndex = fields.findIndex(f => f.id === draggedFieldId)
    if (draggedIndex === -1 || draggedIndex === dropIndex) return

    const newFields = [...fields]
    const [removed] = newFields.splice(draggedIndex, 1)
    newFields.splice(dropIndex, 0, removed)

    // Update order values
    const reorderedFields = newFields.map((field, index) => ({
      ...field,
      order: index,
    }))

    onReorderFields(reorderedFields)
    setDraggedFieldId(null)
  }

  const handleDragEnd = () => {
    setDraggedFieldId(null)
    setDragOverIndex(null)
  }

  return (
    <div className="flex flex-col h-full bg-[#22242A] border-r border-[#303136]">
      {/* Header */}
      <div className="p-4 border-b border-[#303136]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[#F3F4F6]">Fields</h2>
          <Button
            onClick={onAddField}
            size="sm"
            className="bg-[#60A5FA] text-white hover:bg-[#60A5FA]/90 h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        <p className="text-xs text-[#A1A1AA]">
          {fields.length} field{fields.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Field List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {fields.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-[#A1A1AA] mb-4">
                No fields yet. Add your first field to get started.
              </p>
              <Button
                onClick={onAddField}
                variant="outline"
                size="sm"
                className="border-[#303136] text-[#F3F4F6] hover:bg-[#282A30]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>
          ) : (
            fields.map((field, index) => (
              <div
                key={field.id}
                draggable
                onDragStart={(e) => handleDragStart(e, field.id)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "group relative flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all duration-200",
                  "bg-[#282A30] border border-[#303136]",
                  "hover:bg-[#24262C] hover:border-[#303136]",
                  selectedFieldId === field.id && "bg-[#24262C] border-[#F6D365] border-l-4",
                  draggedFieldId === field.id && "opacity-50",
                  dragOverIndex === index && "border-[#60A5FA] border-l-4"
                )}
                onClick={() => onSelectField(field.id)}
              >
                {/* Drag Handle */}
                <GripVertical className="h-4 w-4 text-[#6B7280] cursor-move flex-shrink-0" />

                {/* Field Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-[#F3F4F6] truncate">
                      {field.label}
                    </span>
                    {field.required && (
                      <Badge
                        variant="secondary"
                        className="bg-[#F87171] text-white text-xs px-1.5 py-0 h-4"
                      >
                        Required
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#A1A1AA] capitalize">
                      {field.type.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-[#6B7280]">•</span>
                    <span className="text-xs text-[#6B7280] font-mono">
                      {field.key}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-[#A1A1AA] hover:text-[#F3F4F6] hover:bg-[#24262C]"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditField(field)
                    }}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-[#A1A1AA] hover:text-[#F87171] hover:bg-[#24262C]"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteField(field.id)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
