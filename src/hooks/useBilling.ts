import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { billingApi } from "@/api/billing"
import { toast } from "sonner"
import type { CheckoutRequest } from "@/types/billing"

export const billingKeys = {
  all: ["billing"] as const,
  plans: () => [...billingKeys.all, "plans"] as const,
  plan: (id: string) => [...billingKeys.plans(), id] as const,
  planBySlug: (slug: string) => [...billingKeys.plans(), "slug", slug] as const,
  subscription: () => [...billingKeys.all, "subscription"] as const,
  transactions: () => [...billingKeys.all, "transactions"] as const,
  transaction: (id: string) => [...billingKeys.transactions(), id] as const,
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
