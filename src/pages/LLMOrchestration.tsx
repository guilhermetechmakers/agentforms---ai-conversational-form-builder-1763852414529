import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { PromptCreationForm } from "@/components/llm-orchestration/PromptCreationForm"
import { ResponseModal } from "@/components/llm-orchestration/ResponseModal"
import { UsageLogViewer } from "@/components/llm-orchestration/UsageLogViewer"
import { usePrompts, useResponses } from "@/hooks/useLLMOrchestration"
import { orchestrateLLM } from "@/lib/llm-orchestration"
import { useAgents } from "@/hooks/useAgents"
import { Loader2, Play, Eye } from "lucide-react"
import { toast } from "sonner"
import type { LLMProvider, LLMQueryOptions } from "@/types/llm-orchestration"

export function LLMOrchestration() {
  const [selectedAgentId, setSelectedAgentId] = useState<string>("")
  const [selectedPromptId, setSelectedPromptId] = useState<string>("")
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null)
  const [responseModalOpen, setResponseModalOpen] = useState(false)
  const [queryOptions, setQueryOptions] = useState<LLMQueryOptions>({
    provider: "openai",
    model: "gpt-4",
    temperature: 0.7,
    deterministic: false,
    useCache: true,
  })
  const [isQuerying, setIsQuerying] = useState(false)

  const { data: agentsData } = useAgents()
  const { data: promptsData } = usePrompts({ agent_id: selectedAgentId || undefined })
  const { data: responsesData } = useResponses({ prompt_id: selectedPromptId || undefined })

  const agents = agentsData?.agents || []
  const prompts = promptsData?.prompts || []
  const responses = responsesData?.responses || []

  const selectedAgent = agents.find(a => a.id === selectedAgentId)

  const handleQueryLLM = async () => {
    if (!selectedAgent) {
      toast.error("Please select an agent first")
      return
    }

    setIsQuerying(true)
    try {
      const result = await orchestrateLLM(
        {
          agentId: selectedAgent.id,
          persona: selectedAgent.persona || {},
          knowledge: selectedAgent.knowledge || {},
          schema: selectedAgent.schema,
          conversationHistory: [],
          remainingFields: [],
        },
        queryOptions
      )

      toast.success("LLM query completed successfully!")
      setSelectedResponseId(result.response.id)
      setResponseModalOpen(true)
    } catch (error) {
      toast.error(`Failed to query LLM: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsQuerying(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#F3F4F6]">LLM Orchestration</h1>
        <p className="text-[#A1A1AA]">
          Construct prompts, query LLMs, and track usage across your agents
        </p>
      </div>

      <Tabs defaultValue="orchestrate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="orchestrate">Orchestrate</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
          <TabsTrigger value="usage">Usage Logs</TabsTrigger>
        </TabsList>

        {/* Orchestrate Tab */}
        <TabsContent value="orchestrate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>
                  Configure agent and LLM query options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Agent Selection */}
                <div className="space-y-2">
                  <Label htmlFor="agent">Agent</Label>
                  <Select
                    value={selectedAgentId}
                    onValueChange={setSelectedAgentId}
                  >
                    <SelectTrigger id="agent">
                      <SelectValue placeholder="Select an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* LLM Provider */}
                <div className="space-y-2">
                  <Label htmlFor="provider">LLM Provider</Label>
                  <Select
                    value={queryOptions.provider || "openai"}
                    onValueChange={(value) =>
                      setQueryOptions({ ...queryOptions, provider: value as LLMProvider })
                    }
                  >
                    <SelectTrigger id="provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Model */}
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={queryOptions.model || "gpt-4"}
                    onChange={(e) =>
                      setQueryOptions({ ...queryOptions, model: e.target.value })
                    }
                    placeholder="e.g., gpt-4, claude-3-opus"
                  />
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="temperature">Temperature</Label>
                    <span className="text-sm text-[#A1A1AA]">{queryOptions.temperature || 0.7}</span>
                  </div>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={queryOptions.temperature || 0.7}
                    onChange={(e) =>
                      setQueryOptions({
                        ...queryOptions,
                        temperature: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                {/* Options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="deterministic">Deterministic Mode</Label>
                    <Switch
                      id="deterministic"
                      checked={queryOptions.deterministic || false}
                      onCheckedChange={(checked) =>
                        setQueryOptions({ ...queryOptions, deterministic: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="useCache">Use Cache</Label>
                    <Switch
                      id="useCache"
                      checked={queryOptions.useCache !== false}
                      onCheckedChange={(checked) =>
                        setQueryOptions({ ...queryOptions, useCache: checked })
                      }
                    />
                  </div>
                </div>

                {/* Query Button */}
                <Button
                  onClick={handleQueryLLM}
                  disabled={!selectedAgentId || isQuerying}
                  className="w-full bg-[#F6D365] hover:bg-[#F6D365]/90 text-[#22242A]"
                >
                  {isQuerying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Querying...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Query LLM
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Prompt Creation */}
            <PromptCreationForm
              agentId={selectedAgentId || undefined}
              defaultPersona={selectedAgent?.persona}
              defaultKnowledge={selectedAgent?.knowledge}
              defaultSchema={selectedAgent?.schema}
              onPromptCreated={(promptId) => {
                setSelectedPromptId(promptId)
                toast.success("Prompt created! Switch to Prompts tab to view.")
              }}
            />
          </div>
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prompts</CardTitle>
              <CardDescription>
                View and manage constructed prompts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prompts.length === 0 ? (
                <div className="py-12 text-center text-[#A1A1AA]">
                  No prompts found. Create one in the Orchestrate tab.
                </div>
              ) : (
                <div className="space-y-4">
                  {prompts.map((prompt) => (
                    <Card
                      key={prompt.id}
                      className="bg-[#24262C] border-[#303136] cursor-pointer hover:bg-[#282A30] transition-colors"
                      onClick={() => setSelectedPromptId(prompt.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <p className="text-sm text-[#A1A1AA]">
                              {new Date(prompt.created_at).toLocaleString()}
                            </p>
                            {prompt.prompt_text && (
                              <p className="text-sm text-[#F3F4F6] line-clamp-3">
                                {prompt.prompt_text.substring(0, 200)}...
                              </p>
                            )}
                          </div>
                          {selectedPromptId === prompt.id && (
                            <div className="ml-4 h-2 w-2 rounded-full bg-[#F6D365]" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Responses Tab */}
        <TabsContent value="responses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Responses</CardTitle>
              <CardDescription>
                View LLM responses for selected prompt
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedPromptId ? (
                <div className="py-12 text-center text-[#A1A1AA]">
                  Select a prompt to view responses
                </div>
              ) : responses.length === 0 ? (
                <div className="py-12 text-center text-[#A1A1AA]">
                  No responses found for this prompt
                </div>
              ) : (
                <div className="space-y-4">
                  {responses.map((response) => (
                    <Card
                      key={response.id}
                      className="bg-[#24262C] border-[#303136] cursor-pointer hover:bg-[#282A30] transition-colors"
                      onClick={() => {
                        setSelectedResponseId(response.id)
                        setResponseModalOpen(true)
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#F3F4F6]">
                                {response.llm_provider}
                              </span>
                              {response.model_name && (
                                <span className="text-xs text-[#A1A1AA]">
                                  {response.model_name}
                                </span>
                              )}
                              {response.cached_flag && (
                                <span className="text-xs bg-[#4ADE80] text-[#22242A] px-2 py-0.5 rounded">
                                  Cached
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[#A1A1AA]">
                              {new Date(response.created_at).toLocaleString()}
                            </p>
                            <p className="text-sm text-[#F3F4F6] line-clamp-2">
                              {response.response_text.substring(0, 150)}...
                            </p>
                            {response.tokens_used && (
                              <p className="text-xs text-[#A1A1AA]">
                                {response.tokens_used.toLocaleString()} tokens
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-4"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedResponseId(response.id)
                              setResponseModalOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Logs Tab */}
        <TabsContent value="usage" className="space-y-6">
          <UsageLogViewer agentId={selectedAgentId || undefined} />
        </TabsContent>
      </Tabs>

      {/* Response Modal */}
      <ResponseModal
        responseId={selectedResponseId}
        open={responseModalOpen}
        onOpenChange={setResponseModalOpen}
      />
    </div>
  )
}
