import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Mail, Send } from "lucide-react"

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

type ContactFormData = z.infer<typeof contactSchema>

interface ContactFormProps {
  onSuccess?: () => void
}

export function ContactForm({ onSuccess }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (_data: ContactFormData) => {
    setIsSubmitting(true)
    
    try {
      // TODO: Integrate with support ticket API when available
      // For now, just show success message
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      toast.success("Message sent successfully! We'll get back to you soon.")
      reset()
      onSuccess?.()
    } catch (error) {
      toast.error("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register("name")}
          placeholder="Your name"
          className="w-full"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-status-high text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Input
          {...register("email")}
          type="email"
          placeholder="your.email@example.com"
          className="w-full"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-status-high text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Textarea
          {...register("message")}
          placeholder="Tell us how we can help..."
          className="w-full min-h-[120px]"
          disabled={isSubmitting}
        />
        {errors.message && (
          <p className="text-status-high text-sm mt-1">{errors.message.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-yellow text-background hover:bg-yellow/90"
      >
        {isSubmitting ? (
          <>
            <Mail className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </>
        )}
      </Button>
    </form>
  )
}
