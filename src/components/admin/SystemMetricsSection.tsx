import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMetricsSummary, useMetricsTimeSeries } from "@/hooks/useAdmin"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MessageSquare,
  Activity,
  Zap,
  AlertCircle,
  Users,
  DollarSign,
} from "lucide-react"

export function SystemMetricsSection() {
  const { data: metrics, isLoading } = useMetricsSummary()
  const { data: sessionsData } = useMetricsTimeSeries("monthly_sessions")
  const { data: llmUsageData } = useMetricsTimeSeries("llm_usage")
  const { data: revenueData } = useMetricsTimeSeries("revenue")

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        <Card className="bg-[#282A30] border-[#303136]">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const chartData = sessionsData?.map((item, index) => ({
    date: format(new Date(item.date), "MMM dd"),
    sessions: item.value,
    llmUsage: llmUsageData?.[index]?.value || 0,
    revenue: revenueData?.[index]?.value || 0,
  })) || []

  const metricCards = [
    {
      label: "Total Agents",
      value: metrics.total_agents.toLocaleString(),
      icon: MessageSquare,
      color: "text-[#4ADE80]",
      bgColor: "bg-[#4ADE80]/20",
    },
    {
      label: "Monthly Sessions",
      value: metrics.monthly_sessions.toLocaleString(),
      icon: Activity,
      color: "text-[#60A5FA]",
      bgColor: "bg-[#60A5FA]/20",
    },
    {
      label: "LLM Usage",
      value: `${metrics.llm_usage.toLocaleString()} tokens`,
      icon: Zap,
      color: "text-[#F6D365]",
      bgColor: "bg-[#F6D365]/20",
    },
    {
      label: "Error Rate",
      value: `${metrics.error_rate.toFixed(2)}%`,
      icon: AlertCircle,
      color: metrics.error_rate > 5 ? "text-[#F87171]" : "text-[#4ADE80]",
      bgColor: metrics.error_rate > 5 ? "bg-[#F87171]/20" : "bg-[#4ADE80]/20",
    },
    {
      label: "Active Users",
      value: metrics.active_users.toLocaleString(),
      icon: Users,
      color: "text-[#F472B6]",
      bgColor: "bg-[#F472B6]/20",
    },
    {
      label: "MRR",
      value: `$${metrics.mrr.toLocaleString()}`,
      icon: DollarSign,
      color: "text-[#F6D365]",
      bgColor: "bg-[#F6D365]/20",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metricCards.map((metric, index) => (
          <Card
            key={index}
            className="bg-[#282A30] border-[#303136] hover:shadow-card transition-all duration-200 card-hover"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#A1A1AA] mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-[#F3F4F6]">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sessions Chart */}
        <Card className="bg-[#282A30] border-[#303136]">
          <CardHeader>
            <CardTitle className="text-[#F3F4F6]">Monthly Sessions</CardTitle>
            <CardDescription className="text-[#A1A1AA]">
              Session activity over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#303136" />
                <XAxis
                  dataKey="date"
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
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  dot={{ fill: "#60A5FA", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* LLM Usage Chart */}
        <Card className="bg-[#282A30] border-[#303136]">
          <CardHeader>
            <CardTitle className="text-[#F3F4F6]">LLM Usage</CardTitle>
            <CardDescription className="text-[#A1A1AA]">
              Token consumption over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#303136" />
                <XAxis
                  dataKey="date"
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
                <Legend />
                <Bar dataKey="llmUsage" fill="#F6D365" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      {revenueData && revenueData.length > 0 && (
        <Card className="bg-[#282A30] border-[#303136]">
          <CardHeader>
            <CardTitle className="text-[#F3F4F6]">Revenue Trend</CardTitle>
            <CardDescription className="text-[#A1A1AA]">
              Monthly recurring revenue over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#303136" />
                <XAxis
                  dataKey="date"
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
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4ADE80"
                  strokeWidth={2}
                  dot={{ fill: "#4ADE80", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
