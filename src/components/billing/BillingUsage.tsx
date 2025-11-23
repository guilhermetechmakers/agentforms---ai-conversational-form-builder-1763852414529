import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, TrendingUp, AlertCircle } from "lucide-react"
import { useUsageSummary, useUsageRecords } from "@/hooks/useBilling"
import { format } from "date-fns"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

export function BillingUsage() {
  const { data: usageSummary, isLoading: summaryLoading } = useUsageSummary()
  const { data: usageRecords, isLoading: recordsLoading } = useUsageRecords(12)

  const isLoading = summaryLoading || recordsLoading

  // Prepare chart data
  const chartData = usageRecords?.map((record) => ({
    period: format(new Date(record.billing_cycle_start), "MMM yyyy"),
    llm_calls: record.metrics.llm_calls || 0,
    sessions: record.metrics.sessions || 0,
    messages: record.metrics.messages || 0,
  })) || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Usage Summary */}
      {usageSummary && (
        <Card className="border-[#303136] bg-[#282A30]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#F3F4F6]">
              <BarChart3 className="h-5 w-5 text-[#F6D365]" />
              Current Billing Cycle
            </CardTitle>
            <CardDescription className="text-[#A1A1AA]">
              {format(new Date(usageSummary.billing_cycle_start), "MMM dd, yyyy")} -{" "}
              {format(new Date(usageSummary.billing_cycle_end), "MMM dd, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(usageSummary.metrics).map(([key, value]) => {
                const limit = usageSummary.quota_limits[key] || 0
                const percentage = usageSummary.usage_percentage[key] || 0
                const isOverLimit = percentage > 100
                const isNearLimit = percentage > 80

                return (
                  <div
                    key={key}
                    className="p-4 rounded-xl bg-[#24262C] border border-[#303136] hover:border-[#60A5FA]/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#A1A1AA] capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      {isOverLimit && (
                        <AlertCircle className="h-4 w-4 text-[#F87171]" />
                      )}
                      {isNearLimit && !isOverLimit && (
                        <AlertCircle className="h-4 w-4 text-[#FBBF24]" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#F3F4F6]">
                        {value.toLocaleString()}
                      </span>
                      {limit > 0 && (
                        <span className="text-sm text-[#A1A1AA]">
                          / {limit.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {limit > 0 && (
                      <div className="mt-3">
                        <div className="w-full bg-[#24262C] rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isOverLimit
                                ? "bg-[#F87171]"
                                : percentage > 80
                                ? "bg-[#FBBF24]"
                                : "bg-[#4ADE80]"
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-[#A1A1AA] mt-1">
                          {percentage.toFixed(1)}% used
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage History Chart */}
      {chartData.length > 0 && (
        <Card className="border-[#303136] bg-[#282A30]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#F3F4F6]">
              <TrendingUp className="h-5 w-5 text-[#F6D365]" />
              Usage History
            </CardTitle>
            <CardDescription className="text-[#A1A1AA]">
              Historical usage data for the past 12 billing cycles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#303136" />
                <XAxis
                  dataKey="period"
                  stroke="#A1A1AA"
                  style={{ fontSize: "12px" }}
                />
                <YAxis stroke="#A1A1AA" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#282A30",
                    border: "1px solid #303136",
                    borderRadius: "8px",
                    color: "#F3F4F6",
                  }}
                />
                <Legend
                  wrapperStyle={{ color: "#A1A1AA", fontSize: "12px" }}
                />
                <Bar
                  dataKey="llm_calls"
                  fill="#60A5FA"
                  name="LLM Calls"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="sessions"
                  fill="#4ADE80"
                  name="Sessions"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="messages"
                  fill="#F6D365"
                  name="Messages"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {!usageSummary && !isLoading && (
        <Card className="border-[#303136] bg-[#282A30]">
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 text-[#A1A1AA] mx-auto mb-4" />
            <p className="text-[#A1A1AA]">No usage data available</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
