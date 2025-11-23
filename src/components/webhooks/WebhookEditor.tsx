import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2 } from "lucide-react"
import { useCreateWebhook, useUpdateWebhook, useTestWebhook } from "@/hooks/useWebhooks"
import type { Webhook, WebhookTrigger } from "@/types/webhook"
import { toast } from "sonner"

const webhookSchema = z.object({
  url: z.string().url("Must be a valid URL").min(1, "URL is required"),
  method: z.enum(["POST", "PUT", "PATCH"]),
  auth_type: z.enum(["none", "bearer", "basic", "hmac"]),
  auth_token: z.string().optional().nullable(),
  triggers: z.array(z.enum(["session_started", "session_completed", "field_collected", "session_updated"])).min(1, "Select at least one trigger"),
  retry_policy: z.object({
    max_retries: z.number().min(0).max(10),
    backoff_type: z.enum(["exponential", "linear"]),
    initial_delay_ms: z.number().min(100).max(60000),
  }),
  rate_limit_per_minute: z.number().min(1).max(1000),
  enabled: z.boolean(),
  headers: z.array(z.object({
    key: z.string().min(1, "Header key is required"),
    value: z.string().min(1, "Header value is required"),
  })).optional(),
})

type WebhookForm = z.infer<typeof webhookSchema>

interface WebhookEditorProps {
  webhook?: Webhook | null
  onSuccess?: () => void
  onCancel?: () => void
}

const TRIGGER_OPTIONS: { value: WebhookTrigger; label: string; description: string }[] = [
  { value: "session_started", label: "Session Started", description: "When a new chat session begins" },
  { value: "session_completed", label: "Session Completed", description: "When a session is finished" },
  { value: "field_collected", label: "Field Collected", description: "When a field value is collected" },
  { value: "session_updated", label: "Session Updated", description: "When session data changes" },
]

export function WebhookEditor({ webhook, onSuccess, onCancel }: WebhookEditorProps) {
  const isEditing = !!webhook
  const createWebhook = useCreateWebhook()
  const updateWebhook = useUpdateWebhook()
  const testWebhook = useTestWebhook()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm<WebhookForm>({
    resolver: zodResolver(webhookSchema),
    defaultValues: webhook
      ? {
          url: webhook.url,
          method: webhook.method,
          auth_type: webhook.auth_type,
          auth_token: webhook.auth_token || "",
          triggers: webhook.triggers,
          retry_policy: webhook.retry_policy,
          rate_limit_per_minute: webhook.rate_limit_per_minute,
          enabled: webhook.enabled,
          headers: Object.entries(webhook.headers || {}).map(([key, value]) => ({ key, value })),
        }
      : {
          url: "",
          method: "POST",
          auth_type: "none",
          auth_token: "",
          triggers: [],
          retry_policy: {
            max_retries: 3,
            backoff_type: "exponential",
            initial_delay_ms: 1000,
          },
          rate_limit_per_minute: 60,
          enabled: true,
          headers: [],
        },
  })

  const { fields: headerFields, append: appendHeader, remove: removeHeader } = useFieldArray({
    control,
    name: "headers",
  })

  const authType = watch("auth_type")
  const triggers = watch("triggers") || []

  const onSubmit = async (data: WebhookForm) => {
    try {
      const headersObj = data.headers?.reduce((acc, header) => {
        if (header.key && header.value) {
          acc[header.key] = header.value
        }
        return acc
      }, {} as Record<string, string>) || {}

      if (isEditing && webhook) {
        await updateWebhook.mutateAsync({
          id: webhook.id,
          updates: {
            url: data.url,
            method: data.method,
            auth_type: data.auth_type,
            auth_token: data.auth_token || null,
            triggers: data.triggers,
            retry_policy: data.retry_policy,
            rate_limit_per_minute: data.rate_limit_per_minute,
            enabled: data.enabled,
            headers: headersObj,
          },
        })
      } else {
        await createWebhook.mutateAsync({
          url: data.url,
          method: data.method,
          auth_type: data.auth_type,
          auth_token: data.auth_token || null,
          triggers: data.triggers,
          retry_policy: data.retry_policy,
          rate_limit_per_minute: data.rate_limit_per_minute,
          enabled: data.enabled,
          headers: headersObj,
        })
      }
      onSuccess?.()
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const handleTest = async () => {
    if (!webhook) {
      toast.error("Please save the webhook first before testing")
      return
    }
    await testWebhook.mutateAsync(webhook.id)
  }

  const toggleTrigger = (trigger: WebhookTrigger) => {
    const current = triggers || []
    if (current.includes(trigger)) {
      setValue("triggers", current.filter((t) => t !== trigger))
    } else {
      setValue("triggers", [...current, trigger])
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="bg-[#282A30] border-[#303136]">
        <CardHeader>
          <CardTitle className="text-[#F3F4F6]">
            {isEditing ? "Edit Webhook" : "Create New Webhook"}
          </CardTitle>
          <CardDescription className="text-[#A1A1AA]">
            Configure your webhook endpoint to receive session data automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-[#F3F4F6]">
              Webhook URL *
            </Label>
            <Input
              id="url"
              {...register("url")}
              placeholder="https://example.com/webhook"
              className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA]"
            />
            {errors.url && (
              <p className="text-sm text-[#F87171]">{errors.url.message}</p>
            )}
          </div>

          {/* Method */}
          <div className="space-y-2">
            <Label htmlFor="method" className="text-[#F3F4F6]">
              HTTP Method
            </Label>
            <Select
              value={watch("method")}
              onValueChange={(value) => setValue("method", value as "POST" | "PUT" | "PATCH")}
            >
              <SelectTrigger className="bg-[#24262C] border-[#303136] text-[#F3F4F6]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#282A30] border-[#303136] text-[#F3F4F6]">
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Authentication */}
          <div className="space-y-4">
            <Label className="text-[#F3F4F6]">Authentication</Label>
            <Select
              value={authType}
              onValueChange={(value) => setValue("auth_type", value as any)}
            >
              <SelectTrigger className="bg-[#24262C] border-[#303136] text-[#F3F4F6]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#282A30] border-[#303136] text-[#F3F4F6]">
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
                <SelectItem value="hmac">HMAC Signature</SelectItem>
              </SelectContent>
            </Select>

            {(authType === "bearer" || authType === "basic" || authType === "hmac") && (
              <div className="space-y-2">
                <Label htmlFor="auth_token" className="text-[#F3F4F6]">
                  {authType === "bearer" ? "Bearer Token" : authType === "basic" ? "Basic Auth Token" : "HMAC Secret"}
                </Label>
                <Input
                  id="auth_token"
                  type="password"
                  {...register("auth_token")}
                  placeholder={authType === "bearer" ? "your-token-here" : "your-secret-here"}
                  className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA]"
                />
              </div>
            )}
          </div>

          {/* Headers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[#F3F4F6]">Custom Headers</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendHeader({ key: "", value: "" })}
                className="bg-[#24262C] border-[#303136] text-[#F3F4F6] hover:bg-[#282A30]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Header
              </Button>
            </div>
            {headerFields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  {...register(`headers.${index}.key`)}
                  placeholder="Header name"
                  className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA]"
                />
                <Input
                  {...register(`headers.${index}.value`)}
                  placeholder="Header value"
                  className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeHeader(index)}
                  className="text-[#F87171] hover:text-[#F87171] hover:bg-[#24262C]"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Separator className="bg-[#303136]" />

          {/* Event Triggers */}
          <div className="space-y-4">
            <Label className="text-[#F3F4F6]">Event Triggers *</Label>
            <p className="text-sm text-[#A1A1AA]">
              Select when this webhook should be triggered
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TRIGGER_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className="flex items-start space-x-3 p-3 rounded-xl border border-[#303136] bg-[#24262C] hover:bg-[#282A30] cursor-pointer transition-colors"
                  onClick={() => toggleTrigger(option.value)}
                >
                  <Checkbox
                    checked={triggers.includes(option.value)}
                    onCheckedChange={() => toggleTrigger(option.value)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <Label className="text-[#F3F4F6] font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-xs text-[#A1A1AA] mt-1">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
            {errors.triggers && (
              <p className="text-sm text-[#F87171]">{errors.triggers.message}</p>
            )}
          </div>

          <Separator className="bg-[#303136]" />

          {/* Retry Policy */}
          <div className="space-y-4">
            <Label className="text-[#F3F4F6]">Retry Policy</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_retries" className="text-sm text-[#A1A1AA]">
                  Max Retries
                </Label>
                <Input
                  id="max_retries"
                  type="number"
                  {...register("retry_policy.max_retries", { valueAsNumber: true })}
                  min={0}
                  max={10}
                  className="bg-[#24262C] border-[#303136] text-[#F3F4F6]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backoff_type" className="text-sm text-[#A1A1AA]">
                  Backoff Type
                </Label>
                <Select
                  value={watch("retry_policy.backoff_type")}
                  onValueChange={(value) =>
                    setValue("retry_policy.backoff_type", value as "exponential" | "linear")
                  }
                >
                  <SelectTrigger className="bg-[#24262C] border-[#303136] text-[#F3F4F6]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#282A30] border-[#303136] text-[#F3F4F6]">
                    <SelectItem value="exponential">Exponential</SelectItem>
                    <SelectItem value="linear">Linear</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="initial_delay_ms" className="text-sm text-[#A1A1AA]">
                  Initial Delay (ms)
                </Label>
                <Input
                  id="initial_delay_ms"
                  type="number"
                  {...register("retry_policy.initial_delay_ms", { valueAsNumber: true })}
                  min={100}
                  max={60000}
                  className="bg-[#24262C] border-[#303136] text-[#F3F4F6]"
                />
              </div>
            </div>
          </div>

          {/* Rate Limiting */}
          <div className="space-y-2">
            <Label htmlFor="rate_limit_per_minute" className="text-[#F3F4F6]">
              Rate Limit (requests per minute)
            </Label>
            <Input
              id="rate_limit_per_minute"
              type="number"
              {...register("rate_limit_per_minute", { valueAsNumber: true })}
              min={1}
              max={1000}
              className="bg-[#24262C] border-[#303136] text-[#F3F4F6]"
            />
            <p className="text-xs text-[#A1A1AA]">
              Maximum number of webhook deliveries per minute
            </p>
          </div>

          {/* Enabled Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-[#303136] bg-[#24262C]">
            <div>
              <Label htmlFor="enabled" className="text-[#F3F4F6] font-medium">
                Enable Webhook
              </Label>
              <p className="text-sm text-[#A1A1AA]">
                Webhook will only fire when enabled
              </p>
            </div>
            <Switch
              id="enabled"
              checked={watch("enabled")}
              onCheckedChange={(checked) => setValue("enabled", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="bg-[#24262C] border-[#303136] text-[#F3F4F6] hover:bg-[#282A30]"
          >
            Cancel
          </Button>
        )}
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            onClick={handleTest}
            disabled={testWebhook.isPending}
            className="bg-[#24262C] border-[#303136] text-[#F3F4F6] hover:bg-[#282A30]"
          >
            {testWebhook.isPending ? "Testing..." : "Test Delivery"}
          </Button>
        )}
        <Button
          type="submit"
          disabled={createWebhook.isPending || updateWebhook.isPending}
          className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
        >
          {createWebhook.isPending || updateWebhook.isPending
            ? "Saving..."
            : isEditing
            ? "Update Webhook"
            : "Create Webhook"}
        </Button>
      </div>
    </form>
  )
}
