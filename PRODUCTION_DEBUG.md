# 🔍 Production Login Debugging

## Issue
Login works locally but fails on production (Vercel) with "Invalid login credentials"

## Possible Causes

### 1. SQL Function Not Run in Production Supabase
The secure function `get_user_email_by_phone` might not exist in production database.

**Check:**
```sql
-- Run this in PRODUCTION Supabase SQL Editor
SELECT 
  routine_name, 
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'get_user_email_by_phone';
```

**If function doesn't exist, run:**
```sql
-- Run: database/fix_login_rls.sql in PRODUCTION Supabase
```

### 2. Environment Variables Not Set in Vercel
Check Vercel project settings → Environment Variables

**Required:**
- `VITE_SUPABASE_URL` - Should be your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Should be your Supabase anon key

**To check:**
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Verify both variables are set
5. Redeploy if you just added them

### 3. Function Permissions Issue
The function might exist but not have correct permissions.

**Check:**
```sql
-- Run in PRODUCTION Supabase
SELECT 
  p.proname as function_name,
  r.rolname as granted_to
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
JOIN pg_proc_acl a ON p.oid = a.prooid
JOIN pg_roles r ON a.grantee = r.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'get_user_email_by_phone';
```

**Should show:**
- `anon` role
- `authenticated` role

### 4. Cached Build
Vercel might be serving an old build.

**Solution:**
1. Go to Vercel Dashboard
2. Select your project
3. Deployments tab
4. Click "Redeploy" on latest deployment
5. Or push a new commit to trigger rebuild

## Quick Fix Steps

### Step 1: Verify Function Exists
Run in **PRODUCTION** Supabase SQL Editor:
```sql
SELECT * FROM get_user_email_by_phone('0512345678');
```

**If error:** Function doesn't exist → Run `database/fix_login_rls.sql`

### Step 2: Check Vercel Environment Variables
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify:
   - `VITE_SUPABASE_URL` = `https://wlhionnjajybxyztxqiy.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (your anon key)

### Step 3: Redeploy
1. Vercel Dashboard → Deployments
2. Click "Redeploy" on latest deployment
3. Wait for deployment to complete
4. Test login again

### Step 4: Check Browser Console
On production site, open browser console (F12) and check:
- Network tab → Look for RPC call to `get_user_email_by_phone`
- Console tab → Look for error messages
- Check if function is being called

## Debugging Checklist

- [ ] Function exists in production Supabase?
- [ ] Function has correct permissions (anon, authenticated)?
- [ ] Vercel environment variables set correctly?
- [ ] Latest code deployed to Vercel?
- [ ] Browser console shows RPC call?
- [ ] RPC call returns data or error?

## Most Likely Issue

**The SQL function hasn't been run in production Supabase database.**

The function works locally because you ran it in your local/dev Supabase, but production uses a different database (or the same database but the function wasn't created there).

**Solution:** Run `database/fix_login_rls.sql` in your **PRODUCTION** Supabase SQL Editor.

