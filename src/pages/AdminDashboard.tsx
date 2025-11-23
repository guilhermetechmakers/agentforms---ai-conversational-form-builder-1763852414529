import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Users,
  Shield,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Activity,
  MessageSquare,
} from "lucide-react"
import { useAdminDashboard, useMetricsSummary, useBillingOverview } from "@/hooks/useAdmin"
import { SystemMetricsSection } from "@/components/admin/SystemMetricsSection"
import { UserManagementSection } from "@/components/admin/UserManagementSection"
import { ModerationQueueSection } from "@/components/admin/ModerationQueueSection"
import { BillingOverviewSection } from "@/components/admin/BillingOverviewSection"
import { AuditLogsSection } from "@/components/admin/AuditLogsSection"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const { data: dashboardData, isLoading: dashboardLoading } = useAdminDashboard()
  const { data: metrics, isLoading: metricsLoading } = useMetricsSummary()
  const { data: billing, isLoading: billingLoading } = useBillingOverview()

  if (dashboardLoading || metricsLoading || billingLoading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-[#282A30] border-[#303136]">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const metricsData = metrics || {
    total_agents: 0,
    monthly_sessions: 0,
    llm_usage: 0,
    error_rate: 0,
    active_users: 0,
    revenue: 0,
    mrr: 0,
    churn_rate: 0,
  }

  const billingData = billing || {
    total_revenue: 0,
    mrr: 0,
    arr: 0,
    churn_rate: 0,
    active_subscriptions: 0,
    new_subscriptions_this_month: 0,
    revenue_growth: 0,
    revenue_timeseries: [],
  }

  const pendingModerations = dashboardData?.pending_moderations || 0

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F3F4F6]">Admin Dashboard</h1>
          <p className="text-[#A1A1AA] mt-1">
            Monitor and manage the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-[#303136] text-[#F3F4F6] hover:bg-[#282A30]"
          >
            <Activity className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#282A30] border-[#303136] hover:shadow-card transition-all duration-200 card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">
              Total Agents
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-[#4ADE80]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F3F4F6]">
              {metricsData.total_agents.toLocaleString()}
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Across all organizations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#282A30] border-[#303136] hover:shadow-card transition-all duration-200 card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">
              Monthly Sessions
            </CardTitle>
            <Activity className="h-4 w-4 text-[#60A5FA]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F3F4F6]">
              {metricsData.monthly_sessions.toLocaleString()}
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#282A30] border-[#303136] hover:shadow-card transition-all duration-200 card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#F6D365]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F3F4F6]">
              ${billingData.mrr.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {billingData.revenue_growth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-[#4ADE80]" />
              ) : (
                <TrendingDown className="h-3 w-3 text-[#F87171]" />
              )}
              <p className="text-xs text-[#A1A1AA]">
                {billingData.revenue_growth >= 0 ? "+" : ""}
                {billingData.revenue_growth.toFixed(1)}% growth
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#282A30] border-[#303136] hover:shadow-card transition-all duration-200 card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">
              Pending Moderation
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-[#FBBF24]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F3F4F6]">
              {pendingModerations}
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Items awaiting review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-[#282A30] border border-[#303136] p-1">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-[#24262C] data-[state=active]:text-[#F6D365] text-[#A1A1AA]"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-[#24262C] data-[state=active]:text-[#F6D365] text-[#A1A1AA]"
          >
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger
            value="moderation"
            className="data-[state=active]:bg-[#24262C] data-[state=active]:text-[#F6D365] text-[#A1A1AA]"
          >
            <Shield className="mr-2 h-4 w-4" />
            Moderation
            {pendingModerations > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-[#FBBF24]/20 text-[#FBBF24] text-xs">
                {pendingModerations}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="data-[state=active]:bg-[#24262C] data-[state=active]:text-[#F6D365] text-[#A1A1AA]"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className="data-[state=active]:bg-[#24262C] data-[state=active]:text-[#F6D365] text-[#A1A1AA]"
          >
            <FileText className="mr-2 h-4 w-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <SystemMetricsSection />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagementSection />
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <ModerationQueueSection />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <BillingOverviewSection />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <AuditLogsSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
