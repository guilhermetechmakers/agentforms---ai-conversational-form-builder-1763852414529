import { useEffect } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { useTransaction } from "@/hooks/useBilling"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function CheckoutSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const transactionId = searchParams.get("transaction_id") || ""

  const { data: transaction, isLoading } = useTransaction(transactionId)

  useEffect(() => {
    if (!transactionId) {
      toast.error("Invalid transaction ID")
      navigate("/checkout", { replace: true })
    }
  }, [transactionId, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#22242A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#F6D365] mx-auto mb-4" />
          <p className="text-[#A1A1AA]">Loading transaction details...</p>
        </div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-[#22242A] flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-[#F87171]">Transaction Not Found</CardTitle>
            <CardDescription>
              The transaction could not be found. Please contact support if you believe this is an error.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isSuccess = transaction.status === "succeeded"

  return (
    <div className="min-h-screen bg-[#22242A] flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl animate-fade-in-up">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-[#4ADE80]/20 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-[#4ADE80]" />
          </div>
          <CardTitle className="text-3xl text-[#F3F4F6]">
            {isSuccess ? "Payment Successful!" : "Payment Processing"}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {isSuccess
              ? "Thank you for your purchase. Your subscription is now active."
              : "Your payment is being processed. You'll receive a confirmation email shortly."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Transaction Details */}
          <div className="rounded-xl bg-[#24262C] p-6 space-y-4 border border-[#303136]">
            <h3 className="font-semibold text-[#F3F4F6] mb-4">Transaction Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#A1A1AA] mb-1">Transaction ID</p>
                <p className="text-[#F3F4F6] font-mono text-xs">{transaction.id}</p>
              </div>
              <div>
                <p className="text-[#A1A1AA] mb-1">Status</p>
                <p
                  className={cn(
                    "font-medium",
                    isSuccess ? "text-[#4ADE80]" : "text-[#FBBF24]"
                  )}
                >
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-[#A1A1AA] mb-1">Amount</p>
                <p className="text-[#F3F4F6] font-semibold">
                  ${transaction.amount.toFixed(2)} {transaction.currency}
                </p>
              </div>
              <div>
                <p className="text-[#A1A1AA] mb-1">Date</p>
                <p className="text-[#F3F4F6]">
                  {new Date(transaction.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              {transaction.discount_amount > 0 && (
                <div>
                  <p className="text-[#A1A1AA] mb-1">Discount</p>
                  <p className="text-[#4ADE80] font-medium">
                    -${transaction.discount_amount.toFixed(2)}
                  </p>
                </div>
              )}
              {transaction.tax_amount > 0 && (
                <div>
                  <p className="text-[#A1A1AA] mb-1">Tax</p>
                  <p className="text-[#F3F4F6]">${transaction.tax_amount.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Download */}
          {transaction.stripe_invoice_id && (
            <div className="rounded-xl bg-[#24262C] p-4 border border-[#303136]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#F3F4F6]">Invoice Available</p>
                  <p className="text-sm text-[#A1A1AA] mt-1">
                    Download your invoice for your records
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    // In real implementation, this would download the invoice
                    toast.info("Invoice download will be available after backend integration")
                  }}
                  className="shrink-0"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoice
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              asChild
              className="flex-1 bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
            >
              <Link to="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/settings")}
              className="flex-1"
            >
              Manage Subscription
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center pt-4 border-t border-[#303136]">
            <p className="text-sm text-[#A1A1AA]">
              Need help?{" "}
              <Link to="/help" className="text-[#60A5FA] hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
