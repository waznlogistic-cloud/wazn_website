-- ============================================
-- Wazn Platform - Enhanced RLS Policies for Payment Tables
-- Run this AFTER rls_policies.sql
-- ============================================

-- ============================================
-- INVOICES POLICIES
-- ============================================

-- Employers can read their own invoices
CREATE POLICY "Employers can read own invoices"
ON public.invoices FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employers
    WHERE employers.id = invoices.employer_id
    AND employers.id = auth.uid()
  )
);

-- Admins can read all invoices
CREATE POLICY "Admins can read all invoices"
ON public.invoices FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- System can create invoices (via service role or admin)
-- Note: This might need service role, or admin can create
CREATE POLICY "Admins can create invoices"
ON public.invoices FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins can update invoices
CREATE POLICY "Admins can update invoices"
ON public.invoices FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- PAYOUT REQUESTS POLICIES
-- ============================================

-- Users can read their own payout requests
CREATE POLICY "Users can read own payout requests"
ON public.payout_requests FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can create their own payout requests
CREATE POLICY "Users can create own payout requests"
ON public.payout_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own pending payout requests (cancel)
CREATE POLICY "Users can update own pending payout requests"
ON public.payout_requests FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() AND
  status = 'pending'
);

-- Admins can read all payout requests
CREATE POLICY "Admins can read all payout requests"
ON public.payout_requests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins can update payout requests (process/reject)
CREATE POLICY "Admins can update payout requests"
ON public.payout_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- WALLET BALANCES POLICIES
-- ============================================

-- Users can read their own wallet balance
CREATE POLICY "Users can read own wallet balance"
ON public.wallet_balances FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- System can update wallet balances (via service role or admin)
-- Note: This typically requires service role, but for now admins can update
CREATE POLICY "Admins can update wallet balances"
ON public.wallet_balances FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- DONE! Enhanced RLS policies created
-- ============================================

