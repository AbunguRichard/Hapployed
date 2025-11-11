-- Complete fix for all missing columns in users and worker_profiles tables
-- Run this in Supabase SQL Editor

-- Add missing column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Add missing columns to worker_profiles table (if not already added)
ALTER TABLE worker_profiles 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

ALTER TABLE worker_profiles 
ADD COLUMN IF NOT EXISTS portfolio TEXT;

ALTER TABLE worker_profiles 
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE worker_profiles 
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login DESC);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_categories ON worker_profiles USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_phone ON worker_profiles(phone);

-- Force schema reload
NOTIFY pgrst, 'reload schema';

SELECT 'All missing columns added successfully. Schema cache reloaded.' as message;
