import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download } from "lucide-react"

export default function SessionsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Mock data
  const sessions = [
    {
      id: "1",
      agentName: "Customer Support Bot",
      startedAt: "2024-01-15T10:30:00Z",
      status: "completed",
      fieldsCollected: 5,
    },
    {
      id: "2",
      agentName: "Lead Qualification",
      startedAt: "2024-01-15T09:15:00Z",
      status: "in-progress",
      fieldsCollected: 2,
    },
    {
      id: "3",
      agentName: "Product Feedback",
      startedAt: "2024-01-14T14:20:00Z",
      status: "completed",
      fieldsCollected: 8,
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F3F4F6]">Sessions</h1>
          <p className="text-[#A1A1AA] mt-1">View and manage all conversation sessions</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>All conversation sessions across your agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sessions.map((session) => (
              <Link
                key={session.id}
                to={`/dashboard/sessions/${session.id}`}
                className="block p-4 rounded-lg bg-[#24262C] border border-[#303136] hover:scale-[1.02] transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-[#F3F4F6]">{session.agentName}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.status === "completed"
                            ? "bg-[#4ADE80]/20 text-[#4ADE80]"
                            : session.status === "in-progress"
                            ? "bg-[#FBBF24]/20 text-[#FBBF24]"
                            : "bg-[#F87171]/20 text-[#F87171]"
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>
                    <p className="text-sm text-[#A1A1AA] mt-1">
                      {new Date(session.startedAt).toLocaleString()} • {session.fieldsCollected} fields collected
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
