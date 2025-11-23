import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Save, Play, Globe, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useAgent, useCreateAgent, useUpdateAgent, usePublishAgent } from "@/hooks/useAgents"
import { FieldEditorDialog } from "@/components/agent-builder/FieldEditorDialog"
import { FieldListSidebar } from "@/components/agent-builder/FieldListSidebar"
import { FieldEditorPanel } from "@/components/agent-builder/FieldEditorPanel"
import { PersonaToneSection } from "@/components/agent-builder/PersonaToneSection"
import { KnowledgeInputSection } from "@/components/agent-builder/KnowledgeInputSection"
import { AppearanceSettingsSection } from "@/components/agent-builder/AppearanceSettingsSection"
import { PreviewPane } from "@/components/agent-builder/PreviewPane"
import { AgentBuilderFooter } from "@/components/agent-builder/AgentBuilderFooter"
import { VersionHistoryPanel } from "@/components/agent-builder/VersionHistoryPanel"
import type { Agent, Field, Persona, KnowledgeBase, VisualSettings, AgentSchema } from "@/types/agent"

// Autosave debounce delay (ms)
const AUTOSAVE_DELAY = 2000

export default function AgentBuilder() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id

  // Fetch existing agent if editing
  const agentQuery = useAgent(id || '')
  const existingAgent = isNew ? null : agentQuery.data
  const isLoading = isNew ? false : agentQuery.isLoading

  // Local state for agent configuration
  const [agentName, setAgentName] = useState("")
  const [description, setDescription] = useState("")
  const [fields, setFields] = useState<Field[]>([])
  const [persona, setPersona] = useState<Persona>({})
  const [knowledge, setKnowledge] = useState<KnowledgeBase>({ type: 'text' })
  const [visuals, setVisuals] = useState<VisualSettings>({})
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [fieldEditorOpen, setFieldEditorOpen] = useState(false)
  const [editingField, setEditingField] = useState<Field | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [fieldToDelete, setFieldToDelete] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Initialize from existing agent
  useEffect(() => {
    if (existingAgent && !isNew) {
      setAgentName(existingAgent.name)
      setDescription(existingAgent.description || "")
      setFields(existingAgent.schema?.fields || [])
      setPersona(existingAgent.persona || {})
      setKnowledge(existingAgent.knowledge || { type: 'text' })
      setVisuals(existingAgent.visuals || {})
    }
  }, [existingAgent, isNew])

  // Mutations
  const createAgent = useCreateAgent()
  const updateAgent = useUpdateAgent()
  const publishAgent = usePublishAgent()

  // Autosave effect
  useEffect(() => {
    if (isNew || !hasUnsavedChanges) return

    const timer = setTimeout(() => {
      handleSave(true) // Silent save
    }, AUTOSAVE_DELAY)

    return () => clearTimeout(timer)
  }, [agentName, description, fields, persona, knowledge, visuals, isNew, hasUnsavedChanges])

  // Track changes
  useEffect(() => {
    if (!isNew && existingAgent) {
      const hasChanges =
        agentName !== existingAgent.name ||
        description !== (existingAgent.description || "") ||
        JSON.stringify(fields) !== JSON.stringify(existingAgent.schema?.fields || []) ||
        JSON.stringify(persona) !== JSON.stringify(existingAgent.persona || {}) ||
        JSON.stringify(knowledge) !== JSON.stringify(existingAgent.knowledge || {}) ||
        JSON.stringify(visuals) !== JSON.stringify(existingAgent.visuals || {})
      setHasUnsavedChanges(hasChanges)
    }
  }, [agentName, description, fields, persona, knowledge, visuals, existingAgent, isNew])

  // Validation warnings
  const validationWarnings = useMemo(() => {
    const warnings: Array<{ type: 'error' | 'warning' | 'info'; message: string }> = []

    if (!agentName.trim()) {
      warnings.push({ type: 'error', message: 'Agent name is required' })
    }

    if (fields.length === 0) {
      warnings.push({ type: 'warning', message: 'No fields defined. Add at least one field to collect data.' })
    }

    const fieldKeys = fields.map(f => f.key)
    const duplicateKeys = fieldKeys.filter((key, index) => fieldKeys.indexOf(key) !== index)
    if (duplicateKeys.length > 0) {
      warnings.push({ type: 'error', message: `Duplicate field keys: ${[...new Set(duplicateKeys)].join(', ')}` })
    }

    const requiredFields = fields.filter(f => f.required)
    if (requiredFields.length === 0 && fields.length > 0) {
      warnings.push({ type: 'info', message: 'No required fields. Consider marking at least one field as required.' })
    }

    return warnings
  }, [agentName, fields])

  // Build agent object
  const buildAgentData = useCallback((): Partial<Agent> => {
    return {
      name: agentName,
      description: description || undefined,
      schema: { fields } as AgentSchema,
      persona,
      knowledge,
      visuals,
    }
  }, [agentName, description, fields, persona, knowledge, visuals])

  // Save handler
  const handleSave = useCallback(async (silent = false) => {
    if (!agentName.trim()) {
      if (!silent) {
        toast.error("Agent name is required")
      }
      return
    }

    setIsSaving(true)
    try {
      const agentData = buildAgentData()

      if (isNew) {
        const newAgent = await createAgent.mutateAsync(agentData as any)
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
        if (!silent) {
          toast.success("Agent created successfully!")
        }
        navigate(`/dashboard/agents/${newAgent.id}`, { replace: true })
      } else if (id) {
        await updateAgent.mutateAsync({ id, updates: agentData as any })
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
        if (!silent) {
          toast.success("Agent saved successfully!")
        }
      }
    } catch (error) {
      if (!silent) {
        toast.error(`Failed to save agent: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } finally {
      setIsSaving(false)
    }
  }, [agentName, buildAgentData, isNew, id, createAgent, updateAgent, navigate])

  // Publish handler
  const handlePublish = useCallback(async () => {
    if (!agentName.trim()) {
      toast.error("Agent name is required")
      return
    }

    if (fields.length === 0) {
      toast.error("Add at least one field before publishing")
      return
    }

    // Save first if there are unsaved changes
    if (hasUnsavedChanges) {
      await handleSave(true)
    }

    if (!id) return

    try {
      await publishAgent.mutateAsync({
        id,
        changeSummary: `Published version ${existingAgent?.version ? existingAgent.version + 1 : 1}`,
      })
      toast.success("Agent published successfully!")
    } catch (error) {
      toast.error(`Failed to publish agent: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [agentName, fields, hasUnsavedChanges, handleSave, id, publishAgent, existingAgent])

  // Test handler
  const handleTest = useCallback(() => {
    navigate(`/dashboard/agents/${id || 'new'}/test`)
  }, [navigate, id])

  // Field handlers
  const handleAddField = useCallback(() => {
    setEditingField(null)
    setFieldEditorOpen(true)
  }, [])

  const handleEditField = useCallback((field: Field) => {
    setEditingField(field)
    setFieldEditorOpen(true)
  }, [])

  const handleSaveField = useCallback((fieldData: Omit<Field, 'id' | 'order'>) => {
    if (editingField) {
      // Update existing field
      setFields(prev => prev.map(f =>
        f.id === editingField.id
          ? { ...f, ...fieldData }
          : f
      ))
    } else {
      // Add new field
      const newField: Field = {
        ...fieldData,
        id: `field-${Date.now()}`,
        order: fields.length,
      }
      setFields(prev => [...prev, newField])
      setSelectedFieldId(newField.id)
    }
    setFieldEditorOpen(false)
    setEditingField(null)
  }, [editingField, fields.length])

  const handleDeleteField = useCallback((fieldId: string) => {
    setFieldToDelete(fieldId)
    setDeleteConfirmOpen(true)
  }, [])

  const confirmDeleteField = useCallback(() => {
    if (fieldToDelete) {
      setFields(prev => {
        const filtered = prev.filter(f => f.id !== fieldToDelete)
        // Reorder remaining fields
        return filtered.map((f, index) => ({ ...f, order: index }))
      })
      if (selectedFieldId === fieldToDelete) {
        setSelectedFieldId(null)
      }
      setFieldToDelete(null)
    }
    setDeleteConfirmOpen(false)
  }, [fieldToDelete, selectedFieldId])

  const handleReorderFields = useCallback((reorderedFields: Field[]) => {
    setFields(reorderedFields)
  }, [])

  const handleUpdateField = useCallback((updates: Partial<Field>) => {
    if (!selectedFieldId) return
    setFields(prev => prev.map(f =>
      f.id === selectedFieldId ? { ...f, ...updates } : f
    ))
  }, [selectedFieldId])

  const existingKeys = useMemo(() => {
    return fields
      .filter(f => !editingField || f.id !== editingField.id)
      .map(f => f.key)
  }, [fields, editingField])

  // Only show loading if we're editing and actually fetching
  if (isLoading && !isNew && id) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-[#A1A1AA]">Loading agent...</div>
      </div>
    )
  }

  const currentAgent: Partial<Agent> = {
    id: id,
    name: agentName,
    description,
    schema: { fields },
    persona,
    knowledge,
    visuals,
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#22242A]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[#303136] bg-[#282A30]">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-[#A1A1AA] hover:text-[#F3F4F6] hover:bg-[#24262C]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#F3F4F6]">
              {isNew ? "Create New Agent" : agentName || "Edit Agent"}
            </h1>
            <p className="text-sm text-[#A1A1AA] mt-1">
              {isNew ? "Build your conversational form agent" : "Update your agent configuration"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isNew && id && (
            <VersionHistoryPanel
              agentId={id}
              currentVersion={existingAgent?.version || 1}
            />
          )}
          <Button
            variant="outline"
            onClick={() => handleSave()}
            disabled={isSaving || !hasUnsavedChanges}
            className="border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
          {!isNew && (
            <Button
              variant="outline"
              onClick={handleTest}
              className="border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
            >
              <Play className="mr-2 h-4 w-4" />
              Test
            </Button>
          )}
          {!isNew && (
            <Button
              onClick={handlePublish}
              disabled={publishAgent.isPending || fields.length === 0}
              className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
            >
              <Globe className="mr-2 h-4 w-4" />
              {existingAgent?.status === 'published' ? 'Update' : 'Publish'}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Fields */}
        <div className="w-80 flex-shrink-0">
          <FieldListSidebar
            fields={fields}
            selectedFieldId={selectedFieldId}
            onSelectField={setSelectedFieldId}
            onAddField={handleAddField}
            onEditField={handleEditField}
            onDeleteField={handleDeleteField}
            onReorderFields={handleReorderFields}
          />
        </div>

        {/* Center - Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <Tabs defaultValue="fields" className="space-y-4">
              <TabsList className="bg-[#24262C] border border-[#303136]">
                <TabsTrigger value="fields" className="data-[state=active]:bg-[#282A30]">
                  Fields
                </TabsTrigger>
                <TabsTrigger value="persona" className="data-[state=active]:bg-[#282A30]">
                  Persona
                </TabsTrigger>
                <TabsTrigger value="knowledge" className="data-[state=active]:bg-[#282A30]">
                  Knowledge
                </TabsTrigger>
                <TabsTrigger value="appearance" className="data-[state=active]:bg-[#282A30]">
                  Appearance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="fields" className="space-y-4 mt-4">
                {/* Agent Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#F3F4F6]">Agent Name *</label>
                    <Input
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder="Customer Support Bot"
                      className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#F3F4F6]">Description</label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="A helpful assistant for customer inquiries"
                      className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA]"
                    />
                  </div>
                </div>

                {/* Field Editor Panel */}
                <FieldEditorPanel
                  field={fields.find(f => f.id === selectedFieldId) || null}
                  onUpdateField={handleUpdateField}
                />
              </TabsContent>

              <TabsContent value="persona" className="mt-4">
                <PersonaToneSection
                  persona={persona}
                  onUpdatePersona={(updates) => setPersona(prev => ({ ...prev, ...updates }))}
                />
              </TabsContent>

              <TabsContent value="knowledge" className="mt-4">
                <KnowledgeInputSection
                  knowledge={knowledge}
                  onUpdateKnowledge={(updates) => setKnowledge(prev => ({ ...prev, ...updates }))}
                  agentId={id || undefined}
                />
              </TabsContent>

              <TabsContent value="appearance" className="mt-4">
                <AppearanceSettingsSection
                  visuals={visuals}
                  onUpdateVisuals={(updates) => setVisuals(prev => ({ ...prev, ...updates }))}
                  agentId={id || undefined}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Sidebar - Preview */}
        <div className="w-96 flex-shrink-0 border-l border-[#303136] p-6 overflow-y-auto">
          <PreviewPane agent={currentAgent} />
        </div>
      </div>

      {/* Footer */}
      <AgentBuilderFooter
        isSaving={isSaving}
        lastSaved={lastSaved}
        validationWarnings={validationWarnings}
      />

      {/* Field Editor Dialog */}
      <FieldEditorDialog
        open={fieldEditorOpen}
        onOpenChange={setFieldEditorOpen}
        field={editingField}
        onSave={handleSaveField}
        existingKeys={existingKeys}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-[#282A30] border-[#303136]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#F3F4F6]">Delete Field</AlertDialogTitle>
            <AlertDialogDescription className="text-[#A1A1AA]">
              Are you sure you want to delete this field? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteField}
              className="bg-[#F87171] text-white hover:bg-[#F87171]/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
