-- ============================================
-- Wazn Platform - Database Functions & Triggers
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================

-- ============================================
-- Step 1: Create updated_at trigger function
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Step 2: Create triggers for updated_at
-- ============================================

-- Profiles table trigger
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Providers table trigger
CREATE TRIGGER set_updated_at_providers
  BEFORE UPDATE ON public.providers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Employers table trigger
CREATE TRIGGER set_updated_at_employers
  BEFORE UPDATE ON public.employers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Provider drivers table trigger
CREATE TRIGGER set_updated_at_provider_drivers
  BEFORE UPDATE ON public.provider_drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- DONE! Triggers created successfully
-- ============================================

-- NOTE: These triggers will automatically update the updated_at column
-- whenever a row is updated in the respective tables.

