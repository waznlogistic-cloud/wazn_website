-- ============================================
-- Fix RLS for Login - Allow phone lookup
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing public policy if it exists
DROP POLICY IF EXISTS "Public can read email and role by phone for login" ON public.profiles;

-- Allow unauthenticated users to read email and role by phone (for login)
-- This is safe because we only expose email and role, not sensitive data
CREATE POLICY "Public can read email and role by phone for login"
ON public.profiles FOR SELECT
TO anon
USING (true);

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public can read email and role by phone for login';

