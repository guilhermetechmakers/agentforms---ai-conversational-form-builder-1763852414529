import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Shield,
  Database,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useDataRetentionSettings,
  useCreateDataRetentionSettings,
  useUpdateDataRetentionSettings,
} from "@/hooks/useSettings"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const retentionSchema = z.object({
  sessions_retention_days: z.number().min(0),
  messages_retention_days: z.number().min(0),
  field_values_retention_days: z.number().min(0),
  audit_logs_retention_days: z.number().min(0),
  auto_redact_pii: z.boolean(),
  pii_fields: z.array(z.string()).optional(),
  redaction_method: z.enum(["mask", "hash", "delete"]),
  gdpr_enabled: z.boolean(),
  ccpa_enabled: z.boolean(),
  auto_delete_enabled: z.boolean(),
  auto_delete_schedule: z.enum(["daily", "weekly", "monthly"]),
})

type RetentionFormData = z.infer<typeof retentionSchema>

export function DataRetentionSection() {
  const { data: settings, isLoading } = useDataRetentionSettings()
  const createSettings = useCreateDataRetentionSettings()
  const updateSettings = useUpdateDataRetentionSettings()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RetentionFormData>({
    resolver: zodResolver(retentionSchema),
    defaultValues: settings || {
      sessions_retention_days: 365,
      messages_retention_days: 365,
      field_values_retention_days: 365,
      audit_logs_retention_days: 730,
      auto_redact_pii: false,
      pii_fields: [],
      redaction_method: "mask",
      gdpr_enabled: false,
      ccpa_enabled: false,
      auto_delete_enabled: false,
      auto_delete_schedule: "monthly",
    },
  })

  const onSubmit = async (data: RetentionFormData) => {
    try {
      if (settings) {
        await updateSettings.mutateAsync(data)
      } else {
        await createSettings.mutateAsync(data as any)
      }
    } catch (error) {
      // Error handled by hook
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#A1A1AA]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Data Retention Periods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Retention Periods
          </CardTitle>
          <CardDescription>
            Configure how long different types of data are retained (in days)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessions_retention_days">Sessions Retention (days)</Label>
                <Input
                  id="sessions_retention_days"
                  type="number"
                  {...register("sessions_retention_days", { valueAsNumber: true })}
                  className="bg-[#24262C] border-[#303136]"
                />
                {errors.sessions_retention_days && (
                  <p className="text-sm text-[#F87171]">{errors.sessions_retention_days.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="messages_retention_days">Messages Retention (days)</Label>
                <Input
                  id="messages_retention_days"
                  type="number"
                  {...register("messages_retention_days", { valueAsNumber: true })}
                  className="bg-[#24262C] border-[#303136]"
                />
                {errors.messages_retention_days && (
                  <p className="text-sm text-[#F87171]">{errors.messages_retention_days.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="field_values_retention_days">Field Values Retention (days)</Label>
                <Input
                  id="field_values_retention_days"
                  type="number"
                  {...register("field_values_retention_days", { valueAsNumber: true })}
                  className="bg-[#24262C] border-[#303136]"
                />
                {errors.field_values_retention_days && (
                  <p className="text-sm text-[#F87171]">{errors.field_values_retention_days.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="audit_logs_retention_days">Audit Logs Retention (days)</Label>
                <Input
                  id="audit_logs_retention_days"
                  type="number"
                  {...register("audit_logs_retention_days", { valueAsNumber: true })}
                  className="bg-[#24262C] border-[#303136]"
                />
                {errors.audit_logs_retention_days && (
                  <p className="text-sm text-[#F87171]">{errors.audit_logs_retention_days.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="bg-[#F6D365] hover:bg-[#F6D365]/90 text-[#22242A]"
              disabled={createSettings.isPending || updateSettings.isPending}
            >
              {(createSettings.isPending || updateSettings.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Retention Settings"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Privacy & PII Redaction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & PII Redaction
          </CardTitle>
          <CardDescription>
            Configure automatic PII redaction and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto_redact_pii">Auto-Redact PII</Label>
                <p className="text-sm text-[#A1A1AA]">
                  Automatically redact personally identifiable information from stored data
                </p>
              </div>
              <Switch
                id="auto_redact_pii"
                checked={watch("auto_redact_pii")}
                onCheckedChange={(checked) => setValue("auto_redact_pii", checked)}
              />
            </div>

            {watch("auto_redact_pii") && (
              <div className="space-y-4 pl-4 border-l-2 border-[#303136]">
                <div className="space-y-2">
                  <Label htmlFor="redaction_method">Redaction Method</Label>
                  <Select
                    value={watch("redaction_method")}
                    onValueChange={(value) => setValue("redaction_method", value as any)}
                  >
                    <SelectTrigger className="bg-[#24262C] border-[#303136]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mask">Mask (replace with ***)</SelectItem>
                      <SelectItem value="hash">Hash (one-way encryption)</SelectItem>
                      <SelectItem value="delete">Delete (remove completely)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="gdpr_enabled">GDPR Compliance</Label>
                <p className="text-sm text-[#A1A1AA]">
                  Enable GDPR-compliant data handling and user rights
                </p>
              </div>
              <Switch
                id="gdpr_enabled"
                checked={watch("gdpr_enabled")}
                onCheckedChange={(checked) => setValue("gdpr_enabled", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ccpa_enabled">CCPA Compliance</Label>
                <p className="text-sm text-[#A1A1AA]">
                  Enable California Consumer Privacy Act compliance
                </p>
              </div>
              <Switch
                id="ccpa_enabled"
                checked={watch("ccpa_enabled")}
                onCheckedChange={(checked) => setValue("ccpa_enabled", checked)}
              />
            </div>

            <Button
              type="submit"
              className="bg-[#F6D365] hover:bg-[#F6D365]/90 text-[#22242A]"
              disabled={createSettings.isPending || updateSettings.isPending}
            >
              {(createSettings.isPending || updateSettings.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Privacy Settings"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Auto-Deletion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Automatic Data Deletion
          </CardTitle>
          <CardDescription>
            Configure automatic deletion of expired data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto_delete_enabled">Enable Auto-Deletion</Label>
                <p className="text-sm text-[#A1A1AA]">
                  Automatically delete data that exceeds retention periods
                </p>
              </div>
              <Switch
                id="auto_delete_enabled"
                checked={watch("auto_delete_enabled")}
                onCheckedChange={(checked) => setValue("auto_delete_enabled", checked)}
              />
            </div>

            {watch("auto_delete_enabled") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="auto_delete_schedule">Deletion Schedule</Label>
                  <Select
                    value={watch("auto_delete_schedule")}
                    onValueChange={(value) => setValue("auto_delete_schedule", value as any)}
                  >
                    <SelectTrigger className="bg-[#24262C] border-[#303136]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 rounded-lg bg-[#F87171]/10 border border-[#F87171]/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-[#F87171] flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-[#F3F4F6]">
                      <p className="font-medium mb-1">Warning: Irreversible Action</p>
                      <p className="text-[#A1A1AA]">
                        Once data is automatically deleted, it cannot be recovered. Make sure your retention periods are appropriate for your compliance needs.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button
              type="submit"
              className="bg-[#F6D365] hover:bg-[#F6D365]/90 text-[#22242A]"
              disabled={createSettings.isPending || updateSettings.isPending}
            >
              {(createSettings.isPending || updateSettings.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Deletion Settings"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
