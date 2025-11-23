import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Save, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { useAgent } from "@/hooks/useAgents"
import { useCreateTestSession } from "@/hooks/useTestSessions"
import { testSessionsApi } from "@/api/test-sessions"
import { SandboxChatWindow } from "@/components/sandbox/SandboxChatWindow"
import { SessionInspector } from "@/components/sandbox/SessionInspector"
import { LLMPromptControls } from "@/components/sandbox/LLMPromptControls"
import { ErrorValidationLog } from "@/components/sandbox/ErrorValidationLog"
import { SaveTestSessionDialog } from "@/components/sandbox/SaveTestSessionDialog"
import type { ConversationMessage, ValidationError, Suggestion } from "@/types/test-session"

// Simple UUID generator
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

export default function AgentSandbox() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Fetch agent data
  const { data: agent, isLoading: isLoadingAgent } = useAgent(id || "")

  // Local state for test session
  const [conversationLog, setConversationLog] = useState<ConversationMessage[]>([])
  const [collectedFields, setCollectedFields] = useState<Record<string, any>>({})
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [llmMode, setLlmMode] = useState<'deterministic' | 'generative'>('generative')
  const [temperature, setTemperature] = useState(0.7)
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)

  // Mutations
  const createTestSession = useCreateTestSession()

  // Initialize missing fields from agent schema
  useEffect(() => {
    if (agent?.schema?.fields) {
      const requiredFields = agent.schema.fields
        .filter((f: { required: boolean }) => f.required)
        .map((f: { key: string }) => f.key)
      setMissingFields(requiredFields)
    }
  }, [agent])

  // Simulate LLM response
  const simulateLLMResponse = useCallback(async (userMessage: string) => {
    setIsTyping(true)
    
    try {
      // Call the simulation API
      const result = await testSessionsApi.simulateMessage(
        id!,
        userMessage,
        conversationLog,
        llmMode,
        temperature
      )

      // Add user message to conversation
      const userMsg: ConversationMessage = {
        id: generateId(),
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      }

      // Add agent response
      const agentMsg: ConversationMessage = {
        id: generateId(),
        role: 'agent',
        content: result.response,
        timestamp: new Date().toISOString(),
        field_key: result.fieldKey || null,
      }

      // Update conversation log
      const newConversationLog = [...conversationLog, userMsg, agentMsg]
      setConversationLog(newConversationLog)

      // Update collected fields if a field was collected
      if (result.fieldKey && result.collectedValue !== undefined) {
        setCollectedFields(prev => ({
          ...prev,
          [result.fieldKey!]: result.collectedValue,
        }))
        
        // Remove from missing fields
        setMissingFields(prev => prev.filter(key => key !== result.fieldKey))
      }

      // Simulate validation errors and suggestions (in production, this would come from the backend)
      // For now, we'll generate some mock suggestions
      if (newConversationLog.length > 4) {
        setSuggestions([
          {
            type: 'persona',
            message: 'Consider making the welcome message more engaging to improve conversion rates.',
            actionable: true,
          },
          {
            type: 'schema',
            message: 'The email field validation could be more strict to catch common typos.',
            actionable: true,
            field_key: 'email',
          },
        ])
      }
    } catch (error) {
      toast.error(`Failed to get response: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setErrors(prev => [...prev, {
        type: 'llm',
        message: `Failed to get LLM response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      }])
    } finally {
      setIsTyping(false)
    }
  }, [id, conversationLog, llmMode, temperature])

  const handleSendMessage = (message: string) => {
    simulateLLMResponse(message)
  }

  const handleSaveSession = (name: string) => {
    if (!id) {
      toast.error("Agent ID is required")
      return
    }

    // user_id will be added by the API layer
    const testSessionData = {
      agent_id: id,
      name,
      conversation_log: conversationLog,
      collected_fields: collectedFields,
      missing_fields: missingFields,
      llm_mode: llmMode,
      temperature_setting: temperature,
      errors,
      suggestions,
    }

    createTestSession.mutate(testSessionData, {
      onSuccess: () => {
        setSaveDialogOpen(false)
        toast.success("Test session saved successfully!")
      },
    })
  }

  const handleReset = () => {
    setConversationLog([])
    setCollectedFields({})
    setErrors([])
    setSuggestions([])
    if (agent?.schema?.fields) {
      const requiredFields = agent.schema.fields
        .filter((f: { required: boolean }) => f.required)
        .map((f: { key: string }) => f.key)
      setMissingFields(requiredFields)
    }
    toast.success("Test session reset")
  }

  if (isLoadingAgent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[#A1A1AA]">Loading agent...</div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-[#F3F4F6] text-lg">Agent not found</div>
        <Button
          onClick={() => navigate("/dashboard")}
          className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
        >
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#22242A]">
      {/* Header */}
      <div className="border-b border-[#303136] bg-[#282A30] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/dashboard/agents/${id}`)}
              className="text-[#A1A1AA] hover:text-[#F3F4F6] hover:bg-[#24262C]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Agent
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-[#F3F4F6]">
                Agent Sandbox / Test
              </h1>
              <p className="text-sm text-[#A1A1AA]">
                Testing: {agent.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={() => setSaveDialogOpen(true)}
              className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90 hover:scale-[1.02] transition-all"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Test Session
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-4 p-6">
        {/* Left Column: Chat Window */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <SandboxChatWindow
              messages={conversationLog}
              agentName={agent.name}
              agentAvatarUrl={agent.visuals?.avatar_url}
              isTyping={isTyping}
              onSendMessage={handleSendMessage}
              disabled={isTyping}
            />
          </Card>
        </div>

        {/* Right Column: Inspector and Controls */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          {/* Session Inspector */}
          <SessionInspector
            collectedFields={collectedFields}
            missingFields={missingFields}
            agentFields={agent.schema?.fields || []}
            conversationLog={conversationLog.map(msg => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp,
            }))}
          />

          {/* LLM Prompt Controls */}
          <LLMPromptControls
            llmMode={llmMode}
            temperature={temperature}
            onModeChange={setLlmMode}
            onTemperatureChange={setTemperature}
          />
        </div>
      </div>

      {/* Bottom: Error & Validation Log */}
      <div className="border-t border-[#303136] bg-[#282A30] p-6">
        <ErrorValidationLog errors={errors} suggestions={suggestions} />
      </div>

      {/* Save Dialog */}
      <SaveTestSessionDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={handleSaveSession}
        isLoading={createTestSession.isPending}
      />
    </div>
  )
}
