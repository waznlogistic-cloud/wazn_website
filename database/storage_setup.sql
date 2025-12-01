-- ============================================
-- Wazn Platform - Storage Buckets & Policies
-- Run this AFTER creating storage buckets in Supabase Dashboard
-- ============================================

-- ============================================
-- Step 1: STORAGE POLICIES FOR proof-of-delivery BUCKET
-- ============================================

-- Allow authenticated users to upload proof of delivery
CREATE POLICY "Users can upload proof of delivery"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'proof-of-delivery' AND
  auth.role() = 'authenticated'
);

-- Allow users to read proof of delivery files
CREATE POLICY "Users can read proof of delivery"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'proof-of-delivery' AND
  auth.role() = 'authenticated'
);

-- Allow users to update their own proof of delivery files
CREATE POLICY "Users can update proof of delivery"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'proof-of-delivery' AND
  auth.role() = 'authenticated'
);

-- ============================================
-- Step 2: STORAGE POLICIES FOR permits BUCKET
-- ============================================

-- Allow providers to upload permits
CREATE POLICY "Providers can upload permits"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'permits' AND
  auth.role() = 'authenticated'
);

-- Allow users to read permit files
CREATE POLICY "Users can read permits"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'permits' AND
  auth.role() = 'authenticated'
);

-- Allow providers to update their own permit files
CREATE POLICY "Providers can update permits"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'permits' AND
  auth.role() = 'authenticated'
);

-- ============================================
-- Step 3: STORAGE POLICIES FOR profiles BUCKET
-- ============================================

-- Allow users to upload profile pictures
CREATE POLICY "Users can upload profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' AND
  auth.role() = 'authenticated'
);

-- Allow public to read profile pictures (public bucket)
CREATE POLICY "Public can read profile pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');

-- Allow users to update their own profile pictures
CREATE POLICY "Users can update profile pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profiles' AND
  auth.role() = 'authenticated'
);

-- ============================================
-- DONE! Storage policies created successfully
-- ============================================

-- NOTE: You must create the buckets FIRST in Supabase Dashboard:
-- 1. Go to Storage → New bucket
-- 2. Create: proof-of-delivery (private, 10MB, image/*)
-- 3. Create: permits (private, 10MB, application/pdf,image/*)
-- 4. Create: profiles (public, 5MB, image/*)
-- 5. Then run this SQL file

