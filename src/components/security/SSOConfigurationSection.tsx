import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Key,
  Loader2,
  TestTube,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useSSOConfiguration,
  useCreateSSOConfiguration,
  useUpdateSSOConfiguration,
  useDeleteSSOConfiguration,
} from "@/hooks/useSettings"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const ssoSchema = z.object({
  sso_type: z.enum(["saml", "oidc"]),
  saml_entity_id: z.string().optional().nullable(),
  saml_sso_url: z.string().url().optional().nullable(),
  saml_x509_cert: z.string().optional().nullable(),
  saml_metadata_url: z.string().url().optional().nullable(),
  oidc_issuer_url: z.string().url().optional().nullable(),
  oidc_client_id: z.string().optional().nullable(),
  oidc_client_secret_encrypted: z.string().optional().nullable(),
  oidc_scopes: z.string().optional(),
  enabled: z.boolean(),
  auto_provision: z.boolean(),
  default_role: z.enum(["owner", "admin", "member"]),
})

type SSOFormData = z.infer<typeof ssoSchema>

export function SSOConfigurationSection() {
  const { data: ssoConfig, isLoading } = useSSOConfiguration()
  const createSSO = useCreateSSOConfiguration()
  const updateSSO = useUpdateSSOConfiguration()
  const deleteSSO = useDeleteSSOConfiguration()
  const [testing, setTesting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SSOFormData>({
    resolver: zodResolver(ssoSchema),
    defaultValues: ssoConfig || {
      sso_type: "saml",
      saml_entity_id: null,
      saml_sso_url: null,
      saml_x509_cert: null,
      saml_metadata_url: null,
      oidc_issuer_url: null,
      oidc_client_id: null,
      oidc_client_secret_encrypted: null,
      oidc_scopes: "openid profile email",
      enabled: false,
      auto_provision: true,
      default_role: "member",
    },
  })

  const ssoType = watch("sso_type")

  const onSubmit = async (data: SSOFormData) => {
    try {
      if (ssoConfig) {
        await updateSSO.mutateAsync(data)
      } else {
        await createSSO.mutateAsync({
          ...data,
          user_id: "", // Will be set by backend
        } as any)
      }
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleTest = async () => {
    setTesting(true)
    // Simulate test - in real implementation, this would call an API
    setTimeout(() => {
      setTesting(false)
      // Show success/error toast
    }, 2000)
  }

  const handleDelete = async () => {
    try {
      await deleteSSO.mutateAsync()
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
      {/* SSO Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Single Sign-On (SSO) Configuration
              </CardTitle>
              <CardDescription>
                Configure SAML or OIDC SSO for enterprise authentication
              </CardDescription>
            </div>
            {ssoConfig && (
              <Badge className={ssoConfig.enabled ? "bg-[#4ADE80]" : "bg-[#A1A1AA]"}>
                {ssoConfig.enabled ? "Enabled" : "Disabled"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* SSO Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="sso_type">SSO Protocol</Label>
              <Select
                value={ssoType}
                onValueChange={(value) => setValue("sso_type", value as any)}
              >
                <SelectTrigger className="bg-[#24262C] border-[#303136]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saml">SAML 2.0</SelectItem>
                  <SelectItem value="oidc">OpenID Connect (OIDC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* SAML Configuration */}
            {ssoType === "saml" && (
              <div className="space-y-4 p-4 rounded-lg border border-[#303136] bg-[#24262C]">
                <h3 className="text-lg font-semibold text-[#F3F4F6]">SAML Configuration</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="saml_entity_id">Entity ID</Label>
                  <Input
                    id="saml_entity_id"
                    {...register("saml_entity_id")}
                    placeholder="https://your-org.com/saml"
                    className="bg-[#282A30] border-[#303136]"
                  />
                  {errors.saml_entity_id && (
                    <p className="text-sm text-[#F87171]">{errors.saml_entity_id.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saml_sso_url">SSO URL</Label>
                  <Input
                    id="saml_sso_url"
                    {...register("saml_sso_url")}
                    placeholder="https://your-idp.com/sso"
                    className="bg-[#282A30] border-[#303136]"
                  />
                  {errors.saml_sso_url && (
                    <p className="text-sm text-[#F87171]">{errors.saml_sso_url.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saml_metadata_url">Metadata URL (Optional)</Label>
                  <Input
                    id="saml_metadata_url"
                    {...register("saml_metadata_url")}
                    placeholder="https://your-idp.com/metadata"
                    className="bg-[#282A30] border-[#303136]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saml_x509_cert">X.509 Certificate</Label>
                  <Textarea
                    id="saml_x509_cert"
                    {...register("saml_x509_cert")}
                    placeholder="-----BEGIN CERTIFICATE-----..."
                    className="bg-[#282A30] border-[#303136] min-h-[120px] font-mono text-xs"
                  />
                  <p className="text-xs text-[#A1A1AA]">
                    Paste the X.509 certificate from your identity provider
                  </p>
                </div>
              </div>
            )}

            {/* OIDC Configuration */}
            {ssoType === "oidc" && (
              <div className="space-y-4 p-4 rounded-lg border border-[#303136] bg-[#24262C]">
                <h3 className="text-lg font-semibold text-[#F3F4F6]">OIDC Configuration</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="oidc_issuer_url">Issuer URL</Label>
                  <Input
                    id="oidc_issuer_url"
                    {...register("oidc_issuer_url")}
                    placeholder="https://your-idp.com"
                    className="bg-[#282A30] border-[#303136]"
                  />
                  {errors.oidc_issuer_url && (
                    <p className="text-sm text-[#F87171]">{errors.oidc_issuer_url.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oidc_client_id">Client ID</Label>
                  <Input
                    id="oidc_client_id"
                    {...register("oidc_client_id")}
                    placeholder="your-client-id"
                    className="bg-[#282A30] border-[#303136]"
                  />
                  {errors.oidc_client_id && (
                    <p className="text-sm text-[#F87171]">{errors.oidc_client_id.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oidc_client_secret_encrypted">Client Secret</Label>
                  <Input
                    id="oidc_client_secret_encrypted"
                    type="password"
                    {...register("oidc_client_secret_encrypted")}
                    placeholder="your-client-secret"
                    className="bg-[#282A30] border-[#303136]"
                  />
                  <p className="text-xs text-[#A1A1AA]">
                    Client secret will be encrypted and stored securely
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oidc_scopes">Scopes</Label>
                  <Input
                    id="oidc_scopes"
                    {...register("oidc_scopes")}
                    placeholder="openid profile email"
                    className="bg-[#282A30] border-[#303136]"
                  />
                  <p className="text-xs text-[#A1A1AA]">
                    Space-separated list of OIDC scopes
                  </p>
                </div>
              </div>
            )}

            {/* Common Settings */}
            <div className="space-y-4 p-4 rounded-lg border border-[#303136] bg-[#24262C]">
              <h3 className="text-lg font-semibold text-[#F3F4F6]">Settings</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enabled">Enable SSO</Label>
                  <p className="text-sm text-[#A1A1AA]">
                    Activate SSO authentication for your organization
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={watch("enabled")}
                  onCheckedChange={(checked) => setValue("enabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto_provision">Auto-Provision Users</Label>
                  <p className="text-sm text-[#A1A1AA]">
                    Automatically create user accounts on first SSO login
                  </p>
                </div>
                <Switch
                  id="auto_provision"
                  checked={watch("auto_provision")}
                  onCheckedChange={(checked) => setValue("auto_provision", checked)}
                />
              </div>

              {watch("auto_provision") && (
                <div className="space-y-2">
                  <Label htmlFor="default_role">Default Role for New Users</Label>
                  <Select
                    value={watch("default_role")}
                    onValueChange={(value) => setValue("default_role", value as any)}
                  >
                    <SelectTrigger className="bg-[#282A30] border-[#303136]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Button
                type="submit"
                className="bg-[#F6D365] hover:bg-[#F6D365]/90 text-[#22242A]"
                disabled={createSSO.isPending || updateSSO.isPending}
              >
                {(createSSO.isPending || updateSSO.isPending) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save SSO Configuration"
                )}
              </Button>

              {ssoConfig && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTest}
                    disabled={testing || !watch("enabled")}
                    className="gap-2"
                  >
                    {testing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4" />
                        Test Connection
                      </>
                    )}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="text-[#F87171] hover:text-[#F87171] hover:bg-[#F87171]/10"
                      >
                        Delete Configuration
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete SSO Configuration?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your SSO configuration.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-[#F87171] hover:bg-[#F87171]/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
