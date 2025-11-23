import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface LLMPromptControlsProps {
  llmMode: 'deterministic' | 'generative'
  temperature: number
  onModeChange: (mode: 'deterministic' | 'generative') => void
  onTemperatureChange: (temperature: number) => void
  className?: string
}

export function LLMPromptControls({
  llmMode,
  temperature,
  onModeChange,
  onTemperatureChange,
  className,
}: LLMPromptControlsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="h-5 w-5 text-[#60A5FA]" />
          LLM Prompt Controls
        </CardTitle>
        <CardDescription>
          Adjust settings to test different conversational dynamics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="llm-mode" className="text-[#F3F4F6]">
              Mode
            </Label>
            <p className="text-xs text-[#A1A1AA]">
              {llmMode === 'deterministic'
                ? 'Low temperature with explicit question templates'
                : 'Higher temperature for more creative responses'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                llmMode === 'deterministic'
                  ? "text-[#F3F4F6]"
                  : "text-[#A1A1AA]"
              )}
            >
              Deterministic
            </span>
            <Switch
              id="llm-mode"
              checked={llmMode === 'generative'}
              onCheckedChange={(checked) =>
                onModeChange(checked ? 'generative' : 'deterministic')
              }
            />
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                llmMode === 'generative'
                  ? "text-[#F3F4F6]"
                  : "text-[#A1A1AA]"
              )}
            >
              Generative
            </span>
          </div>
        </div>

        {/* Temperature Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="temperature" className="text-[#F3F4F6]">
              Temperature
            </Label>
            <span className="text-sm text-[#A1A1AA]">{temperature.toFixed(2)}</span>
          </div>
          <div className="space-y-2">
            <Input
              id="temperature"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#24262C] rounded-lg appearance-none cursor-pointer accent-[#60A5FA]"
            />
            <div className="flex justify-between text-xs text-[#A1A1AA]">
              <span>0.0 (Focused)</span>
              <span>1.0 (Balanced)</span>
              <span>2.0 (Creative)</span>
            </div>
          </div>
          <p className="text-xs text-[#A1A1AA]">
            Lower values produce more focused responses. Higher values allow more creativity.
          </p>
        </div>

        {/* Mode Info */}
        <div className="p-3 rounded-lg bg-[#24262C] border border-[#303136]">
          <p className="text-xs text-[#A1A1AA]">
            <strong className="text-[#F3F4F6]">Current Mode:</strong>{" "}
            {llmMode === 'deterministic'
              ? 'Deterministic mode uses low temperature (0.0-0.3) with explicit question templates for consistent, predictable responses.'
              : 'Generative mode uses your temperature setting for more varied and creative conversational responses.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
