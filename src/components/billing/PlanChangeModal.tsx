import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check } from "lucide-react"
import { useChangePlan } from "@/hooks/useBilling"
import type { Subscription, Plan, PlanChangeRequest } from "@/types/billing"

interface PlanChangeModalProps {
  currentSubscription: Subscription
  plans: Plan[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlanChangeModal({
  currentSubscription,
  plans,
  open,
  onOpenChange,
}: PlanChangeModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>("")
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    currentSubscription.billing_period
  )
  const changePlan = useChangePlan()

  const currentPlan = plans.find((p) => p.id === currentSubscription.plan_id)
  const selectedPlan = plans.find((p) => p.id === selectedPlanId)

  const handleChangePlan = async () => {
    if (!selectedPlanId) return

    const request: PlanChangeRequest = {
      new_plan_id: selectedPlanId,
      billing_period: billingPeriod,
      effective_date: "end_of_period", // Change at end of current period
      prorate: true,
    }

    try {
      await changePlan.mutateAsync(request)
      onOpenChange(false)
    } catch (error) {
      // Error handled by hook
    }
  }

  const availablePlans = plans.filter((p) => p.is_active && p.id !== currentSubscription.plan_id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#282A30] border-[#303136] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#F3F4F6]">Change Subscription Plan</DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            Select a new plan and billing period. Changes will take effect at the end of your
            current billing period.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Plan */}
          <div className="p-4 rounded-xl bg-[#24262C] border border-[#303136]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#A1A1AA] mb-1">Current Plan</p>
                <p className="font-semibold text-[#F3F4F6]">{currentPlan?.name || "Unknown"}</p>
              </div>
              <Badge className="bg-[#4ADE80] text-[#22242A]">Active</Badge>
            </div>
          </div>

          {/* Billing Period */}
          <div className="space-y-3">
            <Label className="text-[#F3F4F6]">Billing Period</Label>
            <RadioGroup
              value={billingPeriod}
              onValueChange={(value) => setBillingPeriod(value as "monthly" | "yearly")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly" className="text-[#A1A1AA] cursor-pointer">
                  Monthly
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yearly" id="yearly" />
                <Label htmlFor="yearly" className="text-[#A1A1AA] cursor-pointer">
                  Yearly
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Plan Selection */}
          <div className="space-y-3">
            <Label className="text-[#F3F4F6]">Select New Plan</Label>
            <RadioGroup value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <div className="space-y-3">
                {availablePlans.map((plan) => {
                  const price =
                    billingPeriod === "monthly"
                      ? plan.price_monthly
                      : plan.price_yearly || plan.price_monthly * 12

                  return (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                        selectedPlanId === plan.id
                          ? "border-[#60A5FA] bg-[#24262C]"
                          : "border-[#303136] bg-[#24262C] hover:border-[#60A5FA]/50"
                      }`}
                      onClick={() => setSelectedPlanId(plan.id)}
                    >
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <Label
                              htmlFor={plan.id}
                              className="text-lg font-semibold text-[#F3F4F6] cursor-pointer"
                            >
                              {plan.name}
                            </Label>
                            <div className="text-right">
                              <span className="text-xl font-bold text-[#F3F4F6]">
                                ${price.toFixed(2)}
                              </span>
                              <span className="text-sm text-[#A1A1AA] ml-1">
                                /{billingPeriod === "monthly" ? "mo" : "yr"}
                              </span>
                            </div>
                          </div>
                          {plan.description && (
                            <p className="text-sm text-[#A1A1AA] mb-3">{plan.description}</p>
                          )}
                          {plan.features && typeof plan.features === "object" && (
                            <div className="space-y-1">
                              {Object.entries(plan.features).slice(0, 3).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2 text-sm">
                                  <Check className="h-4 w-4 text-[#4ADE80] flex-shrink-0" />
                                  <span className="text-[#A1A1AA]">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Price Comparison */}
          {selectedPlan && (
            <div className="p-4 rounded-xl bg-[#24262C] border border-[#303136]">
              <p className="text-sm text-[#A1A1AA] mb-2">New Plan Cost</p>
              <p className="text-2xl font-bold text-[#F3F4F6]">
                $
                {billingPeriod === "monthly"
                  ? selectedPlan.price_monthly.toFixed(2)
                  : (selectedPlan.price_yearly || selectedPlan.price_monthly * 12).toFixed(2)}
                <span className="text-base font-normal text-[#A1A1AA] ml-1">
                  /{billingPeriod === "monthly" ? "month" : "year"}
                </span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleChangePlan}
            disabled={!selectedPlanId || changePlan.isPending}
            className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
          >
            {changePlan.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Change Plan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
