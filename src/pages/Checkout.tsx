import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { usePlans, usePlan, useInvoicePreview, useValidateCoupon, useCreateCheckout } from "@/hooks/useBilling"
import { PaymentForm } from "@/components/billing/PaymentForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Check, X, Tag, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { PaymentFormData } from "@/components/billing/PaymentForm"

export default function Checkout() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const planId = searchParams.get("plan_id") || ""
  const billingPeriod = (searchParams.get("billing_period") || "monthly") as "monthly" | "yearly"
  const urlCoupon = searchParams.get("coupon")

  const { data: plans, isLoading: plansLoading } = usePlans()
  const { data: plan, isLoading: planLoading } = usePlan(planId)
  const { data: invoicePreview, isLoading: invoiceLoading } = useInvoicePreview(
    planId,
    billingPeriod,
    urlCoupon || undefined
  )

  const [couponCode, setCouponCode] = useState(urlCoupon || "")
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(urlCoupon)
  const [tosAccepted, setTosAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateCoupon = useValidateCoupon()
  const createCheckout = useCreateCheckout()

  // Auto-select plan from URL or default to first plan
  useEffect(() => {
    if (!planId && plans && plans.length > 0) {
      navigate(`/checkout?plan_id=${plans[0].id}&billing_period=${billingPeriod}`, { replace: true })
    }
  }, [planId, plans, billingPeriod, navigate])

  const handleCouponApply = async () => {
    if (!couponCode.trim() || !planId || !invoicePreview) return

    try {
      const result = await validateCoupon.mutateAsync({
        code: couponCode.trim(),
        planId,
        amount: invoicePreview.subtotal,
      })

      if (result.valid && result.coupon) {
        setAppliedCoupon(couponCode.trim())
        toast.success(`Coupon "${couponCode}" applied!`)
        // Refresh invoice preview with coupon
        navigate(
          `/checkout?plan_id=${planId}&billing_period=${billingPeriod}&coupon=${couponCode.trim()}`,
          { replace: true }
        )
      } else {
        toast.error(result.error || "Invalid coupon code")
        setAppliedCoupon(null)
      }
    } catch (err) {
      toast.error("Failed to validate coupon")
      setAppliedCoupon(null)
    }
  }

  const handleCouponRemove = () => {
    setCouponCode("")
    setAppliedCoupon(null)
    navigate(`/checkout?plan_id=${planId}&billing_period=${billingPeriod}`, { replace: true })
  }

  const handlePaymentSubmit = async (data: PaymentFormData) => {
    if (!planId || !tosAccepted) {
      setError("Please accept the Terms of Service to continue")
      return
    }

    setError(null)

    try {
      const response = await createCheckout.mutateAsync({
        plan_id: planId,
        billing_period: billingPeriod,
        coupon_code: appliedCoupon || null,
        billing_address: {
          name: data.billingName,
          email: data.billingEmail,
          line1: data.billingLine1,
          line2: data.billingLine2 || undefined,
          city: data.billingCity,
          state: data.billingState || undefined,
          postal_code: data.billingPostalCode,
          country: data.billingCountry,
        },
        vat_number: data.vatNumber || null,
        payment_method_id: "pm_mock", // In real implementation, this would come from Stripe Elements
      })

      if (response.status === "succeeded" || response.status === "pending") {
        navigate(`/checkout/success?transaction_id=${response.transaction_id}`)
      } else {
        setError("Payment processing failed. Please try again.")
      }
    } catch (err: any) {
      setError(err.message || "Payment processing failed. Please try again.")
    }
  }

  const isLoading = planLoading || invoiceLoading || plansLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#22242A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#F6D365] mx-auto mb-4" />
          <p className="text-[#A1A1AA]">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (!plan || !invoicePreview) {
    return (
      <div className="min-h-screen bg-[#22242A] flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#F87171]">
              <AlertCircle className="h-5 w-5" />
              Plan Not Found
            </CardTitle>
            <CardDescription>
              The selected plan could not be found. Please select a plan from the pricing page.
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

  const price = billingPeriod === "monthly" ? plan.price_monthly : plan.price_yearly || plan.price_monthly * 12

  return (
    <div className="min-h-screen bg-[#22242A] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-[#F3F4F6] mb-2">Checkout</h1>
          <p className="text-[#A1A1AA]">Complete your purchase securely</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Payment Form */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in-up">
            <PaymentForm
              onSubmit={handlePaymentSubmit}
              isLoading={createCheckout.isPending}
              error={error}
            />
          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-6 animate-fade-in-up lg:animate-fade-in-up lg:animation-delay-100">
            {/* Plan Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your plan and pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Plan Details */}
                <div className="space-y-2 pb-4 border-b border-[#303136]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-[#F3F4F6]">{plan.name}</h3>
                      <p className="text-sm text-[#A1A1AA] mt-1">
                        {billingPeriod === "monthly" ? "Monthly billing" : "Yearly billing"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#F3F4F6]">
                        ${price.toFixed(2)}
                        <span className="text-sm text-[#A1A1AA]">/{billingPeriod === "monthly" ? "mo" : "yr"}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                {plan.features && typeof plan.features === "object" && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#F3F4F6] mb-2">Features:</p>
                    <ul className="space-y-2">
                      {Object.entries(plan.features).map(([key, value]) => (
                        <li key={key} className="flex items-start gap-2 text-sm text-[#A1A1AA]">
                          <Check className="h-4 w-4 text-[#4ADE80] flex-shrink-0 mt-0.5" />
                          <span>{String(value)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Limits */}
                {plan.limits && typeof plan.limits === "object" && (
                  <div className="space-y-2 pt-2 border-t border-[#303136]">
                    <p className="text-sm font-medium text-[#F3F4F6] mb-2">Limits:</p>
                    <ul className="space-y-2">
                      {Object.entries(plan.limits).map(([key, value]) => (
                        <li key={key} className="flex items-start gap-2 text-sm text-[#A1A1AA]">
                          <Check className="h-4 w-4 text-[#4ADE80] flex-shrink-0 mt-0.5" />
                          <span>
                            {key}: {String(value)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Coupon Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#F6D365]" />
                  Coupon Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#24262C] border border-[#4ADE80]">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#4ADE80]" />
                      <span className="text-sm font-medium text-[#F3F4F6]">{appliedCoupon}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCouponRemove}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleCouponApply()
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleCouponApply}
                        disabled={!couponCode.trim() || validateCoupon.isPending}
                        variant="outline"
                        className="shrink-0"
                      >
                        {validateCoupon.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoice Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[#A1A1AA]">
                    <span>Subtotal</span>
                    <span>${invoicePreview.subtotal.toFixed(2)}</span>
                  </div>
                  {invoicePreview.discount_amount > 0 && (
                    <div className="flex justify-between text-[#4ADE80]">
                      <span>Discount</span>
                      <span>-${invoicePreview.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  {invoicePreview.tax_amount > 0 && (
                    <div className="flex justify-between text-[#A1A1AA]">
                      <span>Tax</span>
                      <span>${invoicePreview.tax_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-[#303136]">
                    <div className="flex justify-between font-semibold text-[#F3F4F6]">
                      <span>Total</span>
                      <span>${invoicePreview.total.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-[#A1A1AA] mt-1">
                      {billingPeriod === "monthly" ? "Billed monthly" : "Billed annually"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms of Service */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="tos"
                    checked={tosAccepted}
                    onCheckedChange={(checked) => setTosAccepted(checked === true)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="tos"
                    className="text-sm text-[#A1A1AA] cursor-pointer leading-relaxed"
                  >
                    I agree to the{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#60A5FA] hover:underline"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#60A5FA] hover:underline"
                    >
                      Privacy Policy
                    </a>
                  </Label>
                </div>
                {!tosAccepted && createCheckout.isPending && (
                  <p className="text-xs text-[#F87171] mt-2 ml-7">
                    Please accept the Terms of Service to continue
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
