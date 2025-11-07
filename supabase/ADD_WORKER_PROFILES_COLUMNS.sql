-- Add missing columns to worker_profiles table for profile completion

-- Add phone column
ALTER TABLE worker_profiles 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add portfolio column
ALTER TABLE worker_profiles 
ADD COLUMN IF NOT EXISTS portfolio TEXT;

-- Add categories column (for categorizing workers)
ALTER TABLE worker_profiles 
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add profile_image column
ALTER TABLE worker_profiles 
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Create index on categories
CREATE INDEX IF NOT EXISTS idx_worker_profiles_categories ON worker_profiles USING GIN(categories);

-- Update trigger is already in place, no need to recreate
