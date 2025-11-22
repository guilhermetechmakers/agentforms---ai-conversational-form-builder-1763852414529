import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Lock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// Payment form schema
const paymentFormSchema = z.object({
  cardNumber: z.string().min(13, "Card number must be at least 13 digits").max(19, "Card number must be at most 19 digits"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)"),
  cvv: z.string().min(3, "CVV must be at least 3 digits").max(4, "CVV must be at most 4 digits"),
  cardholderName: z.string().min(2, "Cardholder name is required"),
  billingName: z.string().min(2, "Billing name is required"),
  billingEmail: z.string().email("Invalid email address"),
  billingLine1: z.string().min(5, "Address line 1 is required"),
  billingLine2: z.string().optional(),
  billingCity: z.string().min(2, "City is required"),
  billingState: z.string().optional(),
  billingPostalCode: z.string().min(3, "Postal code is required"),
  billingCountry: z.string().min(2, "Country is required"),
  vatNumber: z.string().optional(),
})

export type PaymentFormData = z.infer<typeof paymentFormSchema>

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => Promise<void>
  isLoading?: boolean
  error?: string | null
}

export function PaymentForm({ onSubmit, isLoading = false, error }: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      billingCountry: "US",
    },
  })

  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  // Format expiry date (MM/YY)
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  // Format CVV (numbers only)
  const formatCvv = (value: string) => {
    return value.replace(/\D/g, "").substring(0, 4)
  }

  const onFormSubmit = async (data: PaymentFormData) => {
    // In a real implementation, this would use Stripe Elements
    // For now, we'll pass the data as-is
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Payment Method Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#F6D365]" />
            Payment Method
          </CardTitle>
          <CardDescription>Enter your card details securely</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                value={cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value)
                  setCardNumber(formatted)
                  register("cardNumber").onChange(e)
                }}
                className={cn(
                  errors.cardNumber && "border-[#F87171] focus-visible:ring-[#F87171]"
                )}
              />
              <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
            </div>
            {errors.cardNumber && (
              <p className="text-sm text-[#F87171] flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.cardNumber.message}
              </p>
            )}
          </div>

          {/* Card Details Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="text"
                placeholder="MM/YY"
                maxLength={5}
                value={expiryDate}
                onChange={(e) => {
                  const formatted = formatExpiryDate(e.target.value)
                  setExpiryDate(formatted)
                  register("expiryDate").onChange(e)
                }}
                className={cn(
                  errors.expiryDate && "border-[#F87171] focus-visible:ring-[#F87171]"
                )}
              />
              {errors.expiryDate && (
                <p className="text-sm text-[#F87171] flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.expiryDate.message}
                </p>
              )}
            </div>

            {/* CVV */}
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                maxLength={4}
                value={cvv}
                onChange={(e) => {
                  const formatted = formatCvv(e.target.value)
                  setCvv(formatted)
                  register("cvv").onChange(e)
                }}
                className={cn(
                  errors.cvv && "border-[#F87171] focus-visible:ring-[#F87171]"
                )}
              />
              {errors.cvv && (
                <p className="text-sm text-[#F87171] flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.cvv.message}
                </p>
              )}
            </div>
          </div>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              type="text"
              placeholder="John Doe"
              {...register("cardholderName")}
              className={cn(
                errors.cardholderName && "border-[#F87171] focus-visible:ring-[#F87171]"
              )}
            />
            {errors.cardholderName && (
              <p className="text-sm text-[#F87171] flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.cardholderName.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing Address Section */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
          <CardDescription>Enter your billing information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="billingName">Full Name</Label>
            <Input
              id="billingName"
              type="text"
              placeholder="John Doe"
              {...register("billingName")}
              className={cn(
                errors.billingName && "border-[#F87171] focus-visible:ring-[#F87171]"
              )}
            />
            {errors.billingName && (
              <p className="text-sm text-[#F87171] flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.billingName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="billingEmail">Email</Label>
            <Input
              id="billingEmail"
              type="email"
              placeholder="john@example.com"
              {...register("billingEmail")}
              className={cn(
                errors.billingEmail && "border-[#F87171] focus-visible:ring-[#F87171]"
              )}
            />
            {errors.billingEmail && (
              <p className="text-sm text-[#F87171] flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.billingEmail.message}
              </p>
            )}
          </div>

          {/* Address Line 1 */}
          <div className="space-y-2">
            <Label htmlFor="billingLine1">Address Line 1</Label>
            <Input
              id="billingLine1"
              type="text"
              placeholder="123 Main St"
              {...register("billingLine1")}
              className={cn(
                errors.billingLine1 && "border-[#F87171] focus-visible:ring-[#F87171]"
              )}
            />
            {errors.billingLine1 && (
              <p className="text-sm text-[#F87171] flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.billingLine1.message}
              </p>
            )}
          </div>

          {/* Address Line 2 */}
          <div className="space-y-2">
            <Label htmlFor="billingLine2">Address Line 2 (Optional)</Label>
            <Input
              id="billingLine2"
              type="text"
              placeholder="Apt 4B"
              {...register("billingLine2")}
            />
          </div>

          {/* City, State, Postal Code Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingCity">City</Label>
              <Input
                id="billingCity"
                type="text"
                placeholder="New York"
                {...register("billingCity")}
                className={cn(
                  errors.billingCity && "border-[#F87171] focus-visible:ring-[#F87171]"
                )}
              />
              {errors.billingCity && (
                <p className="text-sm text-[#F87171] flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.billingCity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingState">State/Province</Label>
              <Input
                id="billingState"
                type="text"
                placeholder="NY"
                {...register("billingState")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingPostalCode">Postal Code</Label>
              <Input
                id="billingPostalCode"
                type="text"
                placeholder="10001"
                {...register("billingPostalCode")}
                className={cn(
                  errors.billingPostalCode && "border-[#F87171] focus-visible:ring-[#F87171]"
                )}
              />
              {errors.billingPostalCode && (
                <p className="text-sm text-[#F87171] flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.billingPostalCode.message}
                </p>
              )}
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="billingCountry">Country</Label>
            <Input
              id="billingCountry"
              type="text"
              placeholder="United States"
              {...register("billingCountry")}
              className={cn(
                errors.billingCountry && "border-[#F87171] focus-visible:ring-[#F87171]"
              )}
            />
            {errors.billingCountry && (
              <p className="text-sm text-[#F87171] flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.billingCountry.message}
              </p>
            )}
          </div>

          {/* VAT Number */}
          <div className="space-y-2">
            <Label htmlFor="vatNumber">VAT Number (Optional)</Label>
            <Input
              id="vatNumber"
              type="text"
              placeholder="GB123456789"
              {...register("vatNumber")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl bg-[#282A30] border border-[#F87171] p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#F87171] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#F87171]">Payment Error</p>
            <p className="text-sm text-[#A1A1AA] mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90 h-12 text-base font-semibold"
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting || isLoading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-[#22242A] border-t-transparent" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Complete Payment
          </>
        )}
      </Button>
    </form>
  )
}
