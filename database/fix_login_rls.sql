-- ============================================
-- Fix RLS for Login - Secure Phone Lookup
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing insecure policy if it exists
DROP POLICY IF EXISTS "Public can read email and role by phone for login" ON public.profiles;

-- IMPORTANT: We use a SECURITY DEFINER function instead of direct table access
-- This ensures only email, role, and phone are exposed, not other sensitive data
-- The function is created in secure_login_function.sql

-- Verify the function exists
SELECT 
  routine_name, 
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'get_user_email_by_phone';

