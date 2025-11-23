import { api } from "@/lib/api"
import type {
  Plan,
  Subscription,
  Transaction,
  CheckoutRequest,
  CheckoutResponse,
  CouponValidation,
  InvoicePreview,
  UsageRecord,
  UsageSummary,
  Invoice,
  PaymentMethod,
  PaymentMethodInsert,
  PlanChangeRequest,
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

  // Usage Records
  getUsageSummary: async (): Promise<UsageSummary | null> => {
    return api.get<UsageSummary | null>("/billing/usage/summary")
  },

  getUsageRecords: async (limit: number = 12): Promise<UsageRecord[]> => {
    return api.get<UsageRecord[]>(`/billing/usage/records?limit=${limit}`)
  },

  // Invoices
  getInvoices: async (): Promise<Invoice[]> => {
    return api.get<Invoice[]>("/billing/invoices")
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    return api.get<Invoice>(`/billing/invoices/${id}`)
  },

  downloadInvoice: async (id: string): Promise<{ download_url: string }> => {
    return api.post<{ download_url: string }>(`/billing/invoices/${id}/download`, {})
  },

  // Payment Methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    return api.get<PaymentMethod[]>("/billing/payment-methods")
  },

  addPaymentMethod: async (data: PaymentMethodInsert): Promise<PaymentMethod> => {
    return api.post<PaymentMethod>("/billing/payment-methods", data)
  },

  updatePaymentMethod: async (id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    return api.patch<PaymentMethod>(`/billing/payment-methods/${id}`, data)
  },

  deletePaymentMethod: async (id: string): Promise<void> => {
    await api.delete(`/billing/payment-methods/${id}`)
  },

  setDefaultPaymentMethod: async (id: string): Promise<PaymentMethod> => {
    return api.post<PaymentMethod>(`/billing/payment-methods/${id}/set-default`, {})
  },

  // Plan Changes
  changePlan: async (request: PlanChangeRequest): Promise<Subscription> => {
    return api.post<Subscription>("/billing/subscription/change-plan", request)
  },

  resumeSubscription: async (subscriptionId: string): Promise<Subscription> => {
    return api.post<Subscription>(`/billing/subscription/${subscriptionId}/resume`, {})
  },
}
