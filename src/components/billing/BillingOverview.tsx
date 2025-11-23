import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Loader2,
} from "lucide-react"
import { useSubscription, usePlans, useUsageSummary } from "@/hooks/useBilling"
import { format } from "date-fns"
import { PlanChangeModal } from "./PlanChangeModal"
import { useState } from "react"

export function BillingOverview() {
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription()
  const { data: plans, isLoading: plansLoading } = usePlans()
  const { data: usageSummary, isLoading: usageLoading } = useUsageSummary()
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false)

  const isLoading = subscriptionLoading || plansLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentPlan = plans?.find((p) => p.id === subscription?.plan_id)
  const isActive = subscription?.status === "active"
  const isCanceled = subscription?.status === "canceled"
  const isPastDue = subscription?.status === "past_due"

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card className="border-[#303136] bg-[#282A30]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-[#F3F4F6]">
                <CreditCard className="h-5 w-5 text-[#F6D365]" />
                Current Subscription
              </CardTitle>
              <CardDescription className="text-[#A1A1AA]">
                Your active subscription and billing details
              </CardDescription>
            </div>
            {isActive && (
              <Badge className="bg-[#4ADE80] text-[#22242A] hover:bg-[#4ADE80]/90">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
            {isCanceled && (
              <Badge className="bg-[#F87171] text-white hover:bg-[#F87171]/90">
                <AlertCircle className="h-3 w-3 mr-1" />
                Canceled
              </Badge>
            )}
            {isPastDue && (
              <Badge className="bg-[#FBBF24] text-[#22242A] hover:bg-[#FBBF24]/90">
                <AlertCircle className="h-3 w-3 mr-1" />
                Past Due
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {subscription && currentPlan ? (
            <>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#F3F4F6]">{currentPlan.name}</h3>
                  <p className="text-[#A1A1AA] mt-1">{currentPlan.description || "No description"}</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-[#A1A1AA]" />
                      <span className="text-[#A1A1AA]">Billing Period:</span>
                      <span className="text-[#F3F4F6] font-medium capitalize">
                        {subscription.billing_period}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-[#A1A1AA]" />
                      <span className="text-[#A1A1AA]">Next Billing Date:</span>
                      <span className="text-[#F3F4F6] font-medium">
                        {format(new Date(subscription.current_period_end), "MMM dd, yyyy")}
                      </span>
                    </div>
                    {subscription.cancel_at_period_end && (
                      <div className="flex items-center gap-2 text-sm text-[#FBBF24]">
                        <AlertCircle className="h-4 w-4" />
                        <span>Subscription will cancel at period end</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right ml-6">
                  <div className="text-2xl font-bold text-[#F3F4F6]">
                    $
                    {subscription.billing_period === "monthly"
                      ? currentPlan.price_monthly.toFixed(2)
                      : (currentPlan.price_yearly || currentPlan.price_monthly * 12).toFixed(2)}
                  </div>
                  <div className="text-sm text-[#A1A1AA]">
                    per {subscription.billing_period === "monthly" ? "month" : "year"}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#303136]">
                <Button
                  onClick={() => setShowPlanChangeModal(true)}
                  className="bg-[#60A5FA] text-white hover:bg-[#60A5FA]/90"
                >
                  Change Plan
                </Button>
                <Button
                  variant="outline"
                  className="border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
                  asChild
                >
                  <Link to="/checkout">
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Upgrade
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#A1A1AA] mb-4">No active subscription</p>
              <Button
                className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
                asChild
              >
                <Link to="/checkout">Choose a Plan</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Summary */}
      {usageSummary && (
        <Card className="border-[#303136] bg-[#282A30]">
          <CardHeader>
            <CardTitle className="text-[#F3F4F6]">Current Usage</CardTitle>
            <CardDescription className="text-[#A1A1AA]">
              Usage for current billing cycle
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usageLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#A1A1AA]" />
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(usageSummary.metrics).map(([key, value]) => {
                  const limit = usageSummary.quota_limits[key] || 0
                  const percentage = limit > 0 ? (value / limit) * 100 : 0
                  const isOverLimit = percentage > 100

                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#A1A1AA] capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className={`font-medium ${isOverLimit ? "text-[#F87171]" : "text-[#F3F4F6]"}`}>
                          {value.toLocaleString()} / {limit > 0 ? limit.toLocaleString() : "∞"}
                        </span>
                      </div>
                      <div className="w-full bg-[#24262C] rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOverLimit
                              ? "bg-[#F87171]"
                              : percentage > 80
                              ? "bg-[#FBBF24]"
                              : "bg-[#4ADE80]"
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      {percentage > 80 && (
                        <p className="text-xs text-[#A1A1AA]">
                          {isOverLimit
                            ? "You've exceeded your limit. Please upgrade your plan."
                            : "You're approaching your limit. Consider upgrading."}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Plan Change Modal */}
      {showPlanChangeModal && subscription && (
        <PlanChangeModal
          currentSubscription={subscription}
          plans={plans || []}
          open={showPlanChangeModal}
          onOpenChange={setShowPlanChangeModal}
        />
      )}
    </div>
  )
}
