import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Loader2, 
  ArrowRight, 
  Sparkles,
  HelpCircle,
  RefreshCw,
  XCircle
} from "lucide-react"

type VerificationStatus = "loading" | "success" | "error" | "pending"

export default function EmailVerification() {
  const [status, setStatus] = useState<VerificationStatus>("loading")
  const [isResending, setIsResending] = useState(false)
  const [showResendDialog, setShowResendDialog] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Check if we have a token in the URL (Supabase handles this via hash fragments)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get("access_token")
        const type = hashParams.get("type")
        const token = searchParams.get("token")

        // Get current session to check if user is already verified
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        // If we have a token in URL hash (Supabase callback)
        if (type === "signup" && accessToken) {
          // Supabase automatically verifies when the link is clicked
          // The session should already be established
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          
          if (userError) throw userError

          if (user?.email_confirmed_at) {
            setStatus("success")
            setUserEmail(user?.email || "")
            toast.success("Email verified successfully!", {
              description: "Your email has been confirmed. You can now access all features.",
            })
          } else {
            setStatus("pending")
            setUserEmail(user?.email || "")
          }
        } 
        // If we have a token in query params (custom verification)
        else if (token) {
          // Handle custom token verification if needed
          // For now, we'll treat it as pending
          setStatus("pending")
        }
        // Check if user is already verified
        else if (session?.user) {
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          
          if (userError) throw userError

          if (user?.email_confirmed_at) {
            setStatus("success")
            setUserEmail(user?.email || "")
          } else {
            setStatus("pending")
            setUserEmail(user?.email || "")
          }
        } 
        // No session and no token - show pending state
        else {
          setStatus("pending")
        }
      } catch (error: any) {
        console.error("Verification error:", error)
        setStatus("error")
        setErrorMessage(
          error.message || "Unable to verify your email. The link may be invalid or expired."
        )
        setShowErrorDialog(true)
      }
    }

    verifyEmail()
  }, [searchParams])

  const handleResendVerification = async () => {
    setIsResending(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError

      if (!user?.email) {
        throw new Error("No email address found. Please sign up again.")
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      })

      if (error) throw error

      setShowResendDialog(true)
      toast.success("Verification email sent!", {
        description: "Please check your inbox and click the verification link.",
      })
    } catch (error: any) {
      toast.error("Failed to resend verification email", {
        description: error.message || "Please try again later or contact support.",
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleContinueToDashboard = () => {
    navigate("/dashboard")
  }

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md animate-fade-in-up border-border shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue mb-4" />
            <p className="text-sm text-muted-foreground">Verifying your email...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (status === "success") {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md space-y-6 animate-fade-in-up">
            {/* Header with Logo */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-8 w-8 text-yellow" />
                <h1 className="text-3xl font-bold text-foreground">AgentForms</h1>
              </div>
            </div>

            {/* Success Card */}
            <Card className="border-border shadow-card">
              <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-green/20 p-3 animate-scale-in">
                    <CheckCircle2 className="h-8 w-8 text-green" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
                <CardDescription>
                  Your email address has been successfully verified.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-card-secondary rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    <span className="font-medium text-foreground">{userEmail}</span>
                  </p>
                </div>
                
                <p className="text-sm text-muted-foreground text-center">
                  You can now access all features of AgentForms. Click below to continue to your dashboard.
                </p>

                <Button
                  onClick={handleContinueToDashboard}
                  className="w-full bg-yellow text-background hover:bg-yellow/90 btn-hover"
                >
                  Continue to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Footer Links */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <span>•</span>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms
                </Link>
                <span>•</span>
                <Link to="/help" className="hover:text-foreground transition-colors">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Dialogs */}
        <ResendConfirmationDialog 
          open={showResendDialog} 
          onOpenChange={setShowResendDialog} 
        />
        <TroubleshootingDialog 
          open={showErrorDialog} 
          onOpenChange={setShowErrorDialog} 
        />
      </>
    )
  }

  // Error state
  if (status === "error") {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md space-y-6 animate-fade-in-up">
            {/* Header with Logo */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-8 w-8 text-yellow" />
                <h1 className="text-3xl font-bold text-foreground">AgentForms</h1>
              </div>
            </div>

            {/* Error Card */}
            <Card className="border-border shadow-card">
              <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-status-high/20 p-3">
                    <XCircle className="h-8 w-8 text-status-high" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">Verification Failed</CardTitle>
                <CardDescription>
                  We couldn't verify your email address.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-card-secondary rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    {errorMessage || "The verification link may be invalid or expired."}
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="w-full bg-yellow text-background hover:bg-yellow/90 btn-hover"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full text-blue hover:text-blue/80"
                  >
                    <Link to="/login">Back to Login</Link>
                  </Button>
                </div>

                {/* Troubleshooting Tips */}
                <div className="pt-4 border-t border-border">
                  <button
                    onClick={() => setShowErrorDialog(true)}
                    className="w-full flex items-center justify-center gap-2 text-sm text-blue hover:text-blue/80 transition-colors"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Troubleshooting Tips
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Footer Links */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <span>•</span>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms
                </Link>
                <span>•</span>
                <Link to="/help" className="hover:text-foreground transition-colors">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Dialogs */}
        <ResendConfirmationDialog 
          open={showResendDialog} 
          onOpenChange={setShowResendDialog} 
        />
        <TroubleshootingDialog 
          open={showErrorDialog} 
          onOpenChange={setShowErrorDialog} 
        />
      </>
    )
  }

  // Pending state (no verification yet)
  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6 animate-fade-in-up">
          {/* Header with Logo */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-8 w-8 text-yellow" />
              <h1 className="text-3xl font-bold text-foreground">AgentForms</h1>
            </div>
          </div>

          {/* Pending Verification Card */}
          <Card className="border-border shadow-card">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-blue/20 p-3">
                  <Mail className="h-8 w-8 text-blue" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
              <CardDescription>
                We've sent a verification link to your email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userEmail && (
                <div className="bg-card-secondary rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    Check your inbox at{" "}
                    <span className="font-medium text-foreground">{userEmail}</span>
                  </p>
                </div>
              )}

              <div className="bg-card-secondary rounded-lg p-4 border border-border space-y-3">
                <p className="text-sm font-medium text-foreground">What to do next:</p>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the verification link in the email</li>
                  <li>You'll be redirected back to complete verification</li>
                </ol>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full bg-yellow text-background hover:bg-yellow/90 btn-hover"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full text-blue hover:text-blue/80"
                >
                  <Link to="/login">Back to Login</Link>
                </Button>
              </div>

              {/* Troubleshooting Tips */}
              <div className="pt-4 border-t border-border">
                <button
                  onClick={() => setShowErrorDialog(true)}
                  className="w-full flex items-center justify-center gap-2 text-sm text-blue hover:text-blue/80 transition-colors"
                >
                  <HelpCircle className="h-4 w-4" />
                  Need Help? View Troubleshooting Tips
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Footer Links */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <span>•</span>
              <Link to="/help" className="hover:text-foreground transition-colors">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Dialogs */}
      <ResendConfirmationDialog 
        open={showResendDialog} 
        onOpenChange={setShowResendDialog} 
      />
      <TroubleshootingDialog 
        open={showErrorDialog} 
        onOpenChange={setShowErrorDialog} 
      />
    </>
  )
}

// Dialog Components
function ResendConfirmationDialog({ 
  open, 
  onOpenChange 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green/20 p-3">
              <CheckCircle2 className="h-8 w-8 text-green" />
            </div>
          </div>
          <DialogTitle className="text-center">Email Sent!</DialogTitle>
          <DialogDescription className="text-center">
            We've sent a new verification email to your inbox. Please check your email and click the verification link.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-yellow text-background hover:bg-yellow/90 btn-hover"
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function TroubleshootingDialog({ 
  open, 
  onOpenChange 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-status-high/20 p-3">
              <AlertCircle className="h-8 w-8 text-status-high" />
            </div>
          </div>
          <DialogTitle>Troubleshooting Tips</DialogTitle>
          <DialogDescription>
            If you're having trouble verifying your email, try these steps:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">1. Check your spam/junk folder</p>
            <p className="text-sm text-muted-foreground">
              Sometimes verification emails end up in spam. Make sure to check all folders.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">2. Verify the link hasn't expired</p>
            <p className="text-sm text-muted-foreground">
              Verification links expire after 24 hours. Request a new one if needed.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">3. Check your email address</p>
            <p className="text-sm text-muted-foreground">
              Make sure you're checking the correct email address you used to sign up.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">4. Contact support</p>
            <p className="text-sm text-muted-foreground">
              If you continue to have issues, our support team is here to help.
            </p>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Close
          </Button>
          <Button
            asChild
            className="bg-yellow text-background hover:bg-yellow/90 btn-hover w-full sm:w-auto"
          >
            <Link to="/help">Contact Support</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
