import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreatePrompt } from "@/hooks/useLLMOrchestration"
import { constructPrompt } from "@/lib/llm-orchestration"
import type { Persona, KnowledgeBase, AgentSchema } from "@/types/agent"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"

const promptFormSchema = z.object({
  persona_name: z.string().optional(),
  persona_tone: z.string().optional(),
  persona_instructions: z.string().optional(),
  knowledge_content: z.string().optional(),
  schema_json: z.string().optional(),
})

type PromptFormValues = z.infer<typeof promptFormSchema>

interface PromptCreationFormProps {
  agentId?: string
  defaultPersona?: Persona
  defaultKnowledge?: KnowledgeBase
  defaultSchema?: AgentSchema
  onPromptCreated?: (promptId: string) => void
}

export function PromptCreationForm({
  agentId,
  defaultPersona,
  defaultKnowledge,
  defaultSchema,
  onPromptCreated,
}: PromptCreationFormProps) {
  const [preview, setPreview] = useState<string>("")
  const createPrompt = useCreatePrompt()

  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: {
      persona_name: defaultPersona?.name || "",
      persona_tone: defaultPersona?.tone || "",
      persona_instructions: defaultPersona?.instructions || "",
      knowledge_content: defaultKnowledge?.content || "",
      schema_json: defaultSchema ? JSON.stringify(defaultSchema, null, 2) : "",
    },
  })

  const generatePreview = () => {
    try {
      const persona: Persona = {
        name: form.watch("persona_name") || undefined,
        tone: form.watch("persona_tone") || undefined,
        instructions: form.watch("persona_instructions") || undefined,
      }

      const knowledge: KnowledgeBase = {
        type: "text",
        content: form.watch("knowledge_content") || undefined,
      }

      const schema: AgentSchema = form.watch("schema_json")
        ? JSON.parse(form.watch("schema_json") || "{}")
        : { fields: [] }

      const constructed = constructPrompt({
        agentId,
        persona,
        knowledge,
        schema,
      })

      setPreview(constructed)
    } catch (error) {
      setPreview(`Error: ${error instanceof Error ? error.message : "Invalid JSON"}`)
    }
  }

  const onSubmit = async (data: PromptFormValues) => {
    try {
      const persona: Persona = {
        name: data.persona_name || undefined,
        tone: data.persona_tone || undefined,
        instructions: data.persona_instructions || undefined,
      }

      const knowledge: KnowledgeBase = {
        type: "text",
        content: data.knowledge_content || undefined,
      }

      const schema: AgentSchema = data.schema_json
        ? JSON.parse(data.schema_json)
        : { fields: [] }

      const promptText = constructPrompt({
        agentId,
        persona,
        knowledge,
        schema,
      })

      const prompt = await createPrompt.mutateAsync({
        agent_id: agentId || null,
        persona_data: persona,
        knowledge_data: knowledge,
        schema_data: schema,
        prompt_text: promptText,
        conversation_history: [],
        remaining_fields: [],
      })

      onPromptCreated?.(prompt.id)
    } catch (error) {
      console.error("Failed to create prompt:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Prompt</CardTitle>
        <CardDescription>
          Construct a prompt by combining persona, knowledge, and schema data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Persona Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#F3F4F6]">Persona</h3>
            <div className="space-y-2">
              <Label htmlFor="persona_name">Name</Label>
              <Input
                id="persona_name"
                {...form.register("persona_name")}
                placeholder="e.g., Customer Support Agent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="persona_tone">Tone</Label>
              <Input
                id="persona_tone"
                {...form.register("persona_tone")}
                placeholder="e.g., friendly, professional, casual"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="persona_instructions">Instructions</Label>
              <Textarea
                id="persona_instructions"
                {...form.register("persona_instructions")}
                placeholder="Additional instructions for the agent..."
                rows={4}
              />
            </div>
          </div>

          {/* Knowledge Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#F3F4F6]">Knowledge Base</h3>
            <div className="space-y-2">
              <Label htmlFor="knowledge_content">Content</Label>
              <Textarea
                id="knowledge_content"
                {...form.register("knowledge_content")}
                placeholder="Paste knowledge base content here..."
                rows={6}
              />
            </div>
          </div>

          {/* Schema Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#F3F4F6]">Schema</h3>
            <div className="space-y-2">
              <Label htmlFor="schema_json">Schema JSON</Label>
              <Textarea
                id="schema_json"
                {...form.register("schema_json")}
                placeholder='{"fields": [...]}'
                rows={8}
                className="font-mono text-xs"
              />
            </div>
          </div>

          {/* Preview Section */}
          {preview && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#F3F4F6]">Preview</h3>
              <Card className="bg-[#24262C]">
                <CardContent className="p-4">
                  <ScrollArea className="h-64">
                    <pre className="text-sm text-[#A1A1AA] whitespace-pre-wrap font-mono">
                      {preview}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={generatePreview}
              disabled={createPrompt.isPending}
            >
              Generate Preview
            </Button>
            <Button
              type="submit"
              disabled={createPrompt.isPending}
              className="bg-[#F6D365] hover:bg-[#F6D365]/90 text-[#22242A]"
            >
              {createPrompt.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Prompt
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
