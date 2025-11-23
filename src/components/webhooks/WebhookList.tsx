import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  Copy,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react"
import { useWebhooks, useDeleteWebhook, useTestWebhook } from "@/hooks/useWebhooks"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import type { Webhook, WebhookFilters } from "@/types/webhook"

interface WebhookListProps {
  onEdit: (webhook: Webhook) => void
  onCreate: () => void
  filters?: WebhookFilters
}

export function WebhookList({ onEdit, onCreate, filters }: WebhookListProps) {
  const { data, isLoading } = useWebhooks(filters)
  const deleteWebhook = useDeleteWebhook()
  const testWebhook = useTestWebhook()

  const webhooks = data?.webhooks || []

  const getStatusBadge = (webhook: Webhook) => {
    if (!webhook.enabled) {
      return (
        <Badge variant="outline" className="bg-[#282A30] text-[#A1A1AA] border-[#303136]">
          Disabled
        </Badge>
      )
    }
    if (webhook.status === 'paused') {
      return (
        <Badge variant="outline" className="bg-[#282A30] text-[#FBBF24] border-[#303136]">
          Paused
        </Badge>
      )
    }
    if (webhook.last_delivery_status === 'success') {
      return (
        <Badge className="bg-[#4ADE80]/20 text-[#4ADE80] border-[#4ADE80]/30">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Active
        </Badge>
      )
    }
    if (webhook.last_delivery_status === 'failed') {
      return (
        <Badge className="bg-[#F87171]/20 text-[#F87171] border-[#F87171]/30">
          <XCircle className="h-3 w-3 mr-1" />
          Error
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-[#282A30] text-[#A1A1AA] border-[#303136]">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    )
  }

  const handleDelete = async (webhook: Webhook) => {
    if (confirm(`Are you sure you want to delete "${webhook.url}"?`)) {
      await deleteWebhook.mutateAsync(webhook.id)
    }
  }

  const handleTest = async (webhook: Webhook) => {
    await testWebhook.mutateAsync(webhook.id)
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success("URL copied to clipboard")
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-[#282A30] border-[#303136] animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-[#24262C] rounded w-1/3 mb-4" />
              <div className="h-4 bg-[#24262C] rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (webhooks.length === 0) {
    return (
      <Card className="bg-[#282A30] border-[#303136]">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#24262C] flex items-center justify-center">
              <ExternalLink className="h-8 w-8 text-[#A1A1AA]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#F3F4F6] mb-2">
                No webhooks configured
              </h3>
              <p className="text-sm text-[#A1A1AA] mb-6">
                Create your first webhook to start receiving session data automatically.
              </p>
              <Button onClick={onCreate} className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Webhook
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {webhooks.map((webhook) => (
        <Card
          key={webhook.id}
          className="bg-[#282A30] border-[#303136] hover:bg-[#2A2C32] hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-[#F3F4F6] text-lg">
                    {webhook.url}
                  </h3>
                  {getStatusBadge(webhook)}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-[#A1A1AA]">
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-[#F3F4F6]">Method:</span>
                    <Badge variant="outline" className="bg-[#24262C] border-[#303136] text-[#A1A1AA]">
                      {webhook.method}
                    </Badge>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-[#F3F4F6]">Triggers:</span>
                    <span>{webhook.triggers.length} event{webhook.triggers.length !== 1 ? 's' : ''}</span>
                  </span>
                  {webhook.last_successful_delivery_at && (
                    <span className="flex items-center gap-1">
                      <span className="font-medium text-[#F3F4F6]">Last delivery:</span>
                      <span>{formatDistanceToNow(new Date(webhook.last_successful_delivery_at), { addSuffix: true })}</span>
                    </span>
                  )}
                </div>

                {webhook.triggers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {webhook.triggers.map((trigger) => (
                      <Badge
                        key={trigger}
                        variant="outline"
                        className="bg-[#24262C] border-[#303136] text-[#60A5FA] text-xs"
                      >
                        {trigger.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#A1A1AA] hover:text-[#F3F4F6] hover:bg-[#24262C]"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-[#282A30] border-[#303136] text-[#F3F4F6]"
                >
                  <DropdownMenuItem
                    onClick={() => onEdit(webhook)}
                    className="text-[#F3F4F6] hover:bg-[#24262C] focus:bg-[#24262C]"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleTest(webhook)}
                    className="text-[#F3F4F6] hover:bg-[#24262C] focus:bg-[#24262C]"
                    disabled={testWebhook.isPending}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Test Delivery
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleCopyUrl(webhook.url)}
                    className="text-[#F3F4F6] hover:bg-[#24262C] focus:bg-[#24262C]"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#303136]" />
                  <DropdownMenuItem
                    onClick={() => handleDelete(webhook)}
                    className="text-[#F87171] hover:bg-[#24262C] focus:bg-[#24262C]"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
