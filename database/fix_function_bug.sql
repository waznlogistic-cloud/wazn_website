-- ============================================
-- Fix: Function returning wrong user
-- The WHERE clause wasn't properly referencing the parameter
-- Run this to fix the function
-- ============================================

DROP FUNCTION IF EXISTS public.get_user_email_by_phone(TEXT);

CREATE OR REPLACE FUNCTION public.get_user_email_by_phone(phone TEXT)
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
  -- Use explicit function-qualified parameter name to avoid ambiguity
  RETURN QUERY
  SELECT 
    p.email,
    p.role::TEXT,
    p.phone
  FROM public.profiles p
  WHERE p.phone = get_user_email_by_phone.phone
  LIMIT 1;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_email_by_phone(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_email_by_phone(TEXT) TO authenticated;

-- Test the fix
SELECT * FROM get_user_email_by_phone('0512345678');
-- Should return: email: test2@gmail.com, role: employer, phone: 0512345678

SELECT * FROM get_user_email_by_phone('0587654321');
-- Should return: email: test@example.com, role: employer, phone: 0587654321

