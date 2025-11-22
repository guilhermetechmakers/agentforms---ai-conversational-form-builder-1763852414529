import { useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Send, CheckCircle2 } from "lucide-react"

export default function SessionInspector() {
  const { id } = useParams()

  // Mock data
  const session = {
    id: id || "1",
    agentName: "Customer Support Bot",
    status: "completed",
    startedAt: "2024-01-15T10:30:00Z",
    completedAt: "2024-01-15T10:35:00Z",
    messages: [
      { id: "1", role: "agent", content: "Hello! How can I help you today?", timestamp: "2024-01-15T10:30:00Z" },
      { id: "2", role: "visitor", content: "I need help with my order", timestamp: "2024-01-15T10:30:15Z" },
      { id: "3", role: "agent", content: "I'd be happy to help! Can you provide your order number?", timestamp: "2024-01-15T10:30:20Z" },
    ],
    fieldValues: [
      { fieldKey: "name", value: "John Doe" },
      { fieldKey: "email", value: "john@example.com" },
      { fieldKey: "issue", value: "Order not received" },
    ],
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F3F4F6]">Session Details</h1>
          <p className="text-[#A1A1AA] mt-1">Session ID: {session.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Send className="mr-2 h-4 w-4" />
            Resend Webhook
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#A1A1AA]">Agent:</span>
            <span className="text-[#F3F4F6] font-medium">{session.agentName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#A1A1AA]">Status:</span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#4ADE80]/20 text-[#4ADE80]">
              {session.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#A1A1AA]">Started:</span>
            <span className="text-[#F3F4F6]">{new Date(session.startedAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#A1A1AA]">Completed:</span>
            <span className="text-[#F3F4F6]">
              {session.completedAt ? new Date(session.completedAt).toLocaleString() : "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Collected Data */}
      <Card>
        <CardHeader>
          <CardTitle>Collected Data</CardTitle>
          <CardDescription>Structured data extracted from the conversation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {session.fieldValues.map((field) => (
              <div
                key={field.fieldKey}
                className="flex items-center justify-between p-3 rounded-lg bg-[#24262C] border border-[#303136]"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#F3F4F6] capitalize">{field.fieldKey}</div>
                  <div className="text-sm text-[#A1A1AA] mt-1">{field.value}</div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-[#4ADE80]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversation Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Conversation Timeline</CardTitle>
          <CardDescription>Full conversation history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {session.messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "visitor" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-xl p-4 ${
                    message.role === "agent"
                      ? "bg-[#24262C] border border-[#303136] text-[#F3F4F6]"
                      : "bg-[#F6D365] text-[#22242A]"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
