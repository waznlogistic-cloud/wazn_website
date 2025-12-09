-- ============================================
-- Test the login function
-- Run this to verify the function works correctly
-- ============================================

-- Test 1: Check if function exists
SELECT 
  routine_name, 
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'get_user_email_by_phone';

-- Test 2: Try calling the function with a test phone number
-- Replace '0512345678' with an actual phone number from your profiles table
SELECT * FROM get_user_email_by_phone('0512345678');

-- Test 3: Check what phone numbers exist in your profiles table
-- This will help you see the exact format stored in the database
SELECT id, phone, email, role 
FROM public.profiles 
LIMIT 10;

