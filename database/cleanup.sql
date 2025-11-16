-- ============================================
-- Wazn Platform - Database Cleanup Script
-- Run this in Supabase SQL Editor to delete everything
-- ============================================

-- Drop all tables (in reverse order of dependencies)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.permits CASCADE;
DROP TABLE IF EXISTS public.proof_of_delivery CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.provider_drivers CASCADE;
DROP TABLE IF EXISTS public.providers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop enum type
DROP TYPE IF EXISTS wazn_user_role CASCADE;

-- ============================================
-- DONE! All tables and objects deleted
-- ============================================

