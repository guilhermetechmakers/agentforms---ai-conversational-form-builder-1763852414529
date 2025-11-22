import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import type { Agent } from "@/types/agent"

interface WelcomeBannerProps {
  agent: Agent
  consentRequired: boolean
  consentGiven: boolean
  onConsentChange: (consent: boolean) => void
  onStartChat: () => void
}

export function WelcomeBanner({
  agent,
  consentRequired,
  consentGiven,
  onConsentChange,
  onStartChat,
}: WelcomeBannerProps) {
  const welcomeMessage =
    agent.visuals?.welcome_message ||
    agent.persona?.welcome_message ||
    `Welcome! I'm ${agent.name}. Let's start our conversation.`

  const avatarUrl = agent.visuals?.avatar_url
  const logoUrl = agent.visuals?.logo_url

  return (
    <div className="w-full bg-[#282A30] border-b border-[#303136] p-6 md:p-8 animate-fade-in-down">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar/Logo */}
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <Avatar className="h-16 w-16 md:h-20 md:w-20">
                <AvatarImage src={avatarUrl} alt={agent.name} />
                <AvatarFallback>
                  {agent.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : logoUrl ? (
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden bg-[#24262C] flex items-center justify-center">
                <img src={logoUrl} alt={agent.name} className="h-full w-full object-contain" />
              </div>
            ) : (
              <Avatar className="h-16 w-16 md:h-20 md:w-20">
                <AvatarFallback>
                  {agent.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-[#F3F4F6] mb-2">
              {agent.name}
            </h1>
            {agent.description && (
              <p className="text-[#A1A1AA] mb-4">{agent.description}</p>
            )}
            <p className="text-[#F3F4F6] text-base md:text-lg leading-relaxed">
              {welcomeMessage}
            </p>

            {/* Consent Checkbox */}
            {consentRequired && (
              <div className="mt-6 flex items-start gap-3">
                <Checkbox
                  id="consent"
                  checked={consentGiven}
                  onCheckedChange={(checked) =>
                    onConsentChange(checked === true)
                  }
                  className="mt-1"
                />
                <label
                  htmlFor="consent"
                  className="text-sm text-[#A1A1AA] leading-relaxed cursor-pointer"
                >
                  I agree to share my information and consent to data collection
                  as described in the{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#60A5FA] hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>
            )}

            {/* Start Chat Button */}
            <div className="mt-6">
              <Button
                onClick={onStartChat}
                disabled={consentRequired && !consentGiven}
                size="lg"
                className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Start Conversation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
