-- Comprehensive fix for worker_profiles table
-- Run this in Supabase SQL Editor

-- First, let's check current columns
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'worker_profiles';

-- Add missing columns if they don't exist
ALTER TABLE worker_profiles 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

ALTER TABLE worker_profiles 
ADD COLUMN IF NOT EXISTS portfolio TEXT;

ALTER TABLE worker_profiles 
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE worker_profiles 
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Verify availability column exists (should already exist from schema)
-- If it doesn't, add it
ALTER TABLE worker_profiles 
ADD COLUMN IF NOT EXISTS availability VARCHAR(50);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_worker_profiles_categories ON worker_profiles USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_phone ON worker_profiles(phone);

-- Reload the schema cache (this forces Supabase to recognize the new columns)
NOTIFY pgrst, 'reload schema';

-- Alternative: You can also just wait 10-15 seconds or restart the PostgREST service
-- from the Supabase dashboard under Settings -> API

SELECT 'Schema updated successfully. Columns added: phone, portfolio, categories, profile_image' as message;
