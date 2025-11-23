import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { AuthProvider } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

// Pages
import Landing from "@/pages/Landing"
import Login from "@/pages/Login"
import Signup from "@/pages/Signup"
import ForgotPassword from "@/pages/ForgotPassword"
import ResetPassword from "@/pages/ResetPassword"
import Dashboard from "@/pages/Dashboard"
import AgentBuilder from "@/pages/AgentBuilder"
import AgentSandbox from "@/pages/AgentSandbox"
import SessionsList from "@/pages/SessionsList"
import SessionInspector from "@/pages/SessionInspector"
import AboutHelp from "@/pages/AboutHelp"
import PrivacyTerms from "@/pages/PrivacyTerms"
import NotFound from "@/pages/NotFound"
import ServerError from "@/pages/ServerError"
import PublicAgentChat from "@/pages/PublicAgentChat"
import Checkout from "@/pages/Checkout"
import CheckoutSuccess from "@/pages/CheckoutSuccess"
import EmailVerification from "@/pages/EmailVerification"
import UserProfile from "@/pages/UserProfile"
import AdminDashboard from "@/pages/AdminDashboard"
import Webhooks from "@/pages/Webhooks"
import Settings from "@/pages/Settings"
import SecurityCompliance from "@/pages/SecurityCompliance"
import { LLMOrchestration } from "@/pages/LLMOrchestration"
import Billing from "@/pages/Billing"
import Exports from "@/pages/Exports"

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
        <AuthProvider>
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          
          {/* Public agent chat routes */}
          <Route path="/a/:agentSlug" element={<PublicAgentChat />} />
          <Route path="/chat/:agentSlug" element={<PublicAgentChat />} />

          {/* Dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/agents"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/agents/new"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AgentBuilder />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/agents/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AgentBuilder />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/agents/:id/sandbox"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AgentSandbox />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/sessions"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SessionsList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/sessions/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SessionInspector />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/help"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AboutHelp />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AboutHelp />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UserProfile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/webhooks"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Webhooks />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/security"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SecurityCompliance />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/billing"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Billing />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/llm-orchestration"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <LLMOrchestration />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/exports"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Exports />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Billing routes */}
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkout/success" 
            element={
              <ProtectedRoute>
                <CheckoutSuccess />
              </ProtectedRoute>
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
        <SonnerToaster position="top-center" richColors />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
