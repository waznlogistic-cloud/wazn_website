-- ============================================
-- Secure Login Function
-- Creates a function that only exposes email and role for login
-- This is more secure than allowing direct table access
-- ============================================

-- Drop function if exists
DROP FUNCTION IF EXISTS public.get_user_email_by_phone(TEXT);

-- Create secure function that only returns email and role
-- This function can only return email and role, not other sensitive data
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
  RETURN QUERY
  SELECT 
    p.email,
    p.role::TEXT,
    p.phone
  FROM public.profiles p
  WHERE p.phone = phone_number
  LIMIT 1;
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.get_user_email_by_phone(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_email_by_phone(TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_user_email_by_phone IS 'Secure function for login that only returns email, role, and phone. Does not expose other sensitive profile data.';

