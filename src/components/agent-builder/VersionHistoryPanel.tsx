import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { History, Clock, GitBranch, Eye } from "lucide-react"
import { format } from "date-fns"
import { useAgentVersions, useVersionDiff } from "@/hooks/useAgentVersions"
import { cn } from "@/lib/utils"

interface VersionHistoryPanelProps {
  agentId: string
  currentVersion: number
}

export function VersionHistoryPanel({
  agentId,
  currentVersion,
}: VersionHistoryPanelProps) {
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const { data: versions, isLoading } = useAgentVersions(agentId)

  const selectedVersionData = versions?.find(
    (v) => v.version_number === selectedVersion
  )

  const diffQuery = useVersionDiff(
    agentId,
    selectedVersion || 0,
    currentVersion,
    !!selectedVersion && selectedVersion !== currentVersion
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
        >
          <History className="h-4 w-4 mr-2" />
          Version History
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#282A30] border-[#303136] text-[#F3F4F6] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Version History
          </DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            View and compare different versions of your agent configuration
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Version List */}
          <div className="w-80 flex-shrink-0 border-r border-[#303136] flex flex-col">
            <div className="p-4 border-b border-[#303136]">
              <h3 className="text-sm font-semibold text-[#F3F4F6] mb-2">
                Versions ({versions?.length || 0})
              </h3>
              <p className="text-xs text-[#A1A1AA]">
                Current: v{currentVersion}
              </p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-2">
                {isLoading ? (
                  <div className="text-center py-8 text-sm text-[#A1A1AA]">
                    Loading versions...
                  </div>
                ) : versions && versions.length > 0 ? (
                  versions.map((version) => (
                    <button
                      key={version.id}
                      onClick={() => setSelectedVersion(version.version_number)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all",
                        "bg-[#24262C] border-[#303136]",
                        "hover:bg-[#282A30] hover:border-[#60A5FA]",
                        selectedVersion === version.version_number &&
                          "bg-[#282A30] border-[#F6D365] border-l-4"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#F3F4F6]">
                            v{version.version_number}
                          </span>
                          {version.version_number === currentVersion && (
                            <Badge
                              variant="secondary"
                              className="bg-[#4ADE80] text-white text-xs"
                            >
                              Current
                            </Badge>
                          )}
                          {version.status === "published" && (
                            <Badge
                              variant="secondary"
                              className="bg-[#60A5FA] text-white text-xs"
                            >
                              Published
                            </Badge>
                          )}
                        </div>
                      </div>
                      {version.change_summary && (
                        <p className="text-xs text-[#A1A1AA] mb-2 line-clamp-2">
                          {version.change_summary}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(new Date(version.created_at), "MMM d, yyyy HH:mm")}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-[#A1A1AA]">
                      No version history yet
                    </p>
                    <p className="text-xs text-[#6B7280] mt-2">
                      Versions are created when you publish your agent
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Version Details */}
          <div className="flex-1 overflow-y-auto">
            {selectedVersion ? (
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#F3F4F6] mb-2">
                    Version {selectedVersion}
                  </h3>
                  {selectedVersionData && (
                    <div className="space-y-2 text-sm text-[#A1A1AA]">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          Created:{" "}
                          {format(
                            new Date(selectedVersionData.created_at),
                            "MMM d, yyyy 'at' HH:mm"
                          )}
                        </span>
                      </div>
                      {selectedVersionData.change_summary && (
                        <p className="text-[#F3F4F6]">
                          {selectedVersionData.change_summary}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {selectedVersion !== currentVersion && diffQuery.data && (
                  <Card className="bg-[#24262C] border-[#303136]">
                    <CardHeader>
                      <CardTitle className="text-sm text-[#F3F4F6]">
                        Changes from v{selectedVersion} to v{currentVersion}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full",
                              diffQuery.data.schema_changed
                                ? "bg-[#F6D365]"
                                : "bg-[#6B7280]"
                            )}
                          />
                          <span className="text-[#A1A1AA]">
                            Schema{" "}
                            {diffQuery.data.schema_changed
                              ? "changed"
                              : "unchanged"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full",
                              diffQuery.data.persona_changed
                                ? "bg-[#F6D365]"
                                : "bg-[#6B7280]"
                            )}
                          />
                          <span className="text-[#A1A1AA]">
                            Persona{" "}
                            {diffQuery.data.persona_changed
                              ? "changed"
                              : "unchanged"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full",
                              diffQuery.data.knowledge_changed
                                ? "bg-[#F6D365]"
                                : "bg-[#6B7280]"
                            )}
                          />
                          <span className="text-[#A1A1AA]">
                            Knowledge{" "}
                            {diffQuery.data.knowledge_changed
                              ? "changed"
                              : "unchanged"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full",
                              diffQuery.data.visuals_changed
                                ? "bg-[#F6D365]"
                                : "bg-[#6B7280]"
                            )}
                          />
                          <span className="text-[#A1A1AA]">
                            Visuals{" "}
                            {diffQuery.data.visuals_changed
                              ? "changed"
                              : "unchanged"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedVersion === currentVersion && (
                  <Card className="bg-[#24262C] border-[#303136]">
                    <CardContent className="p-4">
                      <p className="text-sm text-[#A1A1AA]">
                        This is the current version of your agent.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {selectedVersionData && (
                  <div className="space-y-4">
                    <Card className="bg-[#24262C] border-[#303136]">
                      <CardHeader>
                        <CardTitle className="text-sm text-[#F3F4F6]">
                          Configuration Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div>
                          <span className="text-[#A1A1AA]">Fields: </span>
                          <span className="text-[#F3F4F6]">
                            {selectedVersionData.schema?.fields?.length || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#A1A1AA]">Persona: </span>
                          <span className="text-[#F3F4F6]">
                            {selectedVersionData.persona?.name || "Not set"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#A1A1AA]">Knowledge: </span>
                          <span className="text-[#F3F4F6]">
                            {selectedVersionData.knowledge?.type === "file"
                              ? "File uploaded"
                              : selectedVersionData.knowledge?.content
                              ? `${selectedVersionData.knowledge.content.length} characters`
                              : "Not set"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Eye className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
                  <p className="text-sm text-[#A1A1AA]">
                    Select a version to view details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
