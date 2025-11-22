import { api } from "@/lib/api"
import type {
  Plan,
  Subscription,
  Transaction,
  CheckoutRequest,
  CheckoutResponse,
  CouponValidation,
  InvoicePreview,
} from "@/types/billing"

export const billingApi = {
  // Plans
  getPlans: async (): Promise<Plan[]> => {
    return api.get<Plan[]>("/billing/plans")
  },

  getPlanById: async (id: string): Promise<Plan> => {
    return api.get<Plan>(`/billing/plans/${id}`)
  },

  getPlanBySlug: async (slug: string): Promise<Plan> => {
    return api.get<Plan>(`/billing/plans/slug/${slug}`)
  },

  // Subscriptions
  getSubscription: async (): Promise<Subscription | null> => {
    return api.get<Subscription | null>("/billing/subscription")
  },

  cancelSubscription: async (subscriptionId: string): Promise<Subscription> => {
    return api.post<Subscription>(`/billing/subscription/${subscriptionId}/cancel`, {})
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    return api.get<Transaction[]>("/billing/transactions")
  },

  getTransactionById: async (id: string): Promise<Transaction> => {
    return api.get<Transaction>(`/billing/transactions/${id}`)
  },

  // Coupons
  validateCoupon: async (code: string, planId: string, amount: number): Promise<CouponValidation> => {
    return api.post<CouponValidation>("/billing/coupons/validate", {
      code,
      plan_id: planId,
      amount,
    })
  },

  // Checkout
  createCheckoutSession: async (request: CheckoutRequest): Promise<CheckoutResponse> => {
    return api.post<CheckoutResponse>("/billing/checkout", request)
  },

  getInvoicePreview: async (
    planId: string,
    billingPeriod: 'monthly' | 'yearly',
    couponCode?: string | null
  ): Promise<InvoicePreview> => {
    const params = new URLSearchParams({
      plan_id: planId,
      billing_period: billingPeriod,
    })
    if (couponCode) {
      params.append('coupon_code', couponCode)
    }
    return api.get<InvoicePreview>(`/billing/invoice-preview?${params.toString()}`)
  },

  // Stripe
  createPaymentIntent: async (amount: number, currency: string = 'USD'): Promise<{ client_secret: string }> => {
    return api.post<{ client_secret: string }>("/billing/stripe/payment-intent", {
      amount,
      currency,
    })
  },
}
