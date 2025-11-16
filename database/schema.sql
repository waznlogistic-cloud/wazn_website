-- ============================================
-- Wazn Platform - Tables Only (No Policies)
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- Step 1: Create custom role enum
-- ============================================
DO $$ BEGIN
  CREATE TYPE wazn_user_role AS ENUM ('admin', 'employer', 'provider', 'driver', 'client');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- Step 2: PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role wazn_user_role NOT NULL DEFAULT 'client',
  full_name TEXT,
  phone TEXT,
  email TEXT,
  id_number TEXT,
  date_of_birth DATE,
  nationality TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Step 3: PROVIDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.providers (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  company_name TEXT NOT NULL,
  commercial_registration TEXT,
  tax_number TEXT,
  activity_type TEXT,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Step 4: PROVIDER DRIVERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.provider_drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  id_number TEXT,
  license_number TEXT,
  license_expiry DATE,
  vehicle_type TEXT,
  vehicle_plate TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Step 5: ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_no TEXT UNIQUE,
  client_id UUID REFERENCES public.profiles(id),
  employer_id UUID REFERENCES public.profiles(id),
  provider_id UUID REFERENCES public.providers(id),
  driver_id UUID REFERENCES public.profiles(id),
  provider_driver_id UUID REFERENCES public.provider_drivers(id),
  ship_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  sender_name TEXT,
  sender_phone TEXT,
  sender_address TEXT,
  receiver_name TEXT,
  receiver_phone TEXT,
  receiver_address TEXT,
  weight DECIMAL(10, 2),
  price DECIMAL(10, 2),
  delivery_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivery_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- Step 6: TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  type TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Step 7: PROOF OF DELIVERY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.proof_of_delivery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(id),
  receiver_name TEXT,
  receiver_id_number TEXT,
  delivery_code TEXT,
  delivery_date DATE,
  proof_image_url TEXT,
  signature_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Step 8: PERMITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE,
  permit_type TEXT NOT NULL,
  permit_number TEXT,
  permit_file_url TEXT,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Step 9: NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_employer_id ON public.orders(employer_id);
CREATE INDEX IF NOT EXISTS idx_orders_provider_id ON public.orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON public.orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_drivers_provider_id ON public.provider_drivers(provider_id);

-- ============================================
-- DONE! Tables created successfully
-- ============================================
