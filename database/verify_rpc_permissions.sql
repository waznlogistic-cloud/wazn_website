-- ============================================
-- Verify RPC Function Permissions
-- Run this to check if the function has correct permissions
-- ============================================

-- Check function permissions
SELECT 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  r.rolname as granted_to
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_proc_acl a ON p.oid = a.prooid
JOIN pg_roles r ON a.grantee = r.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'get_user_email_by_phone'
ORDER BY r.rolname;

-- Also check if function exists and is accessible
SELECT 
  routine_name,
  routine_type,
  security_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_user_email_by_phone';

-- Test calling the function as anonymous user (simulate)
-- This should work if permissions are correct
SELECT * FROM get_user_email_by_phone('0512345678');

