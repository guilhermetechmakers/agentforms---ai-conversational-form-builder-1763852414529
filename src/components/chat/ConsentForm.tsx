import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

interface ConsentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consentGiven: boolean
  onConsentChange: (consent: boolean) => void
  onAccept: () => void
  agentName?: string
}

export function ConsentForm({
  open,
  onOpenChange,
  consentGiven,
  onConsentChange,
  onAccept,
  agentName,
}: ConsentFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-[#60A5FA]" />
            <DialogTitle className="text-xl">Privacy & Consent</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Before we begin, please review our privacy policy and consent to data
            collection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-[#24262C] rounded-lg p-4 border border-[#303136]">
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              By continuing, you agree that:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#A1A1AA] list-disc list-inside">
              <li>Your conversation will be stored and processed</li>
              <li>Your responses may be used to improve our services</li>
              <li>You can request data deletion at any time</li>
              {agentName && (
                <li>Your data will be shared with {agentName}</li>
              )}
            </ul>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="consent-checkbox"
              checked={consentGiven}
              onCheckedChange={(checked) => onConsentChange(checked === true)}
              className="mt-1"
            />
            <label
              htmlFor="consent-checkbox"
              className="text-sm text-[#A1A1AA] leading-relaxed cursor-pointer"
            >
              I have read and agree to the{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#60A5FA] hover:underline"
              >
                Privacy Policy
              </a>{" "}
              and consent to data collection.
            </label>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={onAccept}
            disabled={!consentGiven}
            className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
          >
            Accept & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
