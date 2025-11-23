import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Upload, FileText, X } from "lucide-react"
import type { KnowledgeBase } from "@/types/agent"

interface KnowledgeInputSectionProps {
  knowledge: KnowledgeBase
  onUpdateKnowledge: (updates: Partial<KnowledgeBase>) => void
}

export function KnowledgeInputSection({
  knowledge,
  onUpdateKnowledge,
}: KnowledgeInputSectionProps) {
  const [file, setFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // In a real implementation, you would upload the file to Supabase Storage
      // For now, we'll just store the file name
      onUpdateKnowledge({
        type: 'file',
        file_url: selectedFile.name, // This would be the actual URL after upload
      })
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    onUpdateKnowledge({
      type: 'text',
      file_url: undefined,
    })
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[#282A30] border-[#303136]">
        <CardHeader>
          <CardTitle className="text-[#F3F4F6]">Knowledge Base</CardTitle>
          <CardDescription className="text-[#A1A1AA]">
            Provide context and information for your agent to reference during conversations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[#F3F4F6]">Input Method</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={knowledge.type === 'text' ? 'default' : 'outline'}
                onClick={() => onUpdateKnowledge({ type: 'text' })}
                className={
                  knowledge.type === 'text'
                    ? 'bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90'
                    : 'border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]'
                }
              >
                <FileText className="h-4 w-4 mr-2" />
                Text Input
              </Button>
              <Button
                type="button"
                variant={knowledge.type === 'file' ? 'default' : 'outline'}
                onClick={() => onUpdateKnowledge({ type: 'file' })}
                className={
                  knowledge.type === 'file'
                    ? 'bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90'
                    : 'border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]'
                }
              >
                <Upload className="h-4 w-4 mr-2" />
                File Upload
              </Button>
            </div>
          </div>

          {knowledge.type === 'text' ? (
            <div className="space-y-2">
              <Label htmlFor="knowledge-content" className="text-[#F3F4F6]">
                Knowledge Content
              </Label>
              <Textarea
                id="knowledge-content"
                value={knowledge.content || ''}
                onChange={(e) => onUpdateKnowledge({ content: e.target.value || undefined })}
                placeholder="Paste or type information that your agent should know. This could include company policies, product information, FAQs, or any other relevant context..."
                className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA] min-h-[200px] font-mono text-sm"
              />
              <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
                <span>
                  {knowledge.content?.length || 0} characters
                </span>
                <span>
                  {(knowledge.content?.length || 0) > 10000 && (
                    <span className="text-[#FBBF24]">
                      Large content may take longer to process
                    </span>
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-[#F3F4F6]">Upload File</Label>
              {file ? (
                <div className="p-4 bg-[#24262C] rounded-lg border border-[#303136]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#60A5FA]" />
                      <div>
                        <p className="text-sm text-[#F3F4F6]">{file.name}</p>
                        <p className="text-xs text-[#A1A1AA]">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      className="h-8 w-8 text-[#A1A1AA] hover:text-[#F87171]"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#303136] rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-sm text-[#F3F4F6] hover:text-[#60A5FA]">
                      Click to upload
                    </span>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".txt,.md,.pdf,.doc,.docx"
                      onChange={handleFileSelect}
                    />
                  </Label>
                  <p className="text-xs text-[#A1A1AA] mt-2">
                    Supports: TXT, MD, PDF, DOC, DOCX (Max 10MB)
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-[#24262C] rounded-lg border border-[#303136]">
            <div>
              <Label htmlFor="embeddings-enabled" className="text-[#F3F4F6] cursor-pointer">
                Enable Embeddings
              </Label>
              <p className="text-xs text-[#A1A1AA] mt-1">
                Use vector embeddings for better context retrieval (recommended for large knowledge bases)
              </p>
            </div>
            <Switch
              id="embeddings-enabled"
              checked={knowledge.embeddings_enabled || false}
              onCheckedChange={(checked) =>
                onUpdateKnowledge({ embeddings_enabled: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
