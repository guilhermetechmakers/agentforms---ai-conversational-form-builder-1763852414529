import { useState, useCallback } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ReportIssueForm } from "@/components/errors/ReportIssueForm"
import { Home, RefreshCw, AlertCircle, HelpCircle, ArrowLeft } from "lucide-react"

export default function ServerError() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  // Extract session ID from location state if available
  const sessionId = location.state?.sessionId || null
  const errorDescription = location.state?.errorDescription || "Internal server error occurred"

  // Handle retry action
  const handleRetry = useCallback(async () => {
    setIsRetrying(true)
    try {
      // Attempt to navigate back or reload
      if (location.state?.retryPath) {
        navigate(location.state.retryPath)
      } else {
        // Reload the current page
        window.location.reload()
      }
    } catch (error) {
      console.error("Retry failed:", error)
      setIsRetrying(false)
    }
  }, [navigate, location.state])

  // Handle successful report submission
  const handleReportSuccess = useCallback(() => {
    setIsReportDialogOpen(false)
  }, [])

  // Get session ID from localStorage or generate a temporary one
  const getSessionId = useCallback(() => {
    if (sessionId) return sessionId
    // Try to get from localStorage
    const stored = localStorage.getItem("session_id")
    if (stored) return stored
    // Generate a temporary session ID
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem("session_id", tempId)
    return tempId
  }, [sessionId])

  return (
    <div className="min-h-screen bg-[#22242A] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8 animate-fade-in-up">
        {/* Error Message Section */}
        <div className="text-center space-y-4">
          <div className="inline-block">
            <div className="relative">
              <h1 className="text-8xl md:text-9xl font-bold text-[#F3F4F6] leading-none">500</h1>
              <div className="absolute -top-2 -right-2">
                <AlertCircle className="h-12 w-12 md:h-16 md:w-16 text-[#F87171] animate-pulse" />
              </div>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#F3F4F6]">
            Server Error
          </h2>
          <p className="text-lg text-[#A1A1AA] max-w-md mx-auto">
            We're sorry, but something went wrong on our end. Our team has been notified and is
            working to fix the issue. Please try again in a moment.
          </p>
        </div>

        {/* Error Details Card */}
        <Card className="bg-[#282A30] border-[#303136] shadow-card">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-[#F87171] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#F3F4F6] mb-1">
                    What happened?
                  </p>
                  <p className="text-sm text-[#A1A1AA]">
                    An internal server error occurred while processing your request. This is
                    usually temporary, and refreshing the page often resolves it.
                  </p>
                </div>
              </div>
              {sessionId && (
                <div className="flex items-start gap-3 pt-3 border-t border-[#303136]">
                  <HelpCircle className="h-5 w-5 text-[#60A5FA] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#F3F4F6] mb-1">
                      Session Information
                    </p>
                    <p className="text-xs text-[#A1A1AA] font-mono break-all">
                      Session ID: {sessionId}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            size="lg"
            className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-5 w-5" />
                Retry
              </>
            )}
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Link to="/dashboard">
              <Home className="mr-2 h-5 w-5" />
              Go to Dashboard
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Link to="/">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Report Issue */}
        <div className="text-center">
          <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="text-[#A1A1AA] hover:text-[#F3F4F6] hover:bg-[#282A30]"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Report Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#282A30] border-[#303136]">
              <DialogHeader>
                <DialogTitle className="text-[#F3F4F6]">Report Issue</DialogTitle>
                <DialogDescription className="text-[#A1A1AA]">
                  Help us fix this issue by providing details about what happened. Your feedback is
                  valuable and helps us improve the service.
                </DialogDescription>
              </DialogHeader>
              <ReportIssueForm
                defaultSessionId={getSessionId()}
                defaultErrorDescription={errorDescription}
                onSuccess={handleReportSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Helpful Links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-[#A1A1AA]">
            Need more help?{" "}
            <Link
              to="/dashboard/help"
              className="text-[#60A5FA] hover:text-[#60A5FA]/80 hover:underline transition-colors"
            >
              Visit our help center
            </Link>
            {" or "}
            <Link
              to="/dashboard/help"
              className="text-[#60A5FA] hover:text-[#60A5FA]/80 hover:underline transition-colors"
            >
              contact support
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
