import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useCreateAgent } from "@/hooks/useAgents"

const createAgentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
})

type CreateAgentForm = z.infer<typeof createAgentSchema>

interface CreateAgentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateAgentModal({ open, onOpenChange }: CreateAgentModalProps) {
  const navigate = useNavigate()
  const createAgent = useCreateAgent()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateAgentForm>({
    resolver: zodResolver(createAgentSchema),
  })

  const onSubmit = async (data: CreateAgentForm) => {
    try {
      const newAgent = await createAgent.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        schema: { fields: [] },
      })
      reset()
      onOpenChange(false)
      navigate(`/dashboard/agents/${newAgent.id}`)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#282A30] border-[#303136] text-[#F3F4F6]">
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            Start by giving your agent a name and description. You can configure
            fields, persona, and settings in the builder.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#F3F4F6]">
              Agent Name *
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Customer Support Bot"
              className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA]"
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-[#F87171]">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#F3F4F6]">
              Description
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of what this agent does..."
              className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-[#60A5FA]"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-[#F87171]">
                {errors.description.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
              className="border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createAgent.isPending}
              className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
            >
              {createAgent.isPending ? "Creating..." : "Create Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
