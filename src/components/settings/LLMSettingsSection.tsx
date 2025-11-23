import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Plus,
  Trash2,
  Edit,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  useLLMProviders,
  useCreateLLMProvider,
  useUpdateLLMProvider,
  useDeleteLLMProvider,
  useSetDefaultLLMProvider,
} from "@/hooks/useSettings"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const providerSchema = z.object({
  provider: z.enum(["openai", "anthropic", "google", "azure", "custom"]),
  provider_name: z.string().min(1, "Provider name is required"),
  api_key: z.string().min(1, "API key is required"),
  base_url: z.string().optional(),
  model: z.string().min(1, "Model is required"),
  default_temperature: z.number().min(0).max(2),
  max_tokens: z.number().min(1),
  usage_quota: z.number().optional(),
  environment: z.enum(["sandbox", "production"]),
})

type ProviderFormData = z.infer<typeof providerSchema>

export function LLMSettingsSection() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<string | null>(null)
  const { data: providers, isLoading } = useLLMProviders()
  const createProvider = useCreateLLMProvider()
  const updateProvider = useUpdateLLMProvider()
  const deleteProvider = useDeleteLLMProvider()
  const setDefault = useSetDefaultLLMProvider()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      provider: "openai",
      model: "gpt-4",
      default_temperature: 0.7,
      max_tokens: 2000,
      environment: "production",
    },
  })

  const onSubmit = async (data: ProviderFormData) => {
    try {
      // In a real app, the API key would be encrypted on the backend
      const providerData = {
        ...data,
        api_key_encrypted: data.api_key, // This should be encrypted server-side
      }

      if (editingProvider) {
        await updateProvider.mutateAsync({
          id: editingProvider,
          data: providerData as any,
        })
      } else {
        await createProvider.mutateAsync(providerData as any)
      }
      reset()
      setDialogOpen(false)
      setEditingProvider(null)
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleEdit = (provider: any) => {
    setEditingProvider(provider.id)
    setValue("provider", provider.provider)
    setValue("provider_name", provider.provider_name)
    setValue("model", provider.model)
    setValue("default_temperature", provider.default_temperature)
    setValue("max_tokens", provider.max_tokens)
    setValue("usage_quota", provider.usage_quota || undefined)
    setValue("environment", provider.environment)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this LLM provider?")) {
      try {
        await deleteProvider.mutateAsync(id)
      } catch (error) {
        // Error handled by hook
      }
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await setDefault.mutateAsync(id)
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
      {/* LLM Providers List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                LLM Providers
              </CardTitle>
              <CardDescription>
                Configure your LLM providers and API keys for agent conversations
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                reset()
                setEditingProvider(null)
                setDialogOpen(true)
              }}
              className="bg-[#F6D365] hover:bg-[#F6D365]/90 text-[#22242A]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {providers && providers.length > 0 ? (
            <div className="space-y-3">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-[#303136] bg-[#24262C] hover:bg-[#282A30] transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 rounded-lg bg-[#282A30]">
                      <Brain className="h-5 w-5 text-[#60A5FA]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[#F3F4F6]">{provider.provider_name}</h3>
                        {provider.is_default && (
                          <Badge className="bg-[#4ADE80] text-[#22242A]">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                        <Badge variant="outline" className="capitalize">
                          {provider.environment}
                        </Badge>
                      </div>
                      <div className="text-sm text-[#A1A1AA] mt-1">
                        Model: {provider.model} • Temperature: {provider.default_temperature} • Max Tokens: {provider.max_tokens}
                      </div>
                      {provider.usage_quota && (
                        <div className="text-xs text-[#A1A1AA] mt-1">
                          Usage: {provider.usage_count} / {provider.usage_quota} this month
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!provider.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(provider.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(provider)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(provider.id)}
                      className="text-[#F87171] hover:text-[#F87171] hover:bg-[#F87171]/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-[#A1A1AA] mx-auto mb-4" />
              <p className="text-[#A1A1AA] mb-4">No LLM providers configured</p>
              <Button
                onClick={() => {
                  reset()
                  setEditingProvider(null)
                  setDialogOpen(true)
                }}
                className="bg-[#F6D365] hover:bg-[#F6D365]/90 text-[#22242A]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Provider
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProvider ? "Edit LLM Provider" : "Add LLM Provider"}
            </DialogTitle>
            <DialogDescription>
              Configure your LLM provider settings and API credentials
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select
                  value={watch("provider")}
                  onValueChange={(value) => setValue("provider", value as any)}
                >
                  <SelectTrigger className="bg-[#24262C] border-[#303136]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="azure">Azure OpenAI</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <Select
                  value={watch("environment")}
                  onValueChange={(value) => setValue("environment", value as any)}
                >
                  <SelectTrigger className="bg-[#24262C] border-[#303136]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider_name">Provider Name</Label>
              <Input
                id="provider_name"
                placeholder="My OpenAI Account"
                {...register("provider_name")}
                className="bg-[#24262C] border-[#303136]"
              />
              {errors.provider_name && (
                <p className="text-sm text-[#F87171]">{errors.provider_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                placeholder="sk-..."
                {...register("api_key")}
                className="bg-[#24262C] border-[#303136]"
              />
              {errors.api_key && (
                <p className="text-sm text-[#F87171]">{errors.api_key.message}</p>
              )}
            </div>

            {watch("provider") === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="base_url">Base URL</Label>
                <Input
                  id="base_url"
                  placeholder="https://api.example.com/v1"
                  {...register("base_url")}
                  className="bg-[#24262C] border-[#303136]"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="gpt-4"
                {...register("model")}
                className="bg-[#24262C] border-[#303136]"
              />
              {errors.model && (
                <p className="text-sm text-[#F87171]">{errors.model.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Default Temperature: {watch("default_temperature")}</Label>
                <Slider
                  value={[watch("default_temperature")]}
                  onValueChange={([value]) => setValue("default_temperature", value)}
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_tokens">Max Tokens</Label>
                <Input
                  id="max_tokens"
                  type="number"
                  {...register("max_tokens", { valueAsNumber: true })}
                  className="bg-[#24262C] border-[#303136]"
                />
                {errors.max_tokens && (
                  <p className="text-sm text-[#F87171]">{errors.max_tokens.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="usage_quota">Monthly Usage Quota (optional)</Label>
                <Input
                  id="usage_quota"
                  type="number"
                  placeholder="10000"
                  {...register("usage_quota", { valueAsNumber: true, required: false })}
                  className="bg-[#24262C] border-[#303136]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  setEditingProvider(null)
                  reset()
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#F6D365] hover:bg-[#F6D365]/90 text-[#22242A]"
                disabled={createProvider.isPending || updateProvider.isPending}
              >
                {(createProvider.isPending || updateProvider.isPending) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Provider"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
