import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Lock,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useEncryptionSettings,
  useCreateEncryptionSettings,
  useUpdateEncryptionSettings,
} from "@/hooks/useSettings"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

const encryptionSchema = z.object({
  encryption_at_rest_enabled: z.boolean(),
  encryption_at_rest_algorithm: z.enum(["AES-256-GCM", "AES-256-CBC", "ChaCha20-Poly1305"]),
  encryption_at_rest_key_rotation_days: z.number().min(1),
  tls_enabled: z.boolean(),
  tls_min_version: z.enum(["TLSv1.0", "TLSv1.1", "TLSv1.2", "TLSv1.3"]),
  tls_certificate_expiry_check: z.boolean(),
  field_level_encryption_enabled: z.boolean(),
  encrypted_fields: z.array(z.string()).optional(),
  compliance_status: z.enum(["compliant", "warning", "non-compliant"]),
  compliance_notes: z.string().nullable().optional(),
})

type EncryptionFormData = z.infer<typeof encryptionSchema>

export function EncryptionSettingsSection() {
  const { data: settings, isLoading } = useEncryptionSettings()
  const createSettings = useCreateEncryptionSettings()
  const updateSettings = useUpdateEncryptionSettings()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
  } = useForm<EncryptionFormData>({
    resolver: zodResolver(encryptionSchema),
    defaultValues: settings || {
      encryption_at_rest_enabled: true,
      encryption_at_rest_algorithm: "AES-256-GCM",
      encryption_at_rest_key_rotation_days: 90,
      tls_enabled: true,
      tls_min_version: "TLSv1.2",
      tls_certificate_expiry_check: true,
      field_level_encryption_enabled: false,
      encrypted_fields: [],
      compliance_status: "compliant",
      compliance_notes: null,
    },
  })

  const onSubmit = async (data: EncryptionFormData) => {
    try {
      if (settings) {
        await updateSettings.mutateAsync(data)
      } else {
        await createSettings.mutateAsync({
          ...data,
          user_id: "", // Will be set by backend
        } as any)
      }
    } catch (error) {
      // Error handled by hook
    }
  }

  const complianceStatus = watch("compliance_status")
  const complianceStatusColors = {
    compliant: "bg-[#4ADE80]",
    warning: "bg-[#FBBF24]",
    "non-compliant": "bg-[#F87171]",
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
      {/* Compliance Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Compliance Status
              </CardTitle>
              <CardDescription>
                Current encryption and security compliance status
              </CardDescription>
            </div>
            <Badge className={`${complianceStatusColors[complianceStatus]} text-white capitalize`}>
              {complianceStatus.replace("-", " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-[#303136] bg-[#24262C]">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-[#60A5FA]" />
                <span className="text-sm font-medium text-[#F3F4F6]">Encryption at Rest</span>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                {watch("encryption_at_rest_enabled") ? (
                  <span className="flex items-center gap-1 text-[#4ADE80]">
                    <CheckCircle2 className="h-3 w-3" />
                    Enabled
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[#F87171]">
                    <AlertTriangle className="h-3 w-3" />
                    Disabled
                  </span>
                )}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-[#303136] bg-[#24262C]">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-[#60A5FA]" />
                <span className="text-sm font-medium text-[#F3F4F6]">TLS Encryption</span>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                {watch("tls_enabled") ? (
                  <span className="flex items-center gap-1 text-[#4ADE80]">
                    <CheckCircle2 className="h-3 w-3" />
                    Enabled ({watch("tls_min_version")})
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[#F87171]">
                    <AlertTriangle className="h-3 w-3" />
                    Disabled
                  </span>
                )}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-[#303136] bg-[#24262C]">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-[#60A5FA]" />
                <span className="text-sm font-medium text-[#F3F4F6]">Field-Level Encryption</span>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                {watch("field_level_encryption_enabled") ? (
                  <span className="flex items-center gap-1 text-[#4ADE80]">
                    <CheckCircle2 className="h-3 w-3" />
                    Enabled
                  </span>
                ) : (
                  <span className="text-[#A1A1AA]">Disabled</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Encryption at Rest */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Encryption at Rest
        </CardTitle>
          <CardDescription>
            Configure encryption for data stored in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="encryption_at_rest_enabled">Enable Encryption at Rest</Label>
                <p className="text-sm text-[#A1A1AA]">
                  Encrypt all data stored in the database using industry-standard algorithms
                </p>
              </div>
              <Switch
                id="encryption_at_rest_enabled"
                checked={watch("encryption_at_rest_enabled")}
                onCheckedChange={(checked) => setValue("encryption_at_rest_enabled", checked)}
              />
            </div>

            {watch("encryption_at_rest_enabled") && (
              <div className="space-y-4 pl-4 border-l-2 border-[#303136]">
                <div className="space-y-2">
                  <Label htmlFor="encryption_at_rest_algorithm">Encryption Algorithm</Label>
                  <Select
                    value={watch("encryption_at_rest_algorithm")}
                    onValueChange={(value) => setValue("encryption_at_rest_algorithm", value as any)}
                  >
                    <SelectTrigger className="bg-[#24262C] border-[#303136]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AES-256-GCM">AES-256-GCM (Recommended)</SelectItem>
                      <SelectItem value="AES-256-CBC">AES-256-CBC</SelectItem>
                      <SelectItem value="ChaCha20-Poly1305">ChaCha20-Poly1305</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="encryption_at_rest_key_rotation_days">Key Rotation Period (days)</Label>
                  <Input
                    id="encryption_at_rest_key_rotation_days"
                    type="number"
                    {...register("encryption_at_rest_key_rotation_days", { valueAsNumber: true })}
                    className="bg-[#24262C] border-[#303136]"
                    min={1}
                  />
                  <p className="text-xs text-[#A1A1AA]">
                    Recommended: 90 days. Keys will be automatically rotated.
                  </p>
                </div>

                {settings?.last_key_rotation_at && (
                  <div className="p-3 rounded-lg bg-[#24262C] border border-[#303136]">
                    <p className="text-sm text-[#A1A1AA]">
                      Last key rotation: {format(new Date(settings.last_key_rotation_at), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                )}
              </div>
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
                "Save Encryption Settings"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* TLS Encryption in Transit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            TLS Encryption in Transit
          </CardTitle>
          <CardDescription>
            Configure TLS/SSL encryption for data in transit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tls_enabled">Enable TLS Encryption</Label>
                <p className="text-sm text-[#A1A1AA]">
                  Encrypt all data transmitted over the network using TLS
                </p>
              </div>
              <Switch
                id="tls_enabled"
                checked={watch("tls_enabled")}
                onCheckedChange={(checked) => setValue("tls_enabled", checked)}
              />
            </div>

            {watch("tls_enabled") && (
              <div className="space-y-4 pl-4 border-l-2 border-[#303136]">
                <div className="space-y-2">
                  <Label htmlFor="tls_min_version">Minimum TLS Version</Label>
                  <Select
                    value={watch("tls_min_version")}
                    onValueChange={(value) => setValue("tls_min_version", value as any)}
                  >
                    <SelectTrigger className="bg-[#24262C] border-[#303136]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TLSv1.3">TLSv1.3 (Most Secure)</SelectItem>
                      <SelectItem value="TLSv1.2">TLSv1.2 (Recommended)</SelectItem>
                      <SelectItem value="TLSv1.1">TLSv1.1 (Legacy)</SelectItem>
                      <SelectItem value="TLSv1.0">TLSv1.0 (Legacy - Not Recommended)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-[#A1A1AA]">
                    TLS 1.2 or higher is required for compliance with most security standards.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="tls_certificate_expiry_check">Certificate Expiry Check</Label>
                    <p className="text-sm text-[#A1A1AA]">
                      Automatically monitor and alert on certificate expiration
                    </p>
                  </div>
                  <Switch
                    id="tls_certificate_expiry_check"
                    checked={watch("tls_certificate_expiry_check")}
                    onCheckedChange={(checked) => setValue("tls_certificate_expiry_check", checked)}
                  />
                </div>

                {settings?.last_tls_check_at && (
                  <div className="p-3 rounded-lg bg-[#24262C] border border-[#303136]">
                    <p className="text-sm text-[#A1A1AA]">
                      Last TLS check: {format(new Date(settings.last_tls_check_at), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                )}
              </div>
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
                "Save TLS Settings"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Field-Level Encryption */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Field-Level Encryption
          </CardTitle>
          <CardDescription>
            Encrypt specific sensitive fields at the database level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="field_level_encryption_enabled">Enable Field-Level Encryption</Label>
                <p className="text-sm text-[#A1A1AA]">
                  Encrypt specific sensitive fields for additional protection
                </p>
              </div>
              <Switch
                id="field_level_encryption_enabled"
                checked={watch("field_level_encryption_enabled")}
                onCheckedChange={(checked) => setValue("field_level_encryption_enabled", checked)}
              />
            </div>

            {watch("field_level_encryption_enabled") && (
              <div className="p-4 rounded-lg bg-[#24262C] border border-[#303136]">
                <p className="text-sm text-[#A1A1AA] mb-2">
                  Field-level encryption will be configured per agent schema. Fields marked as sensitive will be automatically encrypted.
                </p>
              </div>
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
                "Save Field Encryption Settings"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Compliance Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Notes
          </CardTitle>
          <CardDescription>
            Add notes about compliance status and any actions taken
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="compliance_status">Compliance Status</Label>
              <Select
                value={watch("compliance_status")}
                onValueChange={(value) => setValue("compliance_status", value as any)}
              >
                <SelectTrigger className="bg-[#24262C] border-[#303136]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliant">Compliant</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="compliance_notes">Notes</Label>
              <Textarea
                id="compliance_notes"
                {...register("compliance_notes")}
                className="bg-[#24262C] border-[#303136] min-h-[100px]"
                placeholder="Add compliance notes, audit findings, or action items..."
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
                "Save Compliance Notes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
