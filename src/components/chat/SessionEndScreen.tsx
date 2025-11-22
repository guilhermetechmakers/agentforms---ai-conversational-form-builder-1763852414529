import { CheckCircle2, Download, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { SessionWithData } from "@/types/session"

interface SessionEndScreenProps {
  session: SessionWithData
  onDownload?: () => void
  onBookDemo?: () => void
  onScheduleFollowup?: () => void
  customMessage?: string
}

export function SessionEndScreen({
  session,
  onDownload,
  onBookDemo,
  onScheduleFollowup,
  customMessage,
}: SessionEndScreenProps) {
  const thankYouMessage =
    customMessage ||
    session.agent?.persona?.welcome_message ||
    "Thank you for your time! We'll be in touch soon."

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6 animate-fade-in">
      <Card className="max-w-2xl w-full p-8 md:p-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-[#4ADE80] flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-[#22242A]" />
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-[#F3F4F6] mb-4">
          Thank You!
        </h2>

        <p className="text-lg text-[#A1A1AA] mb-8 leading-relaxed">
          {thankYouMessage}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {onDownload && (
            <Button
              onClick={onDownload}
              variant="outline"
              className="hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Download className="mr-2 h-4 w-4" />
              Download My Data
            </Button>
          )}

          {onBookDemo && (
            <Button
              onClick={onBookDemo}
              className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Book a Demo
            </Button>
          )}

          {onScheduleFollowup && (
            <Button
              onClick={onScheduleFollowup}
              variant="outline"
              className="hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Follow-up
            </Button>
          )}
        </div>

        {session.field_values.length > 0 && (
          <div className="mt-8 pt-8 border-t border-[#303136]">
            <p className="text-sm text-[#A1A1AA] mb-2">
              We've collected {session.field_values.length} field
              {session.field_values.length !== 1 ? "s" : ""} from our conversation.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
