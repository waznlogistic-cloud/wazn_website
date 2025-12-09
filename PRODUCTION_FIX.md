# 🚨 Production Login Fix - Quick Guide

## Problem
Login works locally but fails on production with "Invalid login credentials"

## Root Cause
The SQL function `get_user_email_by_phone` likely doesn't exist in your **PRODUCTION** Supabase database.

---

## ✅ Quick Fix (5 minutes)

### Step 1: Open Production Supabase
1. Go to: https://supabase.com/dashboard
2. Select your project: `wlhionnjajybxyztxqiy`
3. Click **SQL Editor** (left sidebar)

### Step 2: Check if Function Exists
Run this query:
```sql
SELECT 
  routine_name, 
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'get_user_email_by_phone';
```

**If it returns 0 rows:** Function doesn't exist → Go to Step 3
**If it returns 1 row:** Function exists → Check Step 4

### Step 3: Create the Function
Copy and paste this entire SQL script:

```sql
-- ============================================
-- Fix RLS for Login - Secure Phone Lookup
-- Run this in PRODUCTION Supabase SQL Editor
-- ============================================

-- Step 1: Drop existing insecure policy if it exists
DROP POLICY IF EXISTS "Public can read email and role by phone for login" ON public.profiles;

-- Step 2: Create secure function that only returns email, role, and phone
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

-- Step 4: Verify the function was created
SELECT 
  routine_name, 
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'get_user_email_by_phone';
```

**Click "Run"** (or press Cmd+Enter)

### Step 4: Test the Function
Run this to verify it works:
```sql
SELECT * FROM get_user_email_by_phone('0512345678');
```

**Should return:** email, role, phone for that user

---

## 🔍 Alternative: Check Vercel Environment Variables

If the function exists but still doesn't work:

1. Go to: https://vercel.com/dashboard
2. Select your project: `wazn-website`
3. Settings → Environment Variables
4. Verify these are set:
   - `VITE_SUPABASE_URL` = `https://wlhionnjajybxyztxqiy.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (your anon key)
5. If you just added/changed them, click **"Redeploy"**

---

## 🧪 Test After Fix

1. Go to: https://wazn-website.vercel.app/login
2. Open browser console (F12 → Console)
3. Try logging in with:
   - Phone: `0512345678` (or `0587654321`)
   - Password: (your password)
4. Check console for:
   - "Trying phone format: ..." logs
   - "Found profile: ..." logs
   - Any errors

---

## ✅ Success Indicators

After running the SQL:
- ✅ Function query returns 1 row
- ✅ Test query returns user data
- ✅ Login works on production
- ✅ Console shows "Found profile" logs

---

## 🆘 Still Not Working?

If login still fails after running SQL:

1. **Check browser console** (F12 → Console)
   - Look for "RPC error" messages
   - Copy the full error message

2. **Check Network tab** (F12 → Network)
   - Filter by "rpc"
   - Look for `get_user_email_by_phone` call
   - Check response status and data

3. **Share with me:**
   - Console error messages
   - Network request details
   - What the debug panel shows

---

**Most likely:** The function just needs to be created in production Supabase! 🎯

