import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, FileJson, Calendar, Filter } from "lucide-react"
import { useAgents } from "@/hooks/useAgents"
import type { ExportDataType, ExportFormat } from "@/types/export"

const exportFormSchema = z.object({
  data_type: z.enum(["sessions", "agents", "all"]),
  format: z.enum(["csv", "json"]),
  agent_ids: z.array(z.string()).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  status: z.enum(["in-progress", "completed", "abandoned", "all"]).optional(),
})

type ExportFormValues = z.infer<typeof exportFormSchema>

interface ExportConfigurationFormProps {
  onSubmit: (values: ExportFormValues) => void
  onCancel?: () => void
  isLoading?: boolean
}

export function ExportConfigurationForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: ExportConfigurationFormProps) {
  const { data: agentsData } = useAgents({ status: "all" })
  const agents = agentsData?.agents || []

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ExportFormValues>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      data_type: "sessions",
      format: "csv",
      agent_ids: [],
      status: "all",
    },
  })

  const dataType = watch("data_type")
  const format = watch("format")
  const agentIds = watch("agent_ids") || []
  const showFilters = dataType === "sessions" || dataType === "all"

  const handleFormSubmit = (values: ExportFormValues) => {
    onSubmit(values)
  }

  const toggleAgent = (agentId: string) => {
    const current = agentIds
    if (current.includes(agentId)) {
      setValue("agent_ids", current.filter((id) => id !== agentId))
    } else {
      setValue("agent_ids", [...current, agentId])
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Data Type Selection */}
      <div className="space-y-2">
        <Label className="text-[#F3F4F6]">Data Type</Label>
        <p className="text-sm text-[#A1A1AA]">Select what data you want to export</p>
        <RadioGroup
          value={dataType}
          onValueChange={(value) => setValue("data_type", value as ExportDataType)}
          className="grid grid-cols-1 gap-3 mt-2"
        >
          <div className="flex items-center space-x-2 p-4 rounded-lg border border-[#303136] hover:bg-[#282A30] transition-colors cursor-pointer">
            <RadioGroupItem value="sessions" id="sessions" className="text-[#F6D365]" />
            <Label htmlFor="sessions" className="flex-1 cursor-pointer text-[#F3F4F6]">
              <div>
                <p className="font-medium">Sessions</p>
                <p className="text-sm text-[#A1A1AA]">Export session data and conversations</p>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-4 rounded-lg border border-[#303136] hover:bg-[#282A30] transition-colors cursor-pointer">
            <RadioGroupItem value="agents" id="agents" className="text-[#F6D365]" />
            <Label htmlFor="agents" className="flex-1 cursor-pointer text-[#F3F4F6]">
              <div>
                <p className="font-medium">Agents</p>
                <p className="text-sm text-[#A1A1AA]">Export agent configurations</p>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-4 rounded-lg border border-[#303136] hover:bg-[#282A30] transition-colors cursor-pointer">
            <RadioGroupItem value="all" id="all" className="text-[#F6D365]" />
            <Label htmlFor="all" className="flex-1 cursor-pointer text-[#F3F4F6]">
              <div>
                <p className="font-medium">All Data</p>
                <p className="text-sm text-[#A1A1AA]">Export both sessions and agents</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
        {errors.data_type && (
          <p className="text-sm text-[#F87171]">{errors.data_type.message}</p>
        )}
      </div>

      {/* Format Selection */}
      <div className="space-y-2">
        <Label className="text-[#F3F4F6]">Export Format</Label>
        <p className="text-sm text-[#A1A1AA]">Choose your preferred file format</p>
        <RadioGroup
          value={format}
          onValueChange={(value) => setValue("format", value as ExportFormat)}
          className="grid grid-cols-2 gap-3 mt-2"
        >
          <div className="flex items-center space-x-2 p-4 rounded-lg border border-[#303136] hover:bg-[#282A30] transition-colors cursor-pointer">
            <RadioGroupItem value="csv" id="csv" className="text-[#F6D365]" />
            <Label htmlFor="csv" className="flex-1 cursor-pointer flex items-center gap-2 text-[#F3F4F6]">
              <FileText className="h-4 w-4 text-[#A1A1AA]" />
              <div>
                <p className="font-medium">CSV</p>
                <p className="text-sm text-[#A1A1AA]">Spreadsheet format</p>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-4 rounded-lg border border-[#303136] hover:bg-[#282A30] transition-colors cursor-pointer">
            <RadioGroupItem value="json" id="json" className="text-[#F6D365]" />
            <Label htmlFor="json" className="flex-1 cursor-pointer flex items-center gap-2 text-[#F3F4F6]">
              <FileJson className="h-4 w-4 text-[#A1A1AA]" />
              <div>
                <p className="font-medium">JSON</p>
                <p className="text-sm text-[#A1A1AA]">Complete data</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
        {errors.format && <p className="text-sm text-[#F87171]">{errors.format.message}</p>}
      </div>

      {/* Filters (only for sessions) */}
      {showFilters && (
        <div className="space-y-4 p-4 rounded-lg border border-[#303136] bg-[#24262C]">
          <div className="flex items-center gap-2 text-[#F3F4F6]">
            <Filter className="h-4 w-4 text-[#A1A1AA]" />
            <h3 className="font-semibold">Filters</h3>
          </div>

          {/* Agent Filter */}
          {agents.length > 0 && (
            <div className="space-y-2">
              <Label className="text-[#F3F4F6]">Agents</Label>
              <p className="text-sm text-[#A1A1AA] mb-2">
                Select specific agents (leave empty for all)
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`agent-${agent.id}`}
                      checked={agentIds.includes(agent.id)}
                      onCheckedChange={() => toggleAgent(agent.id)}
                      className="border-[#303136] data-[state=checked]:bg-[#F6D365] data-[state=checked]:border-[#F6D365]"
                    />
                    <Label
                      htmlFor={`agent-${agent.id}`}
                      className="text-[#F3F4F6] font-normal cursor-pointer"
                    >
                      {agent.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#F3F4F6] flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#A1A1AA]" />
                From Date
              </Label>
              <Input
                type="date"
                {...register("date_from")}
                className="bg-[#282A30] border-[#303136] text-[#F3F4F6]"
              />
              {errors.date_from && (
                <p className="text-sm text-[#F87171]">{errors.date_from.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-[#F3F4F6] flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#A1A1AA]" />
                To Date
              </Label>
              <Input
                type="date"
                {...register("date_to")}
                className="bg-[#282A30] border-[#303136] text-[#F3F4F6]"
              />
              {errors.date_to && (
                <p className="text-sm text-[#F87171]">{errors.date_to.message}</p>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-[#F3F4F6]">Status</Label>
            <Select
              value={watch("status") || "all"}
              onValueChange={(value) => setValue("status", value as any)}
            >
              <SelectTrigger className="bg-[#282A30] border-[#303136] text-[#F3F4F6]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-[#F87171]">{errors.status.message}</p>}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="text-[#A1A1AA] border-[#303136] hover:bg-[#282A30]"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
        >
          {isLoading ? "Creating Export..." : "Create Export"}
        </Button>
      </div>
    </form>
  )
}
