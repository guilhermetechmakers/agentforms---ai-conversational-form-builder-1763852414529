import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { Field, FieldType } from "@/types/agent"

const fieldSchema = z.object({
  key: z.string().min(1, "Field key is required").regex(/^[a-z0-9_]+$/, "Key must be lowercase letters, numbers, and underscores only"),
  label: z.string().min(1, "Label is required").max(100, "Label is too long"),
  type: z.enum(['text', 'number', 'email', 'date', 'select', 'multi-select', 'attachment']),
  placeholder: z.string().max(200, "Placeholder is too long").optional(),
  required: z.boolean(),
  help_text: z.string().max(500, "Help text is too long").optional(),
  options: z.array(z.string()).optional(),
  validation: z.object({
    regex: z.string().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
  }).optional(),
})

type FieldForm = z.infer<typeof fieldSchema>

interface FieldEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  field?: Field | null
  onSave: (field: Omit<Field, 'id' | 'order'>) => void
  existingKeys?: string[]
}

export function FieldEditorDialog({
  open,
  onOpenChange,
  field,
  onSave,
  existingKeys = [],
}: FieldEditorDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<FieldForm>({
    resolver: zodResolver(fieldSchema),
    defaultValues: field
      ? {
          key: field.key,
          label: field.label,
          type: field.type,
          placeholder: field.placeholder,
          required: field.required,
          help_text: field.help_text,
          options: field.options,
          validation: field.validation,
        }
      : {
          key: '',
          label: '',
          type: 'text',
          placeholder: '',
          required: false,
          help_text: '',
          options: [],
          validation: {},
        },
  })

  const fieldType = watch('type')
  const isSelectType = fieldType === 'select' || fieldType === 'multi-select'

  useEffect(() => {
    if (open && field) {
      reset({
        key: field.key,
        label: field.label,
        type: field.type,
        placeholder: field.placeholder,
        required: field.required,
        help_text: field.help_text,
        options: field.options || [],
        validation: field.validation || {},
      })
    } else if (open && !field) {
      reset({
        key: '',
        label: '',
        type: 'text',
        placeholder: '',
        required: false,
        help_text: '',
        options: [],
        validation: {},
      })
    }
  }, [open, field, reset])

  const onSubmit = (data: FieldForm) => {
    // Check if key already exists (and it's not the current field)
    if (existingKeys.includes(data.key) && (!field || field.key !== data.key)) {
      return // Error will be shown by validation
    }

    onSave({
      key: data.key,
      label: data.label,
      type: data.type,
      placeholder: data.placeholder,
      required: data.required,
      help_text: data.help_text,
      options: isSelectType ? data.options : undefined,
      validation: data.validation,
    })
    reset()
    onOpenChange(false)
  }

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setValue('key', value, { shouldValidate: true })
  }

  const handleOptionsChange = (value: string) => {
    const options = value.split('\n').filter(o => o.trim())
    setValue('options', options)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#282A30] border-[#303136] text-[#F3F4F6] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{field ? 'Edit Field' : 'Add New Field'}</DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            Configure the field properties and validation rules.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="key" className="text-[#F3F4F6]">
                Field Key *
              </Label>
              <Input
                id="key"
                {...register('key')}
                onChange={handleKeyChange}
                placeholder="e.g., customer_name"
                className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA]"
                disabled={!!field} // Can't change key after creation
              />
              {errors.key && (
                <p className="text-sm text-[#F87171]">{errors.key.message}</p>
              )}
              {existingKeys.includes(watch('key')) && (!field || field.key !== watch('key')) && (
                <p className="text-sm text-[#F87171]">This key already exists</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-[#F3F4F6]">
                Field Type *
              </Label>
              <Select
                value={fieldType}
                onValueChange={(value) => setValue('type', value as FieldType)}
              >
                <SelectTrigger className="bg-[#24262C] border-[#303136] text-[#F3F4F6] focus:ring-[#60A5FA]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="select">Select (Single)</SelectItem>
                  <SelectItem value="multi-select">Multi-Select</SelectItem>
                  <SelectItem value="attachment">Attachment</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-[#F87171]">{errors.type.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label" className="text-[#F3F4F6]">
              Label *
            </Label>
            <Input
              id="label"
              {...register('label')}
              placeholder="e.g., Customer Name"
              className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA]"
            />
            {errors.label && (
              <p className="text-sm text-[#F87171]">{errors.label.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="placeholder" className="text-[#F3F4F6]">
              Placeholder
            </Label>
            <Input
              id="placeholder"
              {...register('placeholder')}
              placeholder="e.g., Enter your name"
              className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA]"
            />
            {errors.placeholder && (
              <p className="text-sm text-[#F87171]">{errors.placeholder.message}</p>
            )}
          </div>

          {isSelectType && (
            <div className="space-y-2">
              <Label htmlFor="options" className="text-[#F3F4F6]">
                Options (one per line) *
              </Label>
              <Textarea
                id="options"
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                defaultValue={watch('options')?.join('\n') || ''}
                onChange={(e) => handleOptionsChange(e.target.value)}
                className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA] min-h-[100px]"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="help_text" className="text-[#F3F4F6]">
              Help Text
            </Label>
            <Textarea
              id="help_text"
              {...register('help_text')}
              placeholder="Additional guidance for users"
              className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA]"
              rows={2}
            />
            {errors.help_text && (
              <p className="text-sm text-[#F87171]">{errors.help_text.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={watch('required')}
              onCheckedChange={(checked) => setValue('required', checked)}
            />
            <Label htmlFor="required" className="text-[#F3F4F6] cursor-pointer">
              Required field
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
              className="border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
            >
              {field ? 'Update Field' : 'Add Field'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
