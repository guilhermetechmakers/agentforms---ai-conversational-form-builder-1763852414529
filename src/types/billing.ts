/**
 * Billing and subscription types
 * Generated: 2025-11-23
 */

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number | null;
  currency: string;
  features: Record<string, any>;
  limits: Record<string, any>;
  is_active: boolean;
  is_enterprise: boolean;
  display_order: number;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanInsert {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  price_monthly: number;
  price_yearly?: number | null;
  currency?: string;
  features?: Record<string, any>;
  limits?: Record<string, any>;
  is_active?: boolean;
  is_enterprise?: boolean;
  display_order?: number;
  stripe_price_id_monthly?: string | null;
  stripe_price_id_yearly?: string | null;
}

export interface PlanUpdate {
  name?: string;
  slug?: string;
  description?: string | null;
  price_monthly?: number;
  price_yearly?: number | null;
  currency?: string;
  features?: Record<string, any>;
  limits?: Record<string, any>;
  is_active?: boolean;
  is_enterprise?: boolean;
  display_order?: number;
  stripe_price_id_monthly?: string | null;
  stripe_price_id_yearly?: string | null;
}

export type PlanRow = Plan;

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired';
  billing_period: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionInsert {
  id?: string;
  user_id: string;
  plan_id: string;
  status?: Subscription['status'];
  billing_period?: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  stripe_subscription_id?: string | null;
  stripe_customer_id?: string | null;
  cancel_at_period_end?: boolean;
  canceled_at?: string | null;
}

export interface SubscriptionUpdate {
  status?: Subscription['status'];
  billing_period?: 'monthly' | 'yearly';
  current_period_start?: string;
  current_period_end?: string;
  stripe_subscription_id?: string | null;
  stripe_customer_id?: string | null;
  cancel_at_period_end?: boolean;
  canceled_at?: string | null;
}

export type SubscriptionRow = Subscription;

export interface Transaction {
  id: string;
  user_id: string;
  subscription_id: string | null;
  plan_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'canceled';
  payment_method: string | null;
  payment_method_type: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_invoice_id: string | null;
  discount_amount: number;
  coupon_code: string | null;
  tax_amount: number;
  tax_rate: number | null;
  vat_number: string | null;
  billing_address: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
}

export interface TransactionInsert {
  id?: string;
  user_id: string;
  subscription_id?: string | null;
  plan_id: string;
  amount: number;
  currency?: string;
  status?: Transaction['status'];
  payment_method?: string | null;
  payment_method_type?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_charge_id?: string | null;
  stripe_invoice_id?: string | null;
  discount_amount?: number;
  coupon_code?: string | null;
  tax_amount?: number;
  tax_rate?: number | null;
  vat_number?: string | null;
  billing_address?: Record<string, any>;
  metadata?: Record<string, any>;
  paid_at?: string | null;
}

export type TransactionRow = Transaction;

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  currency: string;
  valid_from: string;
  valid_until: string | null;
  max_uses: number | null;
  max_uses_per_user: number;
  used_count: number;
  minimum_amount: number | null;
  applicable_plans: string[] | null;
  is_active: boolean;
  stripe_coupon_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CouponInsert {
  id?: string;
  code: string;
  name: string;
  description?: string | null;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  currency?: string;
  valid_from?: string;
  valid_until?: string | null;
  max_uses?: number | null;
  max_uses_per_user?: number;
  used_count?: number;
  minimum_amount?: number | null;
  applicable_plans?: string[] | null;
  is_active?: boolean;
  stripe_coupon_id?: string | null;
}

export type CouponRow = Coupon;

// Checkout and payment types
export interface CheckoutRequest {
  plan_id: string;
  billing_period: 'monthly' | 'yearly';
  coupon_code?: string | null;
  billing_address: {
    name: string;
    email: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  };
  vat_number?: string | null;
  payment_method_id: string; // Stripe payment method ID
}

export interface CheckoutResponse {
  transaction_id: string;
  subscription_id: string | null;
  status: 'succeeded' | 'pending' | 'failed';
  invoice_url?: string | null;
}

export interface CouponValidation {
  valid: boolean;
  coupon?: Coupon;
  discount_amount: number;
  error?: string;
}

export interface InvoicePreview {
  plan: Plan;
  billing_period: 'monthly' | 'yearly';
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  coupon?: Coupon | null;
  currency: string;
}
