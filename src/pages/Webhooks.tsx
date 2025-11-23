import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Webhook as WebhookIcon } from "lucide-react"
import { WebhookList } from "@/components/webhooks/WebhookList"
import { WebhookEditor } from "@/components/webhooks/WebhookEditor"
import { DeliveryLogs } from "@/components/webhooks/DeliveryLogs"
import type { Webhook } from "@/types/webhook"

export default function Webhooks() {
  const [activeTab, setActiveTab] = useState<"list" | "create" | "logs">("list")
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const handleCreate = () => {
    setEditingWebhook(null)
    setActiveTab("create")
  }

  const handleEdit = (webhook: Webhook) => {
    setEditingWebhook(webhook)
    setActiveTab("create")
  }

  const handleSuccess = () => {
    setEditingWebhook(null)
    setActiveTab("list")
  }

  const handleCancel = () => {
    setEditingWebhook(null)
    setActiveTab("list")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F3F4F6] flex items-center gap-3">
            <WebhookIcon className="h-8 w-8 text-[#F6D365]" />
            Webhooks & Integrations
          </h1>
          <p className="text-[#A1A1AA] mt-2">
            Configure webhooks to receive session data automatically
          </p>
        </div>
        {activeTab === "list" && (
          <Button
            onClick={handleCreate}
            className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Webhook
          </Button>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
        <TabsList className="bg-[#282A30] border-[#303136] p-1">
          <TabsTrigger
            value="list"
            className="data-[state=active]:bg-[#24262C] data-[state=active]:text-[#F3F4F6] text-[#A1A1AA]"
          >
            Webhooks
          </TabsTrigger>
          <TabsTrigger
            value="logs"
            className="data-[state=active]:bg-[#24262C] data-[state=active]:text-[#F3F4F6] text-[#A1A1AA]"
          >
            Delivery Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Search */}
          {activeTab === "list" && (
            <Card className="bg-[#282A30] border-[#303136]">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
                  <Input
                    placeholder="Search webhooks by URL..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA]"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Webhook List or Editor */}
          {activeTab === "list" && !editingWebhook ? (
            <WebhookList
              onEdit={handleEdit}
              onCreate={handleCreate}
              filters={{
                search: searchQuery || undefined,
              }}
            />
          ) : activeTab === "list" && editingWebhook ? (
            <WebhookEditor
              webhook={editingWebhook}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          ) : null}

          {activeTab === "create" && (
            <WebhookEditor
              webhook={editingWebhook}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <DeliveryLogs />
        </TabsContent>
      </Tabs>
    </div>
  )
}
