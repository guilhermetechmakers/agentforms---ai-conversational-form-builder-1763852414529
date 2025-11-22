import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, MessageSquare, TrendingUp, Users } from "lucide-react"

export default function Dashboard() {
  // Mock data - replace with actual data fetching
  const stats = {
    totalAgents: 12,
    totalSessions: 1247,
    conversionRate: 68,
    activeUsers: 342,
  }

  const recentAgents = [
    { id: "1", name: "Customer Support Bot", sessions: 234, status: "published" },
    { id: "2", name: "Lead Qualification", sessions: 189, status: "published" },
    { id: "3", name: "Product Feedback", sessions: 0, status: "draft" },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F3F4F6]">Dashboard</h1>
          <p className="text-[#A1A1AA] mt-1">Welcome back! Here's your overview.</p>
        </div>
        <Button asChild className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90">
          <Link to="/dashboard/agents/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Total Agents</CardTitle>
            <MessageSquare className="h-4 w-4 text-[#F6D365]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F3F4F6]">{stats.totalAgents}</div>
            <p className="text-xs text-[#A1A1AA] mt-1">Active agents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-[#4ADE80]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F3F4F6]">{stats.totalSessions.toLocaleString()}</div>
            <p className="text-xs text-[#A1A1AA] mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#60A5FA]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F3F4F6]">{stats.conversionRate}%</div>
            <p className="text-xs text-[#A1A1AA] mt-1">Completed sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Active Users</CardTitle>
            <Users className="h-4 w-4 text-[#F472B6]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#F3F4F6]">{stats.activeUsers}</div>
            <p className="text-xs text-[#A1A1AA] mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Agents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Agents</CardTitle>
          <CardDescription>Your most recent agent configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAgents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-4 rounded-lg bg-[#24262C] border border-[#303136] hover:scale-[1.02] transition-all duration-200"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-[#F3F4F6]">{agent.name}</h3>
                  <p className="text-sm text-[#A1A1AA] mt-1">
                    {agent.sessions} sessions • {agent.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/dashboard/agents/${agent.id}`}>Edit</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/dashboard/sessions?agent=${agent.id}`}>View Sessions</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/dashboard/agents">View All Agents</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
