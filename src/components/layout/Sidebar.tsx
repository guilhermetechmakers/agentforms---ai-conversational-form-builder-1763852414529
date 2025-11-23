import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  FileText,
  Webhook,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Shield,
  CreditCard,
  Lock
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useProfile } from "@/hooks/useProfile"

const baseNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agents", href: "/dashboard/agents", icon: MessageSquare },
  { name: "Sessions", href: "/dashboard/sessions", icon: FileText },
  { name: "Webhooks", href: "/dashboard/webhooks", icon: Webhook },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Security", href: "/dashboard/security", icon: Lock },
  { name: "Help", href: "/dashboard/help", icon: HelpCircle },
]


interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void
}

export function Sidebar({ onCollapseChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { data: profileData } = useProfile()
  
  const isAdmin = profileData?.profile?.role === "admin"
  
  const navigation = isAdmin
    ? [
        ...baseNavigation,
        { name: "Admin", href: "/dashboard/admin", icon: Shield },
      ]
    : baseNavigation

  const handleToggle = () => {
    const newCollapsed = !collapsed
    setCollapsed(newCollapsed)
    onCollapseChange?.(newCollapsed)
  }

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-[#22242A] border-r border-[#303136] transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo/Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[#303136]">
          {!collapsed && (
            <h1 className="text-xl font-bold text-[#F3F4F6]">AgentForms</h1>
          )}
          <button
            onClick={handleToggle}
            className="p-2 rounded-lg hover:bg-[#282A30] text-[#A1A1AA] hover:text-[#F3F4F6] transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#282A30] text-[#F6D365] border-l-4 border-[#F6D365]"
                    : "text-[#A1A1AA] hover:bg-[#282A30] hover:text-[#F3F4F6]"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

      </div>
    </div>
  )
}
