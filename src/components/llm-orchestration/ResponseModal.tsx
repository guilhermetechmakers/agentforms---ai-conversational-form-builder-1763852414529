import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useResponse } from "@/hooks/useLLMOrchestration"
import { Loader2, Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface ResponseModalProps {
  responseId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResponseModal({ responseId, open, onOpenChange }: ResponseModalProps) {
  const { data: response, isLoading } = useResponse(responseId || "")
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    if (!response) return
    await navigator.clipboard.writeText(response.response_text)
    setCopied(true)
    toast.success("Response copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  if (!responseId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>LLM Response</DialogTitle>
          <DialogDescription>
            Detailed view of the LLM response and metadata
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#60A5FA]" />
          </div>
        ) : response ? (
          <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
            <div className="space-y-6">
              {/* Metadata */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-[#24262C] text-[#F3F4F6] border-[#303136]">
                  Provider: {response.llm_provider}
                </Badge>
                {response.model_name && (
                  <Badge variant="outline" className="bg-[#24262C] text-[#F3F4F6] border-[#303136]">
                    Model: {response.model_name}
                  </Badge>
                )}
                {response.cached_flag && (
                  <Badge className="bg-[#4ADE80] text-[#22242A]">
                    Cached
                  </Badge>
                )}
                {response.deterministic_mode && (
                  <Badge variant="outline" className="bg-[#24262C] text-[#F3F4F6] border-[#303136]">
                    Deterministic
                  </Badge>
                )}
              </div>

              <Separator className="bg-[#303136]" />

              {/* Response Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#F3F4F6]">Response</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-8"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <Card className="bg-[#24262C] border-[#303136]">
                  <CardContent className="p-4">
                    <p className="text-sm text-[#F3F4F6] whitespace-pre-wrap">
                      {response.response_text}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Token Usage */}
              {(response.tokens_used || response.tokens_input || response.tokens_output) && (
                <>
                  <Separator className="bg-[#303136]" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-[#F3F4F6]">Token Usage</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {response.tokens_input && (
                        <div className="space-y-1">
                          <p className="text-sm text-[#A1A1AA]">Input Tokens</p>
                          <p className="text-lg font-semibold text-[#F3F4F6]">
                            {response.tokens_input.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {response.tokens_output && (
                        <div className="space-y-1">
                          <p className="text-sm text-[#A1A1AA]">Output Tokens</p>
                          <p className="text-lg font-semibold text-[#F3F4F6]">
                            {response.tokens_output.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {response.tokens_used && (
                        <div className="space-y-1">
                          <p className="text-sm text-[#A1A1AA]">Total Tokens</p>
                          <p className="text-lg font-semibold text-[#F3F4F6]">
                            {response.tokens_used.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Temperature */}
              {response.temperature && (
                <>
                  <Separator className="bg-[#303136]" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-[#F3F4F6]">Settings</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-[#A1A1AA]">Temperature</p>
                      <p className="text-lg font-semibold text-[#F3F4F6]">
                        {response.temperature}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Timestamps */}
              <Separator className="bg-[#303136]" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[#F3F4F6]">Timestamps</h3>
                <div className="space-y-1 text-sm text-[#A1A1AA]">
                  <p>Created: {new Date(response.created_at).toLocaleString()}</p>
                  <p>Updated: {new Date(response.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="py-12 text-center text-[#A1A1AA]">
            Response not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
