import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

// Pages
import Landing from "@/pages/Landing"
import Login from "@/pages/Login"
import Signup from "@/pages/Signup"
import Dashboard from "@/pages/Dashboard"
import AgentBuilder from "@/pages/AgentBuilder"
import SessionsList from "@/pages/SessionsList"
import SessionInspector from "@/pages/SessionInspector"
import AboutHelp from "@/pages/AboutHelp"
import PrivacyTerms from "@/pages/PrivacyTerms"
import NotFound from "@/pages/NotFound"
import ServerError from "@/pages/ServerError"
import PublicAgentChat from "@/pages/PublicAgentChat"

// React Query client with optimal defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Public agent chat routes */}
          <Route path="/a/:agentSlug" element={<PublicAgentChat />} />
          <Route path="/chat/:agentSlug" element={<PublicAgentChat />} />

          {/* Dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/agents"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/agents/new"
            element={
              <DashboardLayout>
                <AgentBuilder />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/agents/:id"
            element={
              <DashboardLayout>
                <AgentBuilder />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/sessions"
            element={
              <DashboardLayout>
                <SessionsList />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/sessions/:id"
            element={
              <DashboardLayout>
                <SessionInspector />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/help"
            element={
              <DashboardLayout>
                <AboutHelp />
              </DashboardLayout>
            }
          />
          <Route
            path="/help"
            element={
              <DashboardLayout>
                <AboutHelp />
              </DashboardLayout>
            }
          />

          {/* Legal pages */}
          <Route path="/privacy" element={<PrivacyTerms />} />
          <Route path="/terms" element={<PrivacyTerms />} />

          {/* Error pages */}
          <Route path="/500" element={<ServerError />} />
          <Route path="/error" element={<ServerError />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
