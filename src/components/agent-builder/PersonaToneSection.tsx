import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Persona } from "@/types/agent"

interface PersonaToneSectionProps {
  persona: Persona
  onUpdatePersona: (updates: Partial<Persona>) => void
}

const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'supportive', label: 'Supportive' },
  { value: 'conversational', label: 'Conversational' },
]

export function PersonaToneSection({
  persona,
  onUpdatePersona,
}: PersonaToneSectionProps) {
  return (
    <div className="space-y-4">
      <Card className="bg-[#282A30] border-[#303136]">
        <CardHeader>
          <CardTitle className="text-[#F3F4F6]">Persona & Tone</CardTitle>
          <CardDescription className="text-[#A1A1AA]">
            Define how your agent communicates with visitors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="persona-name" className="text-[#F3F4F6]">
              Agent Name
            </Label>
            <Input
              id="persona-name"
              value={persona.name || ''}
              onChange={(e) => onUpdatePersona({ name: e.target.value || undefined })}
              placeholder="e.g., Sarah, Support Bot, Assistant"
              className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA]"
            />
            <p className="text-xs text-[#A1A1AA]">
              The name visitors will see when chatting with your agent
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="persona-tone" className="text-[#F3F4F6]">
              Communication Tone
            </Label>
            <Select
              value={persona.tone || 'friendly'}
              onValueChange={(value) => onUpdatePersona({ tone: value })}
            >
              <SelectTrigger className="bg-[#24262C] border-[#303136] text-[#F3F4F6] focus:ring-[#60A5FA]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-[#A1A1AA]">
              Select the overall tone for agent interactions
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="persona-instructions" className="text-[#F3F4F6]">
              Custom Instructions
            </Label>
            <Textarea
              id="persona-instructions"
              value={persona.instructions || ''}
              onChange={(e) => onUpdatePersona({ instructions: e.target.value || undefined })}
              placeholder="e.g., Always be concise, use emojis sparingly, ask follow-up questions when needed..."
              className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA] min-h-[120px]"
            />
            <p className="text-xs text-[#A1A1AA]">
              Additional instructions for how the agent should behave
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcome-message" className="text-[#F3F4F6]">
              Welcome Message
            </Label>
            <Textarea
              id="welcome-message"
              value={persona.welcome_message || ''}
              onChange={(e) => onUpdatePersona({ welcome_message: e.target.value || undefined })}
              placeholder="e.g., Hi! I'm here to help you. Let's get started..."
              className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA] min-h-[80px]"
            />
            <p className="text-xs text-[#A1A1AA]">
              The first message visitors will see when starting a conversation
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
