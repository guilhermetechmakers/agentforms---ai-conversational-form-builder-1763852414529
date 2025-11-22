-- =====================================================
-- Migration: Create Billing Tables
-- Created: 2025-11-23T00:31:36Z
-- Tables: plans, subscriptions, transactions, coupons
-- Purpose: Foundation for billing and subscription management
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE: plans
-- Purpose: Store subscription plans with features and pricing
-- =====================================================
CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Plan identification
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- Pricing
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD' NOT NULL,
  
  -- Features and limits (JSONB for flexibility)
  features JSONB DEFAULT '{}'::jsonb NOT NULL,
  limits JSONB DEFAULT '{}'::jsonb NOT NULL,
  
  -- Plan metadata
  is_active BOOLEAN DEFAULT true NOT NULL,
  is_enterprise BOOLEAN DEFAULT false NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  
  -- Stripe integration
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT plans_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT plans_slug_not_empty CHECK (length(trim(slug)) > 0),
  CONSTRAINT plans_price_positive CHECK (price_monthly >= 0),
  CONSTRAINT plans_price_yearly_positive CHECK (price_yearly IS NULL OR price_yearly >= 0)
);

-- Performance indexes for plans
CREATE INDEX IF NOT EXISTS plans_slug_idx ON plans(slug);
CREATE INDEX IF NOT EXISTS plans_is_active_idx ON plans(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS plans_display_order_idx ON plans(display_order);

-- Auto-update trigger for plans
DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Plans table is public (read-only for non-admins)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Everyone can read active plans
CREATE POLICY "plans_select_active"
  ON plans FOR SELECT
  USING (is_active = true);

-- =====================================================
-- TABLE: subscriptions
-- Purpose: Track user subscriptions to plans
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES plans(id) ON DELETE RESTRICT NOT NULL,
  
  -- Subscription status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired')),
  
  -- Billing period
  billing_period TEXT DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  
  -- Stripe integration
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  
  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT false NOT NULL,
  canceled_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraint: one active subscription per user
  CONSTRAINT subscriptions_one_active_per_user UNIQUE NULLS NOT DISTINCT (user_id, (status = 'active'))
);

-- Performance indexes for subscriptions
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_plan_id_idx ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_idx ON subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS subscriptions_current_period_end_idx ON subscriptions(current_period_end);

-- Auto-update trigger for subscriptions
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own subscriptions
CREATE POLICY "subscriptions_select_own"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_own"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_own"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TABLE: transactions
-- Purpose: Record all payment transactions
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES plans(id) ON DELETE RESTRICT NOT NULL,
  
  -- Transaction details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded', 'canceled')),
  
  -- Payment method
  payment_method TEXT,
  payment_method_type TEXT,
  
  -- Stripe integration
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  stripe_invoice_id TEXT,
  
  -- Discounts
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  coupon_code TEXT,
  
  -- Tax information
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 4),
  vat_number TEXT,
  
  -- Billing address (stored as JSONB for flexibility)
  billing_address JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  paid_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT transactions_amount_positive CHECK (amount >= 0),
  CONSTRAINT transactions_discount_positive CHECK (discount_amount >= 0),
  CONSTRAINT transactions_tax_positive CHECK (tax_amount >= 0)
);

-- Performance indexes for transactions
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_subscription_id_idx ON transactions(subscription_id);
CREATE INDEX IF NOT EXISTS transactions_plan_id_idx ON transactions(plan_id);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON transactions(status);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_stripe_payment_intent_id_idx ON transactions(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

-- Auto-update trigger for transactions
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own transactions
CREATE POLICY "transactions_select_own"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_own"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TABLE: coupons
-- Purpose: Store discount coupons and promo codes
-- =====================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Coupon identification
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Discount type and value
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  valid_until TIMESTAMPTZ,
  
  -- Usage limits
  max_uses INTEGER,
  max_uses_per_user INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0 NOT NULL,
  
  -- Restrictions
  minimum_amount DECIMAL(10, 2),
  applicable_plans UUID[],
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  -- Stripe integration
  stripe_coupon_id TEXT UNIQUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT coupons_code_not_empty CHECK (length(trim(code)) > 0),
  CONSTRAINT coupons_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT coupons_discount_value_positive CHECK (discount_value > 0),
  CONSTRAINT coupons_max_uses_positive CHECK (max_uses IS NULL OR max_uses > 0),
  CONSTRAINT coupons_max_uses_per_user_positive CHECK (max_uses_per_user > 0),
  CONSTRAINT coupons_minimum_amount_positive CHECK (minimum_amount IS NULL OR minimum_amount >= 0),
  CONSTRAINT coupons_validity_period CHECK (valid_until IS NULL OR valid_until > valid_from)
);

-- Performance indexes for coupons
CREATE INDEX IF NOT EXISTS coupons_code_idx ON coupons(code);
CREATE INDEX IF NOT EXISTS coupons_is_active_idx ON coupons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS coupons_valid_from_idx ON coupons(valid_from);
CREATE INDEX IF NOT EXISTS coupons_valid_until_idx ON coupons(valid_until) WHERE valid_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS coupons_stripe_coupon_id_idx ON coupons(stripe_coupon_id) WHERE stripe_coupon_id IS NOT NULL;

-- Auto-update trigger for coupons
DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Coupons table is public (read-only for validation)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Everyone can read active coupons
CREATE POLICY "coupons_select_active"
  ON coupons FOR SELECT
  USING (is_active = true);

-- =====================================================
-- TABLE: coupon_usage
-- Purpose: Track coupon usage per user
-- =====================================================
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE NOT NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  
  -- Timestamps
  used_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraint: prevent duplicate usage tracking
  UNIQUE(user_id, coupon_id, transaction_id)
);

-- Performance indexes for coupon_usage
CREATE INDEX IF NOT EXISTS coupon_usage_user_id_idx ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS coupon_usage_coupon_id_idx ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS coupon_usage_transaction_id_idx ON coupon_usage(transaction_id);

-- Enable Row Level Security for coupon_usage
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own usage
CREATE POLICY "coupon_usage_select_own"
  ON coupon_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "coupon_usage_insert_own"
  ON coupon_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Documentation
-- =====================================================
COMMENT ON TABLE plans IS 'Subscription plans with pricing and features';
COMMENT ON TABLE subscriptions IS 'User subscriptions to plans';
COMMENT ON TABLE transactions IS 'Payment transactions and invoices';
COMMENT ON TABLE coupons IS 'Discount coupons and promo codes';
COMMENT ON TABLE coupon_usage IS 'Track coupon usage per user';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS coupon_usage CASCADE;
-- DROP TABLE IF EXISTS coupons CASCADE;
-- DROP TABLE IF EXISTS transactions CASCADE;
-- DROP TABLE IF EXISTS subscriptions CASCADE;
-- DROP TABLE IF EXISTS plans CASCADE;
