import { cn } from "@/lib/utils"

interface PasswordStrengthMeterProps {
  password: string
  className?: string
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  if (!password) return null

  const getPasswordStrength = (pwd: string) => {
    let strength = 0
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    }

    if (checks.length) strength++
    if (checks.uppercase) strength++
    if (checks.lowercase) strength++
    if (checks.number) strength++
    if (checks.special) strength++

    if (strength <= 2) {
      return {
        strength,
        label: "Weak",
        color: "bg-status-high",
        percentage: (strength / 5) * 100,
      }
    }
    if (strength <= 3) {
      return {
        strength,
        label: "Fair",
        color: "bg-status-medium",
        percentage: (strength / 5) * 100,
      }
    }
    if (strength <= 4) {
      return {
        strength,
        label: "Good",
        color: "bg-green",
        percentage: (strength / 5) * 100,
      }
    }
    return {
      strength,
      label: "Strong",
      color: "bg-green",
      percentage: 100,
    }
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-card rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300 rounded-full",
              passwordStrength.color
            )}
            style={{ width: `${passwordStrength.percentage}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium min-w-[50px] text-right">
          {passwordStrength.label}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              password.length >= 8 ? "bg-green" : "bg-border"
            )}
          />
          <span>8+ characters</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              /[A-Z]/.test(password) ? "bg-green" : "bg-border"
            )}
          />
          <span>Uppercase</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              /[a-z]/.test(password) ? "bg-green" : "bg-border"
            )}
          />
          <span>Lowercase</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              /[0-9]/.test(password) ? "bg-green" : "bg-border"
            )}
          />
          <span>Number</span>
        </div>
      </div>
    </div>
  )
}
