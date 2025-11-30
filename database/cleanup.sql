-- ============================================
-- Wazn Platform - Database Cleanup Script
-- Run this in Supabase SQL Editor to delete everything
-- IMPORTANT: This deletes ALL tables (old and new) - Use before running new schema.sql
-- ============================================

-- ============================================
-- Step 1: Delete OLD tables not in new schema
-- Order matters due to foreign key dependencies!
-- ============================================

-- Delete tables that depend on other old tables first
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.licenses CASCADE;
DROP TABLE IF EXISTS public.warehouses CASCADE;
DROP TABLE IF EXISTS public.terms_acceptances CASCADE;
DROP TABLE IF EXISTS public.proof_of_deliveries CASCADE; -- Old name (plural, different structure)

-- Delete tables that other tables depend on
DROP TABLE IF EXISTS public.drivers CASCADE; -- Old drivers table (different from provider_drivers)
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.terms_and_conditions CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;

-- ============================================
-- Step 2: Drop NEW schema tables (in reverse order of dependencies)
-- ============================================
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.permits CASCADE;
DROP TABLE IF EXISTS public.proof_of_delivery CASCADE; -- New name (singular)
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.provider_drivers CASCADE;
DROP TABLE IF EXISTS public.employers CASCADE;
DROP TABLE IF EXISTS public.providers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================
-- Step 3: Drop functions
-- ============================================
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================
-- Step 4: Drop triggers
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================
-- Step 5: Drop enum types (if they exist)
-- ============================================
DROP TYPE IF EXISTS wazn_user_role CASCADE;
DROP TYPE IF EXISTS invoice_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS inventory_status CASCADE;
DROP TYPE IF EXISTS company_type CASCADE;
DROP TYPE IF EXISTS proof_method CASCADE;

-- ============================================
-- DONE! All tables and objects deleted
-- Now you can run database/schema.sql to create fresh tables
-- ============================================

