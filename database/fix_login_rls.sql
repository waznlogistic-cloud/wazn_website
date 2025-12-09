-- ============================================
-- Fix RLS for Login - Secure Phone Lookup
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Drop existing insecure policy if it exists
DROP POLICY IF EXISTS "Public can read email and role by phone for login" ON public.profiles;

-- Step 2: Create secure function that only returns email, role, and phone
-- This prevents exposure of sensitive data like full_name, id_number, address, etc.
DROP FUNCTION IF EXISTS public.get_user_email_by_phone(TEXT);

CREATE OR REPLACE FUNCTION public.get_user_email_by_phone(phone_number TEXT)
RETURNS TABLE (
  email TEXT,
  role TEXT,
  phone TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return email, role, and phone - no other sensitive data
  -- Use explicit parameter reference to avoid ambiguity
  RETURN QUERY
  SELECT 
    p.email,
    p.role::TEXT,
    p.phone
  FROM public.profiles p
  WHERE p.phone = get_user_email_by_phone.phone_number
  LIMIT 1;
END;
$$;

-- Step 3: Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_email_by_phone(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_email_by_phone(TEXT) TO authenticated;

-- Step 4: Add comment for documentation
COMMENT ON FUNCTION public.get_user_email_by_phone IS 'Secure function for login that only returns email, role, and phone. Does not expose other sensitive profile data.';

-- Step 5: Verify the function was created
SELECT 
  routine_name, 
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'get_user_email_by_phone';

