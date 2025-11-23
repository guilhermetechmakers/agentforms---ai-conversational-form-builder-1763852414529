import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Clock, Webhook, Download } from "lucide-react"
import type { ExportSchedule } from "@/types/export"

const scheduleFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  data_type: z.enum(["sessions", "agents", "all"]),
  format: z.enum(["csv", "json"]),
  frequency: z.enum(["daily", "weekly", "monthly", "custom"]),
  delivery_method: z.enum(["download", "webhook", "both"]),
  webhook_url: z.string().url().optional().or(z.literal("")),
  hour: z.number().min(0).max(23).default(0),
  minute: z.number().min(0).max(59).default(0),
})

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>

interface ScheduleSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ScheduleFormValues) => void
  schedule?: ExportSchedule | null
  isLoading?: boolean
}

export function ScheduleSetupDialog({
  open,
  onOpenChange,
  onSubmit,
  schedule,
  isLoading = false,
}: ScheduleSetupDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      name: schedule?.name || "",
      description: schedule?.description || "",
      enabled: schedule?.enabled ?? true,
      data_type: schedule?.data_type || "sessions",
      format: schedule?.format || "csv",
      frequency: schedule?.frequency || "daily",
      delivery_method: schedule?.delivery_method || "download",
      webhook_url: schedule?.webhook_url || "",
      hour: 0,
      minute: 0,
    },
  })

  const deliveryMethod = watch("delivery_method")

  useEffect(() => {
    if (open && schedule) {
      reset({
        name: schedule.name,
        description: schedule.description || "",
        enabled: schedule.enabled,
        data_type: schedule.data_type,
        format: schedule.format,
        frequency: schedule.frequency,
        delivery_method: schedule.delivery_method,
        webhook_url: schedule.webhook_url || "",
        hour: 0,
        minute: 0,
      })
    } else if (open && !schedule) {
      reset({
        name: "",
        description: "",
        enabled: true,
        data_type: "sessions",
        format: "csv",
        frequency: "daily",
        delivery_method: "download",
        webhook_url: "",
        hour: 0,
        minute: 0,
      })
    }
  }, [open, schedule, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#F3F4F6]">
            {schedule ? "Edit Export Schedule" : "Create Export Schedule"}
          </DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            Configure a recurring export that runs automatically
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#F3F4F6]">Schedule Name</Label>
              <Input
                {...register("name")}
                placeholder="Daily Session Export"
                className="bg-[#282A30] border-[#303136] text-[#F3F4F6]"
              />
              {errors.name && <p className="text-sm text-[#F87171]">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-[#A1A1AA]">Description (Optional)</Label>
              <Textarea
                {...register("description")}
                placeholder="Export all completed sessions daily..."
                className="bg-[#282A30] border-[#303136] text-[#F3F4F6]"
                rows={2}
              />
              {errors.description && (
                <p className="text-sm text-[#F87171]">{errors.description.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[#303136] p-4">
              <div className="space-y-0.5">
                <Label className="text-[#F3F4F6]">Enabled</Label>
                <p className="text-sm text-[#A1A1AA]">Schedule will run automatically when enabled</p>
              </div>
              <Switch
                checked={watch("enabled")}
                onCheckedChange={(checked) => setValue("enabled", checked)}
                className="data-[state=checked]:bg-[#F6D365]"
              />
            </div>
          </div>

          {/* Export Configuration */}
          <div className="space-y-4 p-4 rounded-lg border border-[#303136] bg-[#24262C]">
            <h3 className="font-semibold text-[#F3F4F6]">Export Configuration</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#F3F4F6]">Data Type</Label>
                <Select
                  value={watch("data_type")}
                  onValueChange={(value) => setValue("data_type", value as any)}
                >
                  <SelectTrigger className="bg-[#282A30] border-[#303136] text-[#F3F4F6]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sessions">Sessions</SelectItem>
                    <SelectItem value="agents">Agents</SelectItem>
                    <SelectItem value="all">All Data</SelectItem>
                  </SelectContent>
                </Select>
                {errors.data_type && (
                  <p className="text-sm text-[#F87171]">{errors.data_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[#F3F4F6]">Format</Label>
                <Select
                  value={watch("format")}
                  onValueChange={(value) => setValue("format", value as any)}
                >
                  <SelectTrigger className="bg-[#282A30] border-[#303136] text-[#F3F4F6]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
                {errors.format && (
                  <p className="text-sm text-[#F87171]">{errors.format.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-4 p-4 rounded-lg border border-[#303136] bg-[#24262C]">
            <h3 className="font-semibold text-[#F3F4F6] flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#A1A1AA]" />
              Schedule Frequency
            </h3>

            <RadioGroup
              value={watch("frequency")}
              onValueChange={(value) => setValue("frequency", value as any)}
              className="grid grid-cols-2 gap-3"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-[#303136] hover:bg-[#282A30] transition-colors cursor-pointer">
                <RadioGroupItem value="daily" id="daily" className="text-[#F6D365]" />
                <Label htmlFor="daily" className="cursor-pointer text-[#F3F4F6]">
                  Daily
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-[#303136] hover:bg-[#282A30] transition-colors cursor-pointer">
                <RadioGroupItem value="weekly" id="weekly" className="text-[#F6D365]" />
                <Label htmlFor="weekly" className="cursor-pointer text-[#F3F4F6]">
                  Weekly
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-[#303136] hover:bg-[#282A30] transition-colors cursor-pointer">
                <RadioGroupItem value="monthly" id="monthly" className="text-[#F6D365]" />
                <Label htmlFor="monthly" className="cursor-pointer text-[#F3F4F6]">
                  Monthly
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-[#303136] hover:bg-[#282A30] transition-colors cursor-pointer">
                <RadioGroupItem value="custom" id="custom" className="text-[#F6D365]" />
                <Label htmlFor="custom" className="cursor-pointer text-[#F3F4F6]">
                  Custom
                </Label>
              </div>
            </RadioGroup>
            {errors.frequency && (
              <p className="text-sm text-[#F87171]">{errors.frequency.message}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#F3F4F6]">Hour (0-23)</Label>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  {...register("hour", { valueAsNumber: true })}
                  className="bg-[#282A30] border-[#303136] text-[#F3F4F6]"
                />
                {errors.hour && <p className="text-sm text-[#F87171]">{errors.hour.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-[#F3F4F6]">Minute (0-59)</Label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  {...register("minute", { valueAsNumber: true })}
                  className="bg-[#282A30] border-[#303136] text-[#F3F4F6]"
                />
                {errors.minute && (
                  <p className="text-sm text-[#F87171]">{errors.minute.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Method */}
          <div className="space-y-4 p-4 rounded-lg border border-[#303136] bg-[#24262C]">
            <h3 className="font-semibold text-[#F3F4F6] flex items-center gap-2">
              <Download className="h-4 w-4 text-[#A1A1AA]" />
              Delivery Method
            </h3>

            <RadioGroup
              value={deliveryMethod}
              onValueChange={(value) => setValue("delivery_method", value as any)}
              className="grid grid-cols-3 gap-3"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-[#303136] hover:bg-[#282A30] transition-colors cursor-pointer">
                <RadioGroupItem value="download" id="download" className="text-[#F6D365]" />
                <Label htmlFor="download" className="cursor-pointer text-[#F3F4F6]">
                  Download
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-[#303136] hover:bg-[#282A30] transition-colors cursor-pointer">
                <RadioGroupItem value="webhook" id="webhook" className="text-[#F6D365]" />
                <Label htmlFor="webhook" className="cursor-pointer text-[#F3F4F6]">
                  Webhook
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-[#303136] hover:bg-[#282A30] transition-colors cursor-pointer">
                <RadioGroupItem value="both" id="both" className="text-[#F6D365]" />
                <Label htmlFor="both" className="cursor-pointer text-[#F3F4F6]">
                  Both
                </Label>
              </div>
            </RadioGroup>
            {errors.delivery_method && (
              <p className="text-sm text-[#F87171]">{errors.delivery_method.message}</p>
            )}

            {(deliveryMethod === "webhook" || deliveryMethod === "both") && (
              <div className="space-y-2">
                <Label className="text-[#F3F4F6] flex items-center gap-2">
                  <Webhook className="h-4 w-4 text-[#A1A1AA]" />
                  Webhook URL
                </Label>
                <Input
                  {...register("webhook_url")}
                  type="url"
                  placeholder="https://example.com/webhook"
                  className="bg-[#282A30] border-[#303136] text-[#F3F4F6]"
                />
                <p className="text-sm text-[#A1A1AA]">URL where the export will be sent</p>
                {errors.webhook_url && (
                  <p className="text-sm text-[#F87171]">{errors.webhook_url.message}</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="text-[#A1A1AA] border-[#303136] hover:bg-[#282A30]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
            >
              {isLoading ? "Saving..." : schedule ? "Update Schedule" : "Create Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
