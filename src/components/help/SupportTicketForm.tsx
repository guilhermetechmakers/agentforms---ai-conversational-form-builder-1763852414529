import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCreateSupportTicket } from "@/hooks/useHelp"
import { Loader2, Send } from "lucide-react"

const supportTicketSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  session_id: z.string().optional(),
})

type SupportTicketFormData = z.infer<typeof supportTicketSchema>

interface SupportTicketFormProps {
  defaultSessionId?: string
  onSuccess?: () => void
}

export function SupportTicketForm({ defaultSessionId, onSuccess }: SupportTicketFormProps) {
  const createTicket = useCreateSupportTicket()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SupportTicketFormData>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      session_id: defaultSessionId || "",
    },
  })

  const onSubmit = async (data: SupportTicketFormData) => {
    try {
      await createTicket.mutateAsync({
        email: data.email,
        subject: data.subject,
        description: data.description,
        session_id: data.session_id || null,
      })
      reset()
      onSuccess?.()
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Support</CardTitle>
        <CardDescription>
          Fill out the form below and we'll get back to you as soon as possible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#F3F4F6] mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              {...register("email")}
              className={errors.email ? "border-[#F87171]" : ""}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-[#F87171]">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-[#F3F4F6] mb-2">
              Subject
            </label>
            <Input
              id="subject"
              type="text"
              placeholder="Brief description of your issue"
              {...register("subject")}
              className={errors.subject ? "border-[#F87171]" : ""}
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-[#F87171]">{errors.subject.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#F3F4F6] mb-2">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Please provide as much detail as possible about your issue..."
              rows={6}
              {...register("description")}
              className={errors.description ? "border-[#F87171]" : ""}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-[#F87171]">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="session_id" className="block text-sm font-medium text-[#F3F4F6] mb-2">
              Session ID (Optional)
            </label>
            <Input
              id="session_id"
              type="text"
              placeholder="If this relates to a specific session, paste the session ID here"
              {...register("session_id")}
            />
            <p className="mt-1 text-xs text-[#A1A1AA]">
              Include a session ID if your issue is related to a specific conversation
            </p>
          </div>

          <Button
            type="submit"
            disabled={createTicket.isPending}
            className="w-full bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
          >
            {createTicket.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Ticket
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
