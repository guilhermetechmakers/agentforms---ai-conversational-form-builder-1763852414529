import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useUsageLogs, useUsageSummary } from "@/hooks/useLLMOrchestration"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import type { LLMProvider } from "@/types/llm-orchestration"

interface UsageLogViewerProps {
  agentId?: string
  provider?: LLMProvider
  startDate?: string
  endDate?: string
}

export function UsageLogViewer({
  agentId,
  provider,
  startDate,
  endDate,
}: UsageLogViewerProps) {
  const { data: logsData, isLoading: logsLoading } = useUsageLogs({
    agent_id: agentId,
    llm_provider: provider,
    start_date: startDate,
    end_date: endDate,
    pageSize: 50,
  })

  const { data: summary, isLoading: summaryLoading } = useUsageSummary(agentId)

  if (logsLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#60A5FA]" />
      </div>
    )
  }

  const logs = logsData?.logs || []

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#282A30] border-[#303136]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[#A1A1AA]">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#F3F4F6]">
                {summary.total_requests.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#282A30] border-[#303136]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[#A1A1AA]">Total Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#F3F4F6]">
                {summary.total_tokens.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#282A30] border-[#303136]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[#A1A1AA]">Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#F3F4F6]">
                ${summary.total_cost.toFixed(4)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#282A30] border-[#303136]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-[#A1A1AA]">Cache Hit Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#F3F4F6]">
                {summary.cache_hit_rate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Usage Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Logs</CardTitle>
          <CardDescription>
            Detailed log of all LLM queries and their usage metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="py-12 text-center text-[#A1A1AA]">
              No usage logs found
            </div>
          ) : (
            <div className="rounded-lg border border-[#303136] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#24262C] hover:bg-[#24262C]">
                    <TableHead className="text-[#A1A1AA]">Date</TableHead>
                    <TableHead className="text-[#A1A1AA]">Provider</TableHead>
                    <TableHead className="text-[#A1A1AA]">Model</TableHead>
                    <TableHead className="text-[#A1A1AA]">Tokens</TableHead>
                    <TableHead className="text-[#A1A1AA]">Cost</TableHead>
                    <TableHead className="text-[#A1A1AA]">Response Time</TableHead>
                    <TableHead className="text-[#A1A1AA]">Cache</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="border-[#303136] hover:bg-[#24262C] transition-colors"
                    >
                      <TableCell className="text-[#F3F4F6]">
                        {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-[#24262C] text-[#F3F4F6] border-[#303136]">
                          {log.llm_provider}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#F3F4F6]">
                        {log.model_name || "N/A"}
                      </TableCell>
                      <TableCell className="text-[#F3F4F6]">
                        {log.tokens_used.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-[#F3F4F6]">
                        ${log.cost.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-[#F3F4F6]">
                        {log.response_time_ms ? `${log.response_time_ms}ms` : "N/A"}
                      </TableCell>
                      <TableCell>
                        {log.cache_hit ? (
                          <Badge className="bg-[#4ADE80] text-[#22242A]">
                            Hit
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-[#24262C] text-[#A1A1AA] border-[#303136]">
                            Miss
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
