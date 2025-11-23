import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAddPaymentMethod } from "@/hooks/useBilling"
import { Loader2 } from "lucide-react"

const paymentMethodSchema = z.object({
  cardNumber: z.string().min(13, "Card number must be at least 13 digits"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)"),
  cvv: z.string().min(3, "CVV must be at least 3 digits").max(4, "CVV must be at most 4 digits"),
  cardholderName: z.string().min(2, "Cardholder name is required"),
  isDefault: z.boolean().default(false),
})

type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>

interface AddPaymentMethodFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function AddPaymentMethodForm({ onSuccess, onCancel }: AddPaymentMethodFormProps) {
  const addPaymentMethod = useAddPaymentMethod()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema),
  })

  const onSubmit = async (data: PaymentMethodFormData) => {
    // In a real implementation, this would use Stripe Elements to create a payment method
    // For now, we'll create a mock payment method
    const [month, year] = data.expiryDate.split("/")
    const expiryYear = 2000 + parseInt(year, 10)

    try {
      await addPaymentMethod.mutateAsync({
        user_id: "", // Will be set by backend
        type: "card",
        card_brand: "visa", // Would be determined from card number
        card_last4: data.cardNumber.slice(-4),
        card_exp_month: parseInt(month, 10),
        card_exp_year: expiryYear,
        is_default: data.isDefault,
        stripe_payment_method_id: `pm_mock_${Date.now()}`, // Mock ID
        billing_address: {},
      })
      onSuccess()
    } catch (error) {
      // Error handled by hook
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardNumber" className="text-[#F3F4F6]">
          Card Number
        </Label>
        <Input
          id="cardNumber"
          placeholder="1234 5678 9012 3456"
          {...register("cardNumber")}
          className="bg-[#24262C] border-[#303136] text-[#F3F4F6] focus:border-[#60A5FA]"
        />
        {errors.cardNumber && (
          <p className="text-sm text-[#F87171]">{errors.cardNumber.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiryDate" className="text-[#F3F4F6]">
            Expiry Date
          </Label>
          <Input
            id="expiryDate"
            placeholder="MM/YY"
            {...register("expiryDate")}
            className="bg-[#24262C] border-[#303136] text-[#F3F4F6] focus:border-[#60A5FA]"
          />
          {errors.expiryDate && (
            <p className="text-sm text-[#F87171]">{errors.expiryDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cvv" className="text-[#F3F4F6]">
            CVV
          </Label>
          <Input
            id="cvv"
            type="password"
            placeholder="123"
            {...register("cvv")}
            className="bg-[#24262C] border-[#303136] text-[#F3F4F6] focus:border-[#60A5FA]"
          />
          {errors.cvv && (
            <p className="text-sm text-[#F87171]">{errors.cvv.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardholderName" className="text-[#F3F4F6]">
          Cardholder Name
        </Label>
        <Input
          id="cardholderName"
          placeholder="John Doe"
          {...register("cardholderName")}
          className="bg-[#24262C] border-[#303136] text-[#F3F4F6] focus:border-[#60A5FA]"
        />
        {errors.cardholderName && (
          <p className="text-sm text-[#F87171]">{errors.cardholderName.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isDefault"
          {...register("isDefault")}
          className="rounded border-[#303136] bg-[#24262C] text-[#60A5FA] focus:ring-[#60A5FA]"
        />
        <Label htmlFor="isDefault" className="text-[#A1A1AA] cursor-pointer">
          Set as default payment method
        </Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-[#303136] text-[#F3F4F6] hover:bg-[#24262C]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={addPaymentMethod.isPending}
          className="flex-1 bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
        >
          {addPaymentMethod.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Payment Method"
          )}
        </Button>
      </div>
    </form>
  )
}
