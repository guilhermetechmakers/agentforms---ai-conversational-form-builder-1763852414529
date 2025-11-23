import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Calendar, Plus, FileText } from "lucide-react"
import { ExportConfigurationForm } from "@/components/exports/ExportConfigurationForm"
import { ExportConfirmationModal } from "@/components/exports/ExportConfirmationModal"
import { ExportHistoryTable } from "@/components/exports/ExportHistoryTable"
import { ScheduleSetupDialog } from "@/components/exports/ScheduleSetupDialog"
import { useCreateExport, useExportSchedules, useCreateExportSchedule } from "@/hooks/useExports"
import type { ExportDataType, ExportFormat } from "@/types/export"

export default function Exports() {
  const [activeTab, setActiveTab] = useState<"on-demand" | "scheduled" | "history">("on-demand")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [exportConfig, setExportConfig] = useState<{
    data_type: ExportDataType
    format: ExportFormat
    filters?: any
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const createExport = useCreateExport()
  const { data: schedulesData } = useExportSchedules()
  const createSchedule = useCreateExportSchedule()

  const schedules = schedulesData?.schedules || []

  const handleExportSubmit = (values: any) => {
    setExportConfig({
      data_type: values.data_type,
      format: values.format,
      filters: {
        agent_ids: values.agent_ids?.length > 0 ? values.agent_ids : undefined,
        date_from: values.date_from,
        date_to: values.date_to,
        status: values.status !== "all" ? values.status : undefined,
      },
    })
    setShowConfirmation(true)
  }

  const handleConfirmExport = async () => {
    if (!exportConfig) return

    try {
      await createExport.mutateAsync({
        data_type: exportConfig.data_type,
        format: exportConfig.format,
        filters: exportConfig.filters,
      })
      setShowConfirmation(false)
      setExportConfig(null)
      setActiveTab("history")
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleScheduleSubmit = async (values: any) => {
    try {
      await createSchedule.mutateAsync({
        name: values.name,
        description: values.description,
        enabled: values.enabled,
        data_type: values.data_type,
        format: values.format,
        filters: {},
        frequency: values.frequency,
        frequency_config: {
          hour: values.hour,
          minute: values.minute,
        },
        delivery_method: values.delivery_method,
        webhook_url: values.webhook_url || undefined,
        webhook_headers: {},
        webhook_auth_type: undefined,
        webhook_auth_config: {},
      })
      setShowScheduleDialog(false)
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F3F4F6]">Exports & Data Delivery</h1>
          <p className="text-[#A1A1AA] mt-2">
            Export your session and agent data in CSV or JSON format
          </p>
        </div>
        <Button
          onClick={() => setShowScheduleDialog(true)}
          className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Schedule
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="bg-[#24262C] border border-[#303136]">
          <TabsTrigger value="on-demand" className="data-[state=active]:bg-[#282A30]">
            <Download className="h-4 w-4 mr-2" />
            On-Demand Export
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="data-[state=active]:bg-[#282A30]">
            <Calendar className="h-4 w-4 mr-2" />
            Scheduled Exports
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-[#282A30]">
            <FileText className="h-4 w-4 mr-2" />
            Export History
          </TabsTrigger>
        </TabsList>

        {/* On-Demand Export Tab */}
        <TabsContent value="on-demand" className="space-y-6 mt-6">
          <Card className="bg-[#24262C] border-[#303136]">
            <CardHeader>
              <CardTitle className="text-[#F3F4F6]">Create Export</CardTitle>
              <CardDescription className="text-[#A1A1AA]">
                Configure and generate an export of your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExportConfigurationForm
                onSubmit={handleExportSubmit}
                isLoading={createExport.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Exports Tab */}
        <TabsContent value="scheduled" className="space-y-6 mt-6">
          <Card className="bg-[#24262C] border-[#303136]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#F3F4F6]">Scheduled Exports</CardTitle>
                  <CardDescription className="text-[#A1A1AA]">
                    Manage your recurring export schedules
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowScheduleDialog(true)}
                  size="sm"
                  className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-[#6B7280] mx-auto mb-4" />
                  <p className="text-[#A1A1AA] text-lg font-medium mb-2">No schedules yet</p>
                  <p className="text-[#6B7280] text-sm mb-4">
                    Create a schedule to automatically export your data
                  </p>
                  <Button
                    onClick={() => setShowScheduleDialog(true)}
                    className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Schedule
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-4 rounded-lg border border-[#303136] bg-[#282A30] hover:bg-[#24262C] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-[#F3F4F6]">{schedule.name}</h3>
                            {schedule.enabled ? (
                              <span className="px-2 py-1 text-xs rounded bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/30">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded bg-[#6B7280]/20 text-[#6B7280] border border-[#6B7280]/30">
                                Disabled
                              </span>
                            )}
                          </div>
                          {schedule.description && (
                            <p className="text-sm text-[#A1A1AA] mb-2">{schedule.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-[#A1A1AA]">
                            <span>
                              <span className="text-[#F3F4F6]">Type:</span> {schedule.data_type}
                            </span>
                            <span>
                              <span className="text-[#F3F4F6]">Format:</span> {schedule.format.toUpperCase()}
                            </span>
                            <span>
                              <span className="text-[#F3F4F6]">Frequency:</span> {schedule.frequency}
                            </span>
                            {schedule.next_run_at && (
                              <span>
                                <span className="text-[#F3F4F6]">Next Run:</span>{" "}
                                {new Date(schedule.next_run_at).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export History Tab */}
        <TabsContent value="history" className="space-y-6 mt-6">
          <Card className="bg-[#24262C] border-[#303136]">
            <CardHeader>
              <CardTitle className="text-[#F3F4F6]">Export History</CardTitle>
              <CardDescription className="text-[#A1A1AA]">
                View and download your previous exports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExportHistoryTable page={currentPage} onPageChange={setCurrentPage} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Modal */}
      {exportConfig && (
        <ExportConfirmationModal
          open={showConfirmation}
          onOpenChange={setShowConfirmation}
          onConfirm={handleConfirmExport}
          dataType={exportConfig.data_type}
          format={exportConfig.format}
          filters={exportConfig.filters}
          isLoading={createExport.isPending}
        />
      )}

      {/* Schedule Setup Dialog */}
      <ScheduleSetupDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        onSubmit={handleScheduleSubmit}
        isLoading={createSchedule.isPending}
      />
    </div>
  )
}
