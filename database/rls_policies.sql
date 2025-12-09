-- ============================================
-- Wazn Platform - Row Level Security Policies
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================

-- ============================================
-- Step 1: Enable RLS on all tables
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_of_delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 2: PROFILES POLICIES
-- ============================================

-- SECURITY NOTE: We do NOT create a direct SELECT policy for anonymous users
-- Instead, we use a SECURITY DEFINER function (get_user_email_by_phone) 
-- that only exposes email, role, and phone columns.
-- This prevents exposure of sensitive data like full_name, id_number, address, etc.
-- 
-- The function is created in secure_login_function.sql
-- This is more secure than allowing direct table access with USING (true)

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================
-- Step 3: PROVIDERS POLICIES
-- ============================================

-- Users can read their own provider record
CREATE POLICY "Users can read own provider"
ON public.providers FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own provider record
CREATE POLICY "Users can update own provider"
ON public.providers FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Users can insert their own provider record
CREATE POLICY "Users can insert own provider"
ON public.providers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================
-- Step 4: EMPLOYERS POLICIES
-- ============================================

-- Users can read their own employer record
CREATE POLICY "Users can read own employer"
ON public.employers FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own employer record
CREATE POLICY "Users can update own employer"
ON public.employers FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Users can insert their own employer record
CREATE POLICY "Users can insert own employer"
ON public.employers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================
-- Step 5: PROVIDER DRIVERS POLICIES
-- ============================================

-- Providers can manage their own drivers
CREATE POLICY "Providers can manage own drivers"
ON public.provider_drivers FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.providers
    WHERE providers.id = provider_drivers.provider_id
    AND providers.id = auth.uid()
  )
);

-- ============================================
-- Step 6: ORDERS POLICIES
-- ============================================

-- Users can read orders they created or are assigned to
CREATE POLICY "Users can read own orders"
ON public.orders FOR SELECT
TO authenticated
USING (
  client_id = auth.uid() OR
  employer_id = auth.uid() OR
  driver_id = auth.uid() OR
  provider_id IN (
    SELECT id FROM public.providers WHERE id = auth.uid()
  )
);

-- Users can create orders
CREATE POLICY "Users can create orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (
  client_id = auth.uid() OR
  employer_id = auth.uid()
);

-- Users can update their own orders
CREATE POLICY "Users can update own orders"
ON public.orders FOR UPDATE
TO authenticated
USING (
  client_id = auth.uid() OR
  employer_id = auth.uid() OR
  provider_id IN (
    SELECT id FROM public.providers WHERE id = auth.uid()
  )
);

-- ============================================
-- Step 7: TRANSACTIONS POLICIES
-- ============================================

-- Users can read their own transactions
CREATE POLICY "Users can read own transactions"
ON public.transactions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can create their own transactions
CREATE POLICY "Users can create own transactions"
ON public.transactions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ============================================
-- Step 8: PROOF OF DELIVERY POLICIES
-- ============================================

-- Drivers can create proof of delivery
CREATE POLICY "Drivers can create proof of delivery"
ON public.proof_of_delivery FOR INSERT
TO authenticated
WITH CHECK (driver_id = auth.uid());

-- Users can read proof of delivery for their orders
CREATE POLICY "Users can read proof of delivery"
ON public.proof_of_delivery FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = proof_of_delivery.order_id
    AND (
      orders.client_id = auth.uid() OR
      orders.employer_id = auth.uid() OR
      orders.driver_id = auth.uid()
    )
  )
);

-- ============================================
-- Step 9: PERMITS POLICIES
-- ============================================

-- Providers can manage their own permits
CREATE POLICY "Providers can manage own permits"
ON public.permits FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.providers
    WHERE providers.id = permits.provider_id
    AND providers.id = auth.uid()
  )
);

-- ============================================
-- Step 10: NOTIFICATIONS POLICIES
-- ============================================

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- DONE! RLS Policies created successfully
-- ============================================

