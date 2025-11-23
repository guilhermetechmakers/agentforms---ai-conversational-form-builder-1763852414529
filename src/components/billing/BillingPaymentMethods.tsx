import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Wallet, Plus, Trash2, Star, Loader2 } from "lucide-react"
import {
  usePaymentMethods,
  useSetDefaultPaymentMethod,
  useDeletePaymentMethod,
} from "@/hooks/useBilling"
import { AddPaymentMethodForm } from "./AddPaymentMethodForm"

export function BillingPaymentMethods() {
  const { data: paymentMethods, isLoading } = usePaymentMethods()
  const setDefault = useSetDefaultPaymentMethod()
  const deleteMethod = useDeletePaymentMethod()
  const [showAddDialog, setShowAddDialog] = useState(false)

  const getCardIcon = (brand: string | null) => {
    const brandLower = brand?.toLowerCase() || ""
    if (brandLower.includes("visa")) return "💳"
    if (brandLower.includes("mastercard")) return "💳"
    if (brandLower.includes("amex") || brandLower.includes("american")) return "💳"
    return "💳"
  }

  const formatExpiry = (month: number | null, year: number | null) => {
    if (!month || !year) return "—"
    return `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-[#303136] bg-[#282A30]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-[#F3F4F6]">
                <Wallet className="h-5 w-5 text-[#F6D365]" />
                Payment Methods
              </CardTitle>
              <CardDescription className="text-[#A1A1AA]">
                Manage your payment methods and billing information
              </CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#282A30] border-[#303136]">
                <DialogHeader>
                  <DialogTitle className="text-[#F3F4F6]">Add Payment Method</DialogTitle>
                  <DialogDescription className="text-[#A1A1AA]">
                    Add a new credit card or payment method
                  </DialogDescription>
                </DialogHeader>
                <AddPaymentMethodForm
                  onSuccess={() => setShowAddDialog(false)}
                  onCancel={() => setShowAddDialog(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {paymentMethods && paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="p-4 rounded-xl bg-[#24262C] border border-[#303136] hover:border-[#60A5FA]/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-16 rounded-lg bg-[#282A30] border border-[#303136] flex items-center justify-center text-2xl">
                        {getCardIcon(method.card_brand)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[#F3F4F6]">
                            {method.card_brand
                              ? `${method.card_brand.charAt(0).toUpperCase()}${method.card_brand.slice(1)}`
                              : method.type.charAt(0).toUpperCase() + method.type.slice(1)}
                            {" •••• "}
                            {method.card_last4 || method.bank_account_last4 || "****"}
                          </h3>
                          {method.is_default && (
                            <Badge className="bg-[#F6D365] text-[#22242A]">
                              <Star className="h-3 w-3 mr-1" />
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#A1A1AA] mt-1">
                          {method.type === "card"
                            ? `Expires ${formatExpiry(method.card_exp_month, method.card_exp_year)}`
                            : method.bank_name || "Bank Account"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!method.is_default && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDefault.mutate(method.id)}
                          disabled={setDefault.isPending}
                          className="text-[#60A5FA] hover:text-[#60A5FA]/80 hover:bg-[#24262C]"
                        >
                          {setDefault.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Set Default"
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("Are you sure you want to remove this payment method?")) {
                            deleteMethod.mutate(method.id)
                          }
                        }}
                        disabled={deleteMethod.isPending || method.is_default}
                        className="text-[#F87171] hover:text-[#F87171]/80 hover:bg-[#24262C]"
                      >
                        {deleteMethod.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Wallet className="h-12 w-12 text-[#A1A1AA] mx-auto mb-4" />
              <p className="text-[#A1A1AA] mb-2">No payment methods</p>
              <p className="text-sm text-[#6B7280] mb-4">
                Add a payment method to enable subscriptions and billing
              </p>
              <Button
                className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
