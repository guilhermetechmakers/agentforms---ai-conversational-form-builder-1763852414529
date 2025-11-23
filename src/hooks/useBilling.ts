import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { billingApi } from "@/api/billing"
import { toast } from "sonner"
import type { CheckoutRequest, PlanChangeRequest, PaymentMethodInsert } from "@/types/billing"

export const billingKeys = {
  all: ["billing"] as const,
  plans: () => [...billingKeys.all, "plans"] as const,
  plan: (id: string) => [...billingKeys.plans(), id] as const,
  planBySlug: (slug: string) => [...billingKeys.plans(), "slug", slug] as const,
  subscription: () => [...billingKeys.all, "subscription"] as const,
  transactions: () => [...billingKeys.all, "transactions"] as const,
  transaction: (id: string) => [...billingKeys.transactions(), id] as const,
  usage: () => [...billingKeys.all, "usage"] as const,
  usageSummary: () => [...billingKeys.usage(), "summary"] as const,
  usageRecords: () => [...billingKeys.usage(), "records"] as const,
  invoices: () => [...billingKeys.all, "invoices"] as const,
  invoice: (id: string) => [...billingKeys.invoices(), id] as const,
  paymentMethods: () => [...billingKeys.all, "payment-methods"] as const,
  paymentMethod: (id: string) => [...billingKeys.paymentMethods(), id] as const,
}

export const usePlans = () => {
  return useQuery({
    queryKey: billingKeys.plans(),
    queryFn: billingApi.getPlans,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export const usePlan = (id: string) => {
  return useQuery({
    queryKey: billingKeys.plan(id),
    queryFn: () => billingApi.getPlanById(id),
    enabled: !!id,
  })
}

export const usePlanBySlug = (slug: string) => {
  return useQuery({
    queryKey: billingKeys.planBySlug(slug),
    queryFn: () => billingApi.getPlanBySlug(slug),
    enabled: !!slug,
  })
}

export const useSubscription = () => {
  return useQuery({
    queryKey: billingKeys.subscription(),
    queryFn: billingApi.getSubscription,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useTransactions = () => {
  return useQuery({
    queryKey: billingKeys.transactions(),
    queryFn: billingApi.getTransactions,
    staleTime: 1000 * 60 * 5,
  })
}

export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: billingKeys.transaction(id),
    queryFn: () => billingApi.getTransactionById(id),
    enabled: !!id,
  })
}

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: ({ code, planId, amount }: { code: string; planId: string; amount: number }) =>
      billingApi.validateCoupon(code, planId, amount),
    onError: (error: Error) => {
      toast.error(`Failed to validate coupon: ${error.message}`)
    },
  })
}

export const useCreateCheckout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CheckoutRequest) => billingApi.createCheckoutSession(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() })
      queryClient.invalidateQueries({ queryKey: billingKeys.transactions() })
      toast.success("Payment processed successfully!")
    },
    onError: (error: Error) => {
      toast.error(`Payment failed: ${error.message}`)
    },
  })
}

export const useInvoicePreview = (
  planId: string,
  billingPeriod: 'monthly' | 'yearly',
  couponCode?: string | null
) => {
  return useQuery({
    queryKey: [...billingKeys.all, "invoice-preview", planId, billingPeriod, couponCode || ""],
    queryFn: () => billingApi.getInvoicePreview(planId, billingPeriod, couponCode),
    enabled: !!planId,
    staleTime: 1000 * 60, // 1 minute
  })
}

export const useCancelSubscription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (subscriptionId: string) => billingApi.cancelSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() })
      toast.success("Subscription canceled successfully")
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel subscription: ${error.message}`)
    },
  })
}

// Usage Hooks
export const useUsageSummary = () => {
  return useQuery({
    queryKey: billingKeys.usageSummary(),
    queryFn: billingApi.getUsageSummary,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useUsageRecords = (limit: number = 12) => {
  return useQuery({
    queryKey: [...billingKeys.usageRecords(), limit],
    queryFn: () => billingApi.getUsageRecords(limit),
    staleTime: 1000 * 60 * 5,
  })
}

// Invoice Hooks
export const useInvoices = () => {
  return useQuery({
    queryKey: billingKeys.invoices(),
    queryFn: billingApi.getInvoices,
    staleTime: 1000 * 60 * 5,
  })
}

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: billingKeys.invoice(id),
    queryFn: () => billingApi.getInvoiceById(id),
    enabled: !!id,
  })
}

export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: (id: string) => billingApi.downloadInvoice(id),
    onSuccess: (data) => {
      if (data.download_url) {
        window.open(data.download_url, '_blank')
        toast.success("Invoice download started")
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to download invoice: ${error.message}`)
    },
  })
}

// Payment Method Hooks
export const usePaymentMethods = () => {
  return useQuery({
    queryKey: billingKeys.paymentMethods(),
    queryFn: billingApi.getPaymentMethods,
    staleTime: 1000 * 60 * 5,
  })
}

export const useAddPaymentMethod = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PaymentMethodInsert) => billingApi.addPaymentMethod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.paymentMethods() })
      toast.success("Payment method added successfully")
    },
    onError: (error: Error) => {
      toast.error(`Failed to add payment method: ${error.message}`)
    },
  })
}

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PaymentMethodInsert> }) =>
      billingApi.updatePaymentMethod(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.paymentMethods() })
      toast.success("Payment method updated successfully")
    },
    onError: (error: Error) => {
      toast.error(`Failed to update payment method: ${error.message}`)
    },
  })
}

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billingApi.deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.paymentMethods() })
      toast.success("Payment method removed successfully")
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove payment method: ${error.message}`)
    },
  })
}

export const useSetDefaultPaymentMethod = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billingApi.setDefaultPaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.paymentMethods() })
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() })
      toast.success("Default payment method updated")
    },
    onError: (error: Error) => {
      toast.error(`Failed to set default payment method: ${error.message}`)
    },
  })
}

// Plan Change Hooks
export const useChangePlan = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: PlanChangeRequest) => billingApi.changePlan(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() })
      queryClient.invalidateQueries({ queryKey: billingKeys.transactions() })
      toast.success("Plan changed successfully")
    },
    onError: (error: Error) => {
      toast.error(`Failed to change plan: ${error.message}`)
    },
  })
}

export const useResumeSubscription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (subscriptionId: string) => billingApi.resumeSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription() })
      toast.success("Subscription resumed successfully")
    },
    onError: (error: Error) => {
      toast.error(`Failed to resume subscription: ${error.message}`)
    },
  })
}
