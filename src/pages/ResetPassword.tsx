import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { Lock, Loader2, ArrowLeft, CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react"
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter"

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [passwordReset, setPasswordReset] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const password = watch("password")

  useEffect(() => {
    // Supabase handles password reset tokens via URL hash fragments
    // Format: #access_token=xxx&type=recovery&expires_in=3600
    const checkToken = async () => {
      try {
        // Get the hash from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get("access_token")
        const type = hashParams.get("type")

        if (type === "recovery" && accessToken) {
          // Verify the session is valid
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error || !session) {
            setIsValidToken(false)
            toast.error("Invalid or expired reset link", {
              description: "This password reset link is invalid or has expired. Please request a new one.",
            })
            setTimeout(() => navigate("/forgot-password"), 2000)
            return
          }

          setIsValidToken(true)
        } else {
          // Check if we have a session from a previous recovery
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            setIsValidToken(true)
          } else {
            setIsValidToken(false)
            toast.error("Invalid reset link", {
              description: "This password reset link is invalid or has expired. Please request a new one.",
            })
            setTimeout(() => navigate("/forgot-password"), 2000)
          }
        }
      } catch (error) {
        setIsValidToken(false)
        toast.error("Error validating reset link", {
          description: "Please try requesting a new password reset link.",
        })
        setTimeout(() => navigate("/forgot-password"), 2000)
      }
    }

    checkToken()
  }, [navigate])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!isValidToken) {
      toast.error("Invalid reset link", {
        description: "Please request a new password reset link.",
      })
      return
    }

    setIsLoading(true)
    try {
      // Update password using Supabase auth
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) throw error

      setPasswordReset(true)
      toast.success("Password reset successfully!", {
        description: "Your password has been updated. You can now sign in with your new password.",
      })
      
      // Sign out to clear the recovery session
      await supabase.auth.signOut()
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (error: any) {
      let errorMessage = "Failed to reset password. Please try again."
      
      if (error.message?.includes("expired") || error.message?.includes("invalid")) {
        errorMessage = "This reset link has expired. Please request a new one."
        setTimeout(() => navigate("/forgot-password"), 3000)
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error("Failed to reset password", {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking token
  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md animate-fade-in-up border-border shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue mb-4" />
            <p className="text-sm text-muted-foreground">Validating reset link...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state for invalid token
  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md animate-fade-in-up border-border shadow-card">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-status-high/20 p-3">
                <AlertCircle className="h-8 w-8 text-status-high" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Password reset links expire after 1 hour for security reasons. Please request a new one.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full bg-yellow text-background hover:bg-yellow/90 btn-hover">
                <Link to="/forgot-password">Request New Reset Link</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full text-blue hover:text-blue/80">
                <Link to="/login" className="flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (passwordReset) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md animate-fade-in-up border-border shadow-card">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green/20 p-3 animate-scale-in">
                <CheckCircle2 className="h-8 w-8 text-green" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Password Reset Successful</CardTitle>
            <CardDescription>
              Your password has been successfully updated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              You can now sign in with your new password.
            </p>
            <Button 
              asChild 
              className="w-full bg-yellow text-background hover:bg-yellow/90 btn-hover"
            >
              <Link to="/login" className="flex items-center justify-center gap-2">
                Continue to Login
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md animate-fade-in-up border-border shadow-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Set New Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password below. Make sure it's strong and secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  className="pl-10 pr-10 focus-ring"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {password && <PasswordStrengthMeter password={password} />}
              {errors.password && (
                <p className="text-sm text-status-high flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  className="pl-10 pr-10 focus-ring"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-status-high flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-yellow text-background hover:bg-yellow/90 btn-hover"
              disabled={isLoading || !isValidToken}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button asChild variant="ghost" className="text-blue hover:text-blue/80">
              <Link to="/login" className="flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
