import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Plus, Link as LinkIcon, Webhook } from "lucide-react"
import { Link } from "react-router-dom"
import { useAgents } from "@/hooks/useAgents"

interface ChecklistItem {
  id: string
  label: string
  route?: string
  icon: React.ReactNode
  checkFn: () => boolean
}

export function OnboardingChecklist() {
  const { data: agentsData } = useAgents()
  const [dismissed, setDismissed] = useState(
    localStorage.getItem("onboarding_dismissed") === "true"
  )

  const agents = agentsData?.agents || []
  const hasAgents = agents.length > 0
  const hasPublishedAgent = agents.some(a => a.status === "published")
  const hasWebhook = false // TODO: Check webhook configuration

  const checklistItems: ChecklistItem[] = [
    {
      id: "create_agent",
      label: "Create your first agent",
      route: "/dashboard/agents/new",
      icon: <Plus className="h-4 w-4" />,
      checkFn: () => hasAgents,
    },
    {
      id: "publish_agent",
      label: "Publish an agent",
      route: hasAgents ? `/dashboard/agents/${agents[0]?.id}` : "/dashboard/agents/new",
      icon: <LinkIcon className="h-4 w-4" />,
      checkFn: () => hasPublishedAgent,
    },
    {
      id: "set_webhook",
      label: "Configure a webhook",
      route: "/dashboard/settings",
      icon: <Webhook className="h-4 w-4" />,
      checkFn: () => hasWebhook,
    },
  ]

  const completedCount = checklistItems.filter(item => item.checkFn()).length
  const allCompleted = completedCount === checklistItems.length

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem("onboarding_dismissed", "true")
  }

  if (dismissed || allCompleted) {
    return null
  }

  return (
    <Card className="bg-[#282A30] border-[#303136] hover:shadow-card transition-all duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#F3F4F6]">Getting Started</CardTitle>
            <CardDescription className="text-[#A1A1AA]">
              Complete these steps to get the most out of AgentForms
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-[#A1A1AA] hover:text-[#F3F4F6]"
          >
            Dismiss
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {checklistItems.map((item) => {
          const completed = item.checkFn()
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-[#24262C] border border-[#303136] hover:border-[#60A5FA]/50 transition-colors"
            >
              <div className="flex-shrink-0">
                {completed ? (
                  <CheckCircle2 className="h-5 w-5 text-[#4ADE80]" />
                ) : (
                  <Circle className="h-5 w-5 text-[#6B7280]" />
                )}
              </div>
              <div className="flex-1 flex items-center gap-2">
                <span className="text-[#A1A1AA]">{item.icon}</span>
                <span
                  className={`text-sm ${
                    completed ? "text-[#A1A1AA] line-through" : "text-[#F3F4F6]"
                  }`}
                >
                  {item.label}
                </span>
              </div>
              {!completed && item.route && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-[#60A5FA] hover:text-[#60A5FA] hover:bg-[#60A5FA]/10"
                >
                  <Link to={item.route}>Go →</Link>
                </Button>
              )}
            </div>
          )
        })}
        <div className="pt-2 border-t border-[#303136]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#A1A1AA]">Progress</span>
            <span className="text-[#F3F4F6] font-semibold">
              {completedCount} / {checklistItems.length}
            </span>
          </div>
          <div className="mt-2 h-2 bg-[#24262C] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#4ADE80] to-[#60A5FA] transition-all duration-300"
              style={{ width: `${(completedCount / checklistItems.length) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
