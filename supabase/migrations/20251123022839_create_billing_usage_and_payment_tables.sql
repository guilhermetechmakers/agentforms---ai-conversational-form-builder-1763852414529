-- =====================================================
-- Migration: Create Billing Usage and Payment Tables
-- Created: 2025-11-23T02:28:39Z
-- Tables: usage_records, invoices, payment_methods
-- Purpose: Complete billing system with usage tracking, invoice management, and payment methods
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
-- TABLE: usage_records
-- Purpose: Track LLM calls, sessions, and other usage metrics per billing cycle
-- =====================================================
CREATE TABLE IF NOT EXISTS usage_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  -- Usage period
  billing_cycle_start TIMESTAMPTZ NOT NULL,
  billing_cycle_end TIMESTAMPTZ NOT NULL,
  
  -- Usage metrics (JSONB for flexibility)
  metrics JSONB DEFAULT '{}'::jsonb NOT NULL,
  -- Example metrics structure:
  -- {
  --   "llm_calls": 1500,
  --   "sessions": 250,
  --   "messages": 5000,
  --   "storage_mb": 1024,
  --   "api_requests": 10000
  -- }
  
  -- Quota limits from plan (snapshot at time of record)
  quota_limits JSONB DEFAULT '{}'::jsonb NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT usage_records_billing_cycle_valid CHECK (billing_cycle_end > billing_cycle_start),
  CONSTRAINT usage_records_one_per_cycle UNIQUE (user_id, billing_cycle_start, billing_cycle_end)
);

-- Performance indexes for usage_records
CREATE INDEX IF NOT EXISTS usage_records_user_id_idx ON usage_records(user_id);
CREATE INDEX IF NOT EXISTS usage_records_subscription_id_idx ON usage_records(subscription_id);
CREATE INDEX IF NOT EXISTS usage_records_billing_cycle_start_idx ON usage_records(billing_cycle_start DESC);
CREATE INDEX IF NOT EXISTS usage_records_billing_cycle_end_idx ON usage_records(billing_cycle_end DESC);
CREATE INDEX IF NOT EXISTS usage_records_status_idx ON usage_records(status) WHERE status = 'active';

-- Auto-update trigger for usage_records
DROP TRIGGER IF EXISTS update_usage_records_updated_at ON usage_records;
CREATE TRIGGER update_usage_records_updated_at
  BEFORE UPDATE ON usage_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for usage_records
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own usage records
CREATE POLICY "usage_records_select_own"
  ON usage_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "usage_records_insert_own"
  ON usage_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usage_records_update_own"
  ON usage_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TABLE: invoices
-- Purpose: Manage invoices separately from transactions for better organization
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  
  -- Invoice identification
  invoice_number TEXT NOT NULL UNIQUE,
  
  -- Invoice details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Invoice period
  invoice_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'canceled', 'refunded')) NOT NULL,
  
  -- PDF storage
  pdf_url TEXT,
  pdf_storage_path TEXT,
  
  -- Billing address (snapshot at time of invoice)
  billing_address JSONB DEFAULT '{}'::jsonb,
  
  -- Line items (JSONB for flexibility)
  line_items JSONB DEFAULT '[]'::jsonb NOT NULL,
  -- Example line_items structure:
  -- [
  --   {
  --     "description": "Pro Plan - Monthly",
  --     "quantity": 1,
  --     "unit_price": 29.99,
  --     "total": 29.99
  --   }
  -- ]
  
  -- Notes and metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Stripe integration
  stripe_invoice_id TEXT UNIQUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT invoices_amount_positive CHECK (amount >= 0),
  CONSTRAINT invoices_tax_positive CHECK (tax_amount >= 0),
  CONSTRAINT invoices_discount_positive CHECK (discount_amount >= 0),
  CONSTRAINT invoices_total_positive CHECK (total_amount >= 0),
  CONSTRAINT invoices_invoice_number_not_empty CHECK (length(trim(invoice_number)) > 0)
);

-- Performance indexes for invoices
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON invoices(user_id);
CREATE INDEX IF NOT EXISTS invoices_subscription_id_idx ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS invoices_transaction_id_idx ON invoices(transaction_id);
CREATE INDEX IF NOT EXISTS invoices_invoice_number_idx ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices(status);
CREATE INDEX IF NOT EXISTS invoices_invoice_date_idx ON invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS invoices_due_date_idx ON invoices(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS invoices_stripe_invoice_id_idx ON invoices(stripe_invoice_id) WHERE stripe_invoice_id IS NOT NULL;

-- Auto-update trigger for invoices
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own invoices
CREATE POLICY "invoices_select_own"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "invoices_insert_own"
  ON invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "invoices_update_own"
  ON invoices FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TABLE: payment_methods
-- Purpose: Store user payment methods (credit cards, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Payment method identification
  type TEXT NOT NULL CHECK (type IN ('card', 'bank_account', 'paypal', 'other')),
  
  -- Card details (masked for security)
  card_brand TEXT, -- visa, mastercard, amex, etc.
  card_last4 TEXT, -- last 4 digits
  card_exp_month INTEGER CHECK (card_exp_month IS NULL OR (card_exp_month >= 1 AND card_exp_month <= 12)),
  card_exp_year INTEGER CHECK (card_exp_year IS NULL OR card_exp_year >= EXTRACT(YEAR FROM NOW())::INTEGER),
  
  -- Bank account details (if applicable)
  bank_name TEXT,
  bank_account_type TEXT, -- checking, savings
  bank_account_last4 TEXT,
  
  -- Status
  is_default BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  -- Stripe integration
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  
  -- Billing address associated with payment method
  billing_address JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT payment_methods_card_last4_format CHECK (card_last4 IS NULL OR length(card_last4) = 4),
  CONSTRAINT payment_methods_stripe_payment_method_id_not_empty CHECK (length(trim(stripe_payment_method_id)) > 0)
);

-- Performance indexes for payment_methods
CREATE INDEX IF NOT EXISTS payment_methods_user_id_idx ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS payment_methods_is_default_idx ON payment_methods(is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS payment_methods_is_active_idx ON payment_methods(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS payment_methods_stripe_payment_method_id_idx ON payment_methods(stripe_payment_method_id);
CREATE INDEX IF NOT EXISTS payment_methods_stripe_customer_id_idx ON payment_methods(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Auto-update trigger for payment_methods
DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one default payment method per user
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    -- Unset other default payment methods for this user
    UPDATE payment_methods
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce single default payment method
DROP TRIGGER IF EXISTS payment_methods_single_default ON payment_methods;
CREATE TRIGGER payment_methods_single_default
  BEFORE INSERT OR UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_payment_method();

-- Enable Row Level Security for payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own payment methods
CREATE POLICY "payment_methods_select_own"
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "payment_methods_insert_own"
  ON payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payment_methods_update_own"
  ON payment_methods FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payment_methods_delete_own"
  ON payment_methods FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTION: get_current_usage_summary
-- Purpose: Get current billing cycle usage summary for a user
-- =====================================================
CREATE OR REPLACE FUNCTION get_current_usage_summary(p_user_id UUID)
RETURNS TABLE (
  billing_cycle_start TIMESTAMPTZ,
  billing_cycle_end TIMESTAMPTZ,
  metrics JSONB,
  quota_limits JSONB,
  usage_percentage JSONB
) AS $$
DECLARE
  v_subscription subscriptions%ROWTYPE;
  v_usage_record usage_records%ROWTYPE;
  v_plan plans%ROWTYPE;
BEGIN
  -- Get active subscription
  SELECT * INTO v_subscription
  FROM subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_subscription IS NULL THEN
    RETURN;
  END IF;

  -- Get plan details
  SELECT * INTO v_plan
  FROM plans
  WHERE id = v_subscription.plan_id;

  -- Get or create current usage record
  SELECT * INTO v_usage_record
  FROM usage_records
  WHERE user_id = p_user_id
    AND subscription_id = v_subscription.id
    AND billing_cycle_start <= NOW()
    AND billing_cycle_end >= NOW()
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no usage record exists, return subscription period as billing cycle
  IF v_usage_record IS NULL THEN
    RETURN QUERY
    SELECT
      v_subscription.current_period_start AS billing_cycle_start,
      v_subscription.current_period_end AS billing_cycle_end,
      '{}'::jsonb AS metrics,
      COALESCE(v_plan.limits, '{}'::jsonb) AS quota_limits,
      '{}'::jsonb AS usage_percentage;
  ELSE
    -- Calculate usage percentages
    RETURN QUERY
    SELECT
      v_usage_record.billing_cycle_start,
      v_usage_record.billing_cycle_end,
      v_usage_record.metrics,
      v_usage_record.quota_limits,
      (
        SELECT jsonb_object_agg(
          key,
          CASE
            WHEN (v_plan.limits->>key)::numeric > 0 THEN
              ROUND(((v_usage_record.metrics->>key)::numeric / (v_plan.limits->>key)::numeric) * 100, 2)
            ELSE 0
          END
        )
        FROM jsonb_each_text(v_usage_record.metrics)
        WHERE (v_plan.limits->>key)::numeric > 0
      ) AS usage_percentage
    FROM usage_records
    WHERE id = v_usage_record.id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_current_usage_summary(UUID) TO authenticated;

-- =====================================================
-- Documentation
-- =====================================================
COMMENT ON TABLE usage_records IS 'Track LLM calls, sessions, and usage metrics per billing cycle';
COMMENT ON TABLE invoices IS 'Manage invoices separately from transactions for better organization';
COMMENT ON TABLE payment_methods IS 'Store user payment methods (credit cards, bank accounts, etc.)';
COMMENT ON FUNCTION get_current_usage_summary IS 'Get current billing cycle usage summary with percentage calculations';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP FUNCTION IF EXISTS get_current_usage_summary(UUID);
-- DROP FUNCTION IF EXISTS ensure_single_default_payment_method();
-- DROP TABLE IF EXISTS payment_methods CASCADE;
-- DROP TABLE IF EXISTS invoices CASCADE;
-- DROP TABLE IF EXISTS usage_records CASCADE;
