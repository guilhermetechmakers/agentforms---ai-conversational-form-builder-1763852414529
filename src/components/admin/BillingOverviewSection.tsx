import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useBillingOverview } from "@/hooks/useAdmin"
import {
  LineChart,
  Line,
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  ArrowUpRight,
} from "lucide-react"

export function BillingOverviewSection() {
  const { data: billing, isLoading } = useBillingOverview()

  if (isLoading || !billing) {
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

  const chartData = billing.revenue_timeseries.map((item) => ({
    date: format(new Date(item.date), "MMM dd"),
    revenue: item.value,
  }))

  const stats = [
    {
      label: "Total Revenue",
      value: `$${billing.total_revenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-[#F6D365]",
      bgColor: "bg-[#F6D365]/20",
    },
    {
      label: "Monthly Recurring Revenue",
      value: `$${billing.mrr.toLocaleString()}`,
      icon: CreditCard,
      color: "text-[#4ADE80]",
      bgColor: "bg-[#4ADE80]/20",
    },
    {
      label: "Annual Recurring Revenue",
      value: `$${billing.arr.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-[#60A5FA]",
      bgColor: "bg-[#60A5FA]/20",
    },
    {
      label: "Active Subscriptions",
      value: billing.active_subscriptions.toLocaleString(),
      icon: Users,
      color: "text-[#F472B6]",
      bgColor: "bg-[#F472B6]/20",
    },
    {
      label: "New This Month",
      value: billing.new_subscriptions_this_month.toLocaleString(),
      icon: ArrowUpRight,
      color: "text-[#4ADE80]",
      bgColor: "bg-[#4ADE80]/20",
    },
    {
      label: "Churn Rate",
      value: `${billing.churn_rate.toFixed(2)}%`,
      icon: billing.churn_rate > 5 ? TrendingDown : TrendingUp,
      color: billing.churn_rate > 5 ? "text-[#F87171]" : "text-[#4ADE80]",
      bgColor: billing.churn_rate > 5 ? "bg-[#F87171]/20" : "bg-[#4ADE80]/20",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="bg-[#282A30] border-[#303136] hover:shadow-card transition-all duration-200 card-hover"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#A1A1AA] mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#F3F4F6]">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card className="bg-[#282A30] border-[#303136]">
        <CardHeader>
          <CardTitle className="text-[#F3F4F6]">Revenue Trend</CardTitle>
          <CardDescription className="text-[#A1A1AA]">
            Monthly recurring revenue over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#303136" />
              <XAxis
                dataKey="date"
                stroke="#A1A1AA"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#A1A1AA"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
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
                name="MRR"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
