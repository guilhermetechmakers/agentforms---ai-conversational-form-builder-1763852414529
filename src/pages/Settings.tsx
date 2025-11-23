import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CreditCard,
  Users,
  Brain,
  Shield,
  FileText,
  Webhook,
} from "lucide-react"
import { BillingPlanSection } from "@/components/settings/BillingPlanSection"
import { TeamManagementSection } from "@/components/settings/TeamManagementSection"
import { LLMSettingsSection } from "@/components/settings/LLMSettingsSection"
import { DataRetentionSection } from "@/components/settings/DataRetentionSection"
import { AuditLogsSection } from "@/components/settings/AuditLogsSection"
import { useProfile } from "@/hooks/useProfile"

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: profileData } = useProfile()
  const isAdmin = profileData?.profile?.role === "admin"
  
  // Get initial tab from URL or default to billing
  const initialTab = searchParams.get("tab") || "billing"
  const [activeTab, setActiveTab] = useState(initialTab)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSearchParams({ tab: value })
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F3F4F6]">Settings & Preferences</h1>
          <p className="text-[#A1A1AA] mt-1">
            Manage your account settings, team, and integrations
          </p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 gap-2">
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="llm" className="gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">LLM & API</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="h-4 w-4" />
            <span className="hidden sm:inline">Webhooks</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="audit" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Billing & Plan Tab */}
        <TabsContent value="billing" className="mt-6">
          <BillingPlanSection />
        </TabsContent>

        {/* Team Management Tab */}
        <TabsContent value="team" className="mt-6">
          <TeamManagementSection />
        </TabsContent>

        {/* LLM & API Settings Tab */}
        <TabsContent value="llm" className="mt-6">
          <LLMSettingsSection />
        </TabsContent>

        {/* Data Retention & Privacy Tab */}
        <TabsContent value="privacy" className="mt-6">
          <DataRetentionSection />
        </TabsContent>

        {/* Webhooks Shortcut Tab */}
        <TabsContent value="webhooks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhooks & Integrations
              </CardTitle>
              <CardDescription>
                Configure webhook endpoints and delivery policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[#A1A1AA] mb-4">
                Manage your webhooks and integrations from the dedicated Webhooks page.
              </p>
              <a
                href="/dashboard/webhooks"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#60A5FA] text-white rounded-lg hover:bg-[#60A5FA]/90 transition-colors"
              >
                Go to Webhooks
              </a>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab (Admin only) */}
        {isAdmin && (
          <TabsContent value="audit" className="mt-6">
            <AuditLogsSection />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
