-- ============================================
-- Wazn Platform - Enhanced Schema with Complete Payment Support
-- Run this AFTER running the base schema.sql
-- Adds: invoices, enhanced transactions, payout_requests
-- ============================================

-- ============================================
-- Step 0: Create updated_at function (if not exists)
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Step 1: Enhance TRANSACTIONS table
-- ============================================

-- Add payment method and gateway info to transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS gateway_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS gateway_name TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'SAR';

-- Add index for gateway transaction lookup
CREATE INDEX IF NOT EXISTS idx_transactions_gateway_id ON public.transactions(gateway_transaction_id);

-- ============================================
-- Step 2: Create INVOICES table (for Employers)
-- ============================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  employer_id UUID REFERENCES public.employers(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0.00,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, overdue, cancelled
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  transaction_id UUID REFERENCES public.transactions(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_employer_id ON public.invoices(employer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);

-- ============================================
-- Step 3: Create PAYOUT_REQUESTS table (for Drivers/Providers)
-- ============================================

CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL, -- bank_transfer, wallet, etc.
  bank_name TEXT,
  iban TEXT,
  account_number TEXT,
  account_holder_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, rejected
  rejection_reason TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  transaction_id UUID REFERENCES public.transactions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for payout requests
CREATE INDEX IF NOT EXISTS idx_payout_requests_user_id ON public.payout_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON public.payout_requests(status);

-- ============================================
-- Step 4: Create WALLET_BALANCES table (for tracking user balances)
-- ============================================

CREATE TABLE IF NOT EXISTS public.wallet_balances (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  balance DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  pending_balance DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  total_earned DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  total_withdrawn DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  currency TEXT DEFAULT 'SAR',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Step 5: Add trigger for invoice updated_at
-- ============================================

CREATE TRIGGER set_updated_at_invoices
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_payout_requests
  BEFORE UPDATE ON public.payout_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_wallet_balances
  BEFORE UPDATE ON public.wallet_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- DONE! Enhanced schema with complete payment support
-- ============================================

-- Summary of additions:
-- ✅ Enhanced transactions table (payment_method, gateway info)
-- ✅ Invoices table (for employers)
-- ✅ Payout requests table (for drivers/providers)
-- ✅ Wallet balances table (for tracking balances)
-- ✅ All necessary indexes
-- ✅ All necessary triggers

