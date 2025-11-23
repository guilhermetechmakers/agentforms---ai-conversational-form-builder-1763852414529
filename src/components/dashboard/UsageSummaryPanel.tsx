import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MessageSquare, TrendingUp, Users, Zap } from "lucide-react"
import { useUsageSummary } from "@/hooks/useAgents"
import { Skeleton } from "@/components/ui/skeleton"

export function UsageSummaryPanel() {
  const { data: usage, isLoading } = useUsageSummary()

  if (isLoading) {
    return (
      <Card className="bg-[#282A30] border-[#303136]">
        <CardHeader>
          <CardTitle className="text-[#F3F4F6]">Usage Summary</CardTitle>
          <CardDescription className="text-[#A1A1AA]">Your current usage and limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full bg-[#24262C]" />
          <Skeleton className="h-20 w-full bg-[#24262C]" />
          <Skeleton className="h-20 w-full bg-[#24262C]" />
        </CardContent>
      </Card>
    )
  }

  const quota = usage?.remaining_quota || {}
  const monthlySessions = usage?.monthly_sessions || 0
  const totalAgents = usage?.total_agents || 0
  const activeAgents = usage?.active_agents || 0
  const conversionRate = usage?.conversion_rate || 0

  // Calculate quota usage
  const sessionsLimit = quota.sessions_per_month || Infinity
  const agentsLimit = quota.agents || Infinity
  const sessionsUsagePercent = sessionsLimit === Infinity ? 0 : Math.min((monthlySessions / sessionsLimit) * 100, 100)
  const agentsUsagePercent = agentsLimit === Infinity ? 0 : Math.min((totalAgents / agentsLimit) * 100, 100)

  return (
    <Card className="bg-[#282A30] border-[#303136] hover:shadow-card transition-all duration-200">
      <CardHeader>
        <CardTitle className="text-[#F3F4F6]">Usage Summary</CardTitle>
        <CardDescription className="text-[#A1A1AA]">Your current usage and limits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Monthly Sessions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#4ADE80]" />
              <span className="text-sm font-medium text-[#F3F4F6]">Monthly Sessions</span>
            </div>
            <span className="text-sm text-[#A1A1AA]">
              {monthlySessions.toLocaleString()}
              {sessionsLimit !== Infinity && ` / ${sessionsLimit.toLocaleString()}`}
            </span>
          </div>
          {sessionsLimit !== Infinity && (
            <Progress 
              value={sessionsUsagePercent} 
              className="h-2 bg-[#24262C]"
            />
          )}
        </div>

        {/* Active Agents */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#F6D365]" />
              <span className="text-sm font-medium text-[#F3F4F6]">Active Agents</span>
            </div>
            <span className="text-sm text-[#A1A1AA]">
              {activeAgents} / {totalAgents}
              {agentsLimit !== Infinity && ` (${agentsLimit} limit)`}
            </span>
          </div>
          {agentsLimit !== Infinity && (
            <Progress 
              value={agentsUsagePercent} 
              className="h-2 bg-[#24262C]"
            />
          )}
        </div>

        {/* Conversion Rate */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-[#24262C] border border-[#303136]">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#60A5FA]" />
            <span className="text-sm font-medium text-[#F3F4F6]">Conversion Rate</span>
          </div>
          <span className="text-lg font-semibold text-[#4ADE80]">{conversionRate.toFixed(1)}%</span>
        </div>

        {/* Total Sessions */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-[#24262C] border border-[#303136]">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#F472B6]" />
            <span className="text-sm font-medium text-[#F3F4F6]">Total Sessions</span>
          </div>
          <span className="text-lg font-semibold text-[#F3F4F6]">
            {(usage?.total_sessions || 0).toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
