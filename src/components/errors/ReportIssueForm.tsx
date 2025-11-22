import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCreateErrorReport } from "@/hooks/useErrors"
import { Loader2, Send, AlertCircle } from "lucide-react"

const reportIssueSchema = z.object({
  error_description: z.string().optional(),
  user_comments: z.string().min(10, "Please provide at least 10 characters of detail"),
  session_id: z.string().optional(),
})

type ReportIssueFormData = z.infer<typeof reportIssueSchema>

interface ReportIssueFormProps {
  defaultSessionId?: string
  defaultErrorDescription?: string
  onSuccess?: () => void
}

export function ReportIssueForm({
  defaultSessionId,
  defaultErrorDescription,
  onSuccess,
}: ReportIssueFormProps) {
  const createReport = useCreateErrorReport()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReportIssueFormData>({
    resolver: zodResolver(reportIssueSchema),
    defaultValues: {
      session_id: defaultSessionId || "",
      error_description: defaultErrorDescription || "",
    },
  })

  const onSubmit = async (data: ReportIssueFormData) => {
    try {
      await createReport.mutateAsync({
        session_id: data.session_id || null,
        error_description: data.error_description || null,
        user_comments: data.user_comments,
        error_type: "server_error",
        status: "open",
      })
      reset()
      onSuccess?.()
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  return (
    <Card className="bg-[#282A30] border-[#303136]">
      <CardHeader>
        <CardTitle className="text-[#F3F4F6] flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-[#F87171]" />
          Report Issue
        </CardTitle>
        <CardDescription className="text-[#A1A1AA]">
          Help us improve by providing details about the error you encountered. Your feedback is
          valuable and helps us fix issues faster.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {defaultErrorDescription && (
            <div>
              <label
                htmlFor="error_description"
                className="block text-sm font-medium text-[#F3F4F6] mb-2"
              >
                Error Description
              </label>
              <Textarea
                id="error_description"
                placeholder="System error description..."
                rows={3}
                {...register("error_description")}
                className="bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-2 focus:ring-[#60A5FA]"
                readOnly
              />
              <p className="mt-1 text-xs text-[#A1A1AA]">
                This information was automatically captured
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="user_comments"
              className="block text-sm font-medium text-[#F3F4F6] mb-2"
            >
              Additional Details <span className="text-[#F87171]">*</span>
            </label>
            <Textarea
              id="user_comments"
              placeholder="Please describe what you were trying to do when the error occurred..."
              rows={6}
              {...register("user_comments")}
              className={
                errors.user_comments
                  ? "border-[#F87171] bg-[#24262C] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-2 focus:ring-[#60A5FA]"
                  : "bg-[#24262C] border-[#303136] text-[#F3F4F6] placeholder:text-[#A1A1AA] focus:ring-2 focus:ring-[#60A5FA]"
              }
            />
            {errors.user_comments && (
              <p className="mt-1 text-sm text-[#F87171]">{errors.user_comments.message}</p>
            )}
            <p className="mt-1 text-xs text-[#A1A1AA]">
              Include any steps you took before the error, what you expected to happen, and any
              other relevant context.
            </p>
          </div>

          {defaultSessionId && (
            <div>
              <label
                htmlFor="session_id"
                className="block text-sm font-medium text-[#F3F4F6] mb-2"
              >
                Session ID
              </label>
              <Input
                id="session_id"
                type="text"
                {...register("session_id")}
                className="bg-[#24262C] border-[#303136] text-[#A1A1AA] cursor-not-allowed"
                readOnly
              />
              <p className="mt-1 text-xs text-[#A1A1AA]">
                This session ID was automatically captured for context
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={createReport.isPending}
            className="w-full bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            {createReport.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Report
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
