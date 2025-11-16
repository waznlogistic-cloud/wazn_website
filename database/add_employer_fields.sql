-- Add Employer-specific fields to profiles table
-- Run this in Supabase SQL Editor if fields don't exist

-- Add commercial_registration column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'commercial_registration'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN commercial_registration TEXT;
  END IF;
END $$;

-- Add tax_number column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'tax_number'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN tax_number TEXT;
  END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name IN ('commercial_registration', 'tax_number');

