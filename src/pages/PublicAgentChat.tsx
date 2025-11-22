import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAgentBySlug, useCreateSession, useSession, useSendMessage, useCreateVisitor } from "@/hooks/usePublicChat"
import { WelcomeBanner } from "@/components/chat/WelcomeBanner"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { MessageInput } from "@/components/chat/MessageInput"
import { SessionProgressIndicator } from "@/components/chat/SessionProgressIndicator"
import { MinimizedBrandingFooter } from "@/components/chat/MinimizedBrandingFooter"
import { SessionEndScreen } from "@/components/chat/SessionEndScreen"
import { ConsentForm } from "@/components/chat/ConsentForm"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function PublicAgentChat() {
  const { agentSlug } = useParams<{ agentSlug: string }>()
  const navigate = useNavigate()

  // State
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [visitorId, setVisitorId] = useState<string | null>(null)
  const [consentGiven, setConsentGiven] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [showProgress, setShowProgress] = useState(true)
  const [isTyping, setIsTyping] = useState(false)

  // Mutations
  const createSessionMutation = useCreateSession()
  const sendMessageMutation = useSendMessage()
  const createVisitorMutation = useCreateVisitor()

  // Get or create visitor ID (stored in localStorage)
  useEffect(() => {
    const storedVisitorId = localStorage.getItem("agentforms_visitor_id")
    if (storedVisitorId) {
      setVisitorId(storedVisitorId)
    } else {
      // Create new visitor
      const initVisitor = async () => {
        try {
          const visitorData = await createVisitorMutation.mutateAsync({
            anonymous_id: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user_agent: navigator.userAgent,
            referrer: document.referrer || undefined,
          })
          if (visitorData?.id) {
            setVisitorId(visitorData.id)
            localStorage.setItem("agentforms_visitor_id", visitorData.id)
          }
        } catch (error) {
          console.error("Failed to create visitor:", error)
          // Fallback to local ID if API fails
          const fallbackId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          localStorage.setItem("agentforms_visitor_id", fallbackId)
          setVisitorId(fallbackId)
        }
      }
      initVisitor()
    }
  }, [createVisitorMutation])

  // Fetch agent
  const {
    data: agent,
    isLoading: agentLoading,
    error: agentError,
  } = useAgentBySlug(agentSlug || "", !!agentSlug)

  // Fetch session if we have one
  const {
    data: sessionData,
  } = useSession(sessionId || "", !!sessionId)

  // Check if consent is required
  const consentRequired = agent?.visuals?.welcome_message?.includes("consent") || false

  // Handle starting chat
  const handleStartChat = useCallback(async () => {
    if (!agent || !visitorId) {
      toast.error("Please wait while we initialize...")
      return
    }

    if (consentRequired && !consentGiven) {
      setShowConsentModal(true)
      return
    }

    try {
      const response = await createSessionMutation.mutateAsync({
        agent_id: agent.id,
        visitor_id: visitorId,
        consent_given: consentGiven,
        visitor_metadata: {
          ip_address: undefined, // Would be set server-side
          user_agent: navigator.userAgent,
          referrer: document.referrer || undefined,
          consent_given: consentGiven,
        },
      })

      setSessionId(response.session.id)
      // Store session ID in localStorage for persistence
      localStorage.setItem(`agentforms_session_${agent.id}`, response.session.id)
    } catch (error) {
      toast.error("Failed to start session. Please try again.")
      console.error("Create session error:", error)
    }
  }, [agent, visitorId, consentGiven, consentRequired, createSessionMutation])

  // Handle sending message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!sessionId) {
        toast.error("Session not initialized")
        return
      }

      setIsTyping(true)
      try {
        await sendMessageMutation.mutateAsync({
          session_id: sessionId,
          content,
        })
        // Simulate typing delay for agent response
        setTimeout(() => setIsTyping(false), 1000)
      } catch (error) {
        setIsTyping(false)
        toast.error("Failed to send message. Please try again.")
        console.error("Send message error:", error)
      }
    },
    [sessionId, sendMessageMutation]
  )

  // Handle quick select
  const handleQuickSelect = useCallback(
    (value: string) => {
      handleSendMessage(value)
    },
    [handleSendMessage]
  )

  // Check for existing session on mount
  useEffect(() => {
    if (agent?.id) {
      const storedSessionId = localStorage.getItem(`agentforms_session_${agent.id}`)
      if (storedSessionId) {
        setSessionId(storedSessionId)
      }
    }
  }, [agent?.id])

  // Loading state
  if (agentLoading) {
    return (
      <div className="min-h-screen bg-[#22242A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-[#F6D365] animate-spin mx-auto mb-4" />
          <p className="text-[#A1A1AA]">Loading agent...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (agentError || !agent) {
    return (
      <div className="min-h-screen bg-[#22242A] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#F3F4F6] mb-4">
            Agent Not Found
          </h1>
          <p className="text-[#A1A1AA] mb-6">
            The agent you're looking for doesn't exist or is no longer available.
          </p>
          <button
            onClick={() => navigate("/")}
            className="text-[#60A5FA] hover:underline"
          >
            Return to home
          </button>
        </div>
      </div>
    )
  }

  // Check if agent is published
  if (agent.status !== "published") {
    return (
      <div className="min-h-screen bg-[#22242A] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#F3F4F6] mb-4">
            Agent Not Available
          </h1>
          <p className="text-[#A1A1AA]">
            This agent is not yet published and cannot be accessed publicly.
          </p>
        </div>
      </div>
    )
  }

  const session = sessionData
  const messages = sessionData?.messages || []
  const fieldValues = sessionData?.field_values || []
  const isCompleted = session?.status === "completed"

  // Session end screen
  if (isCompleted && session && sessionData) {
    return (
      <div className="min-h-screen bg-[#22242A] flex flex-col">
        <SessionEndScreen
          session={sessionData}
          onDownload={() => {
            // TODO: Implement download functionality
            toast.info("Download feature coming soon")
          }}
        />
        <MinimizedBrandingFooter
          agent={agent}
          sessionUrl={window.location.href}
        />
      </div>
    )
  }

  // Main chat interface
  return (
    <div className="min-h-screen bg-[#22242A] flex flex-col">
      {/* Welcome Banner (shown before session starts) */}
      {!sessionId && (
        <WelcomeBanner
          agent={agent}
          consentRequired={consentRequired}
          consentGiven={consentGiven}
          onConsentChange={setConsentGiven}
          onStartChat={handleStartChat}
        />
      )}

      {/* Chat Interface (shown after session starts) */}
      {sessionId && (
        <>
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-h-0">
              <ChatWindow
                messages={messages}
                agentName={agent.name}
                agentAvatarUrl={agent.visuals?.avatar_url}
                isTyping={isTyping}
              />
              <MessageInput
                onSend={handleSendMessage}
                disabled={sendMessageMutation.isPending || !sessionId}
                isLoading={sendMessageMutation.isPending}
                placeholder="Type your message..."
                quickSelects={[]} // Could be populated from agent schema
                onQuickSelect={handleQuickSelect}
              />
            </div>

            {/* Progress Indicator Sidebar */}
            {showProgress && agent.schema?.fields && (
              <div className="hidden md:block w-80 border-l border-[#303136] p-4 overflow-y-auto">
                <SessionProgressIndicator
                  fields={agent.schema.fields}
                  fieldValues={fieldValues}
                  isCollapsed={false}
                  onToggle={() => setShowProgress(false)}
                />
              </div>
            )}
          </div>

          {/* Mobile Progress Toggle */}
          {showProgress && agent.schema?.fields && (
            <div className="md:hidden">
              <SessionProgressIndicator
                fields={agent.schema.fields}
                fieldValues={fieldValues}
                isCollapsed={true}
                onToggle={() => setShowProgress(!showProgress)}
              />
            </div>
          )}
        </>
      )}

      {/* Minimized Branding Footer */}
      <MinimizedBrandingFooter
        agent={agent}
        sessionUrl={window.location.href}
      />

      {/* Consent Modal */}
      <ConsentForm
        open={showConsentModal}
        onOpenChange={setShowConsentModal}
        consentGiven={consentGiven}
        onConsentChange={setConsentGiven}
        onAccept={() => {
          setShowConsentModal(false)
          handleStartChat()
        }}
        agentName={agent.name}
      />
    </div>
  )
}
