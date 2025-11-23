import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  Download,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  Calendar,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { billingApi } from "@/api/billing"
import { format } from "date-fns"

export function BillingPlanSection() {
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => billingApi.getSubscription(),
  })

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => billingApi.getTransactions(),
  })

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => billingApi.getPlans(),
  })

  const isLoading = subscriptionLoading || transactionsLoading || plansLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#A1A1AA]" />
      </div>
    )
  }

  const currentPlan = plans?.find((p) => p.id === subscription?.plan_id)
  const isActive = subscription?.status === "active"

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Plan
              </CardTitle>
              <CardDescription>Your active subscription and billing details</CardDescription>
            </div>
            {isActive && (
              <Badge className="bg-[#4ADE80] text-[#22242A]">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {subscription && currentPlan ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-[#F3F4F6]">{currentPlan.name}</h3>
                  <p className="text-[#A1A1AA] mt-1">{currentPlan.description}</p>
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
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#F3F4F6]">
                    ${subscription.billing_period === "monthly" 
                      ? currentPlan.price_monthly 
                      : currentPlan.price_yearly || currentPlan.price_monthly * 12}
                  </div>
                  <div className="text-sm text-[#A1A1AA]">
                    per {subscription.billing_period === "monthly" ? "month" : "year"}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#303136]">
                <Button
                  asChild
                  className="bg-[#60A5FA] hover:bg-[#60A5FA]/90 text-white"
                >
                  <Link to="/checkout">
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Link>
                </Button>
                {subscription.cancel_at_period_end ? (
                  <Badge variant="outline" className="text-[#FBBF24] border-[#FBBF24]">
                    Cancels at period end
                  </Badge>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Handle cancellation
                      if (confirm("Are you sure you want to cancel your subscription?")) {
                        // Call cancel API
                      }
                    }}
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#A1A1AA] mb-4">No active subscription</p>
              <Button asChild className="bg-[#F6D365] hover:bg-[#F6D365]/90 text-[#22242A]">
                <Link to="/checkout">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Choose a Plan
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>View and download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-[#303136] bg-[#24262C] hover:bg-[#282A30] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-[#282A30]">
                      <CreditCard className="h-5 w-5 text-[#60A5FA]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#F3F4F6]">
                        {format(new Date(transaction.created_at), "MMM dd, yyyy")}
                      </div>
                      <div className="text-sm text-[#A1A1AA]">
                        {transaction.status === "succeeded" ? "Paid" : transaction.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold text-[#F3F4F6]">
                        ${transaction.amount.toFixed(2)} {transaction.currency}
                      </div>
                      {transaction.discount_amount > 0 && (
                        <div className="text-xs text-[#A1A1AA]">
                          Discount: ${transaction.discount_amount.toFixed(2)}
                        </div>
                      )}
                    </div>
                    {transaction.stripe_invoice_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Download invoice
                          window.open(`/api/billing/invoices/${transaction.stripe_invoice_id}/download`, "_blank")
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#A1A1AA]">No invoices yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
