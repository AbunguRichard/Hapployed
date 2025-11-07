-- ============================================
-- HAPPLOYED DATABASE SETUP - PART 1
-- Extensions and Initial Configuration
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE user_role AS ENUM ('worker', 'employer', 'admin');
CREATE TYPE job_type AS ENUM ('project', 'gig');
CREATE TYPE job_status AS ENUM ('draft', 'published', 'active', 'completed', 'cancelled', 'closed');
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE hiring_type AS ENUM ('Single', 'Multi-Role');
CREATE TYPE experience_level AS ENUM ('Entry', 'Intermediate', 'Expert');
CREATE TYPE work_location AS ENUM ('Remote', 'On-site', 'Hybrid');
CREATE TYPE verification_level AS ENUM ('basic', 'verified', 'premium', 'expert');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
