import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSetup2FA, useVerifyAndEnable2FA } from "@/hooks/useProfile"
import { useQueryClient } from "@tanstack/react-query"
import { profileKeys } from "@/hooks/useProfile"
import { Loader2, Copy, Check, Shield, QrCode, Key } from "lucide-react"
import { toast } from "sonner"

const verifySchema = z.object({
  token: z.string().min(6, "Token must be 6 digits").max(6, "Token must be 6 digits"),
})

type VerifyFormData = z.infer<typeof verifySchema>

interface Setup2FADialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SetupStep = "qr" | "verify" | "backup-codes"

export function Setup2FADialog({ open, onOpenChange }: Setup2FADialogProps) {
  const queryClient = useQueryClient()
  const setup2FA = useSetup2FA()
  const verifyAndEnable2FA = useVerifyAndEnable2FA()
  const [step, setStep] = useState<SetupStep>("qr")
  const [secret, setSecret] = useState<string>("")
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState<Record<number, boolean>>({})

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
  })

  // Initialize 2FA setup when dialog opens
  useEffect(() => {
    if (open && step === "qr" && !setup2FA.data) {
      setup2FA.mutate(undefined, {
        onSuccess: (data) => {
          setSecret(data.secret)
          setQrCodeUrl(data.qr_code_url)
          setBackupCodes(data.backup_codes)
        },
      })
    }
  }, [open, step])

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setStep("qr")
      setSecret("")
      setQrCodeUrl("")
      setBackupCodes([])
      reset()
      setup2FA.reset()
    }
  }, [open])

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret)
    setCopiedSecret(true)
    toast.success("Secret copied to clipboard")
    setTimeout(() => setCopiedSecret(false), 2000)
  }

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code)
    setCopiedCodes((prev) => ({ ...prev, [index]: true }))
    toast.success("Code copied to clipboard")
    setTimeout(() => {
      setCopiedCodes((prev) => {
        const newState = { ...prev }
        delete newState[index]
        return newState
      })
    }, 2000)
  }

  const onVerify = async (data: VerifyFormData) => {
    if (!secret) {
      toast.error("Please wait for setup to complete")
      return
    }

    try {
      await verifyAndEnable2FA.mutateAsync({
        secret,
        token: data.token,
      })
      queryClient.invalidateQueries({ queryKey: profileKeys.profile() })
      setStep("backup-codes")
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleFinish = () => {
    onOpenChange(false)
  }

  // Generate QR code image URL from otpauth URL
  // In production, use a QR code library or service
  const qrCodeImageUrl = qrCodeUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`
    : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Setup Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Add an extra layer of security to your account
          </DialogDescription>
        </DialogHeader>

        {step === "qr" && (
          <div className="space-y-6">
            {setup2FA.isPending ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#A1A1AA]" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <p className="text-sm text-[#A1A1AA]">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    <Card className="bg-[#24262C] border-[#303136] p-4">
                      {qrCodeImageUrl ? (
                        <img
                          src={qrCodeImageUrl}
                          alt="2FA QR Code"
                          className="w-48 h-48"
                        />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center bg-[#282A30] rounded">
                          <QrCode className="h-16 w-16 text-[#A1A1AA]" />
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* Secret Key */}
                  <Card className="bg-[#24262C] border-[#303136]">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Secret Key
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Can't scan? Enter this code manually
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-[#282A30] rounded text-sm font-mono text-[#F3F4F6] break-all">
                          {secret}
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCopySecret}
                          className="gap-2"
                        >
                          {copiedSecret ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep("verify")}
                    className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
                  >
                    Continue
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        )}

        {step === "verify" && (
          <form onSubmit={handleSubmit(onVerify)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Verification Code</Label>
              <Input
                id="token"
                {...register("token")}
                placeholder="000000"
                maxLength={6}
                className="bg-[#24262C] border-[#303136] text-center text-2xl tracking-widest font-mono"
                autoFocus
              />
              <p className="text-xs text-[#A1A1AA]">
                Enter the 6-digit code from your authenticator app
              </p>
              {errors.token && (
                <p className="text-sm text-[#F87171]">{errors.token.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("qr")}
                disabled={isSubmitting || verifyAndEnable2FA.isPending}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
                disabled={isSubmitting || verifyAndEnable2FA.isPending}
              >
                {isSubmitting || verifyAndEnable2FA.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Enable"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "backup-codes" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#F3F4F6]">
                Backup Codes
              </p>
              <p className="text-sm text-[#A1A1AA]">
                Save these codes in a safe place. You can use them to access your account if you lose your authenticator device.
              </p>
            </div>

            <Card className="bg-[#24262C] border-[#303136]">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-3">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2 bg-[#282A30] rounded"
                    >
                      <code className="text-sm font-mono text-[#F3F4F6]">
                        {code}
                      </code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(code, index)}
                        className="h-6 w-6 p-0"
                      >
                        {copiedCodes[index] ? (
                          <Check className="h-3 w-3 text-[#4ADE80]" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="rounded-lg border border-[#FBBF24]/20 bg-[#FBBF24]/5 p-4">
              <p className="text-sm text-[#FBBF24]">
                ⚠️ These codes are only shown once. Make sure to save them securely.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                onClick={handleFinish}
                className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
