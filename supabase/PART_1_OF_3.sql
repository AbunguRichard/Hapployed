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
-- ============================================
-- HAPPLOYED DATABASE SETUP - PART 2
-- Core User Tables
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    roles user_role[] DEFAULT ARRAY['worker']::user_role[],
    current_mode user_role DEFAULT 'worker',
    phone VARCHAR(50),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Worker Profiles table
CREATE TABLE IF NOT EXISTS worker_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    bio TEXT,
    skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    hourly_rate DECIMAL(10, 2) DEFAULT 0,
    experience_level experience_level DEFAULT 'Entry',
    location JSONB,
    availability VARCHAR(50),
    rating DECIMAL(3, 2) DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    response_time VARCHAR(50),
    verification_level verification_level DEFAULT 'basic',
    trust_score INTEGER DEFAULT 0,
    badges TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    size VARCHAR(50),
    location VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization Members table
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'Admin', 'Manager', 'Member'
    department VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active',
    joined_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Create indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_roles ON users USING GIN(roles);
CREATE INDEX idx_users_current_mode ON users(current_mode);

-- Create indexes for worker_profiles
CREATE INDEX idx_worker_profiles_user_id ON worker_profiles(user_id);
CREATE INDEX idx_worker_profiles_skills ON worker_profiles USING GIN(skills);
CREATE INDEX idx_worker_profiles_rating ON worker_profiles(rating DESC);
CREATE INDEX idx_worker_profiles_hourly_rate ON worker_profiles(hourly_rate);
CREATE INDEX idx_worker_profiles_verification_level ON worker_profiles(verification_level);

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worker_profiles_updated_at
    BEFORE UPDATE ON worker_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
-- ============================================
-- HAPPLOYED DATABASE SETUP - PART 3
-- Jobs and Roles Tables
-- ============================================

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    job_type job_type NOT NULL,
    status job_status DEFAULT 'draft',
    hiring_type hiring_type DEFAULT 'Single',
    category VARCHAR(100),
    budget DECIMAL(10, 2),
    duration VARCHAR(100),
    location JSONB,
    skills_required TEXT[] DEFAULT ARRAY[]::TEXT[],
    experience_level experience_level,
    urgency VARCHAR(50),
    views INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    specific_location VARCHAR(255),
    work_type VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- Role Definitions for Multi-Role Hiring
CREATE TABLE IF NOT EXISTS role_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    role_id VARCHAR(100) NOT NULL,
    role_name VARCHAR(255) NOT NULL,
    number_of_people INTEGER DEFAULT 1,
    required_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    pay_per_person DECIMAL(10, 2),
    experience_level experience_level,
    work_location work_location,
    applicants INTEGER DEFAULT 0,
    hired INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES role_definitions(id) ON DELETE SET NULL,
    cover_letter TEXT,
    proposed_rate DECIMAL(10, 2),
    available_date DATE,
    status application_status DEFAULT 'pending',
    hirer_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, worker_id)
);

-- Gigs table (for quick hire)
CREATE TABLE IF NOT EXISTS gigs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    location VARCHAR(255),
    budget DECIMAL(10, 2),
    duration VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    urgency_level VARCHAR(50),
    is_emergency BOOLEAN DEFAULT FALSE,
    pay_amount DECIMAL(10, 2),
    completion_deadline TIMESTAMPTZ,
    worker_id UUID REFERENCES users(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones table
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2),
    due_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_job_type ON jobs(job_type);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_skills ON jobs USING GIN(skills_required);

CREATE INDEX idx_role_definitions_job_id ON role_definitions(job_id);
CREATE INDEX idx_role_definitions_status ON role_definitions(status);

CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_worker_id ON applications(worker_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);

CREATE INDEX idx_gigs_user_id ON gigs(user_id);
CREATE INDEX idx_gigs_worker_id ON gigs(worker_id);
CREATE INDEX idx_gigs_status ON gigs(status);
CREATE INDEX idx_gigs_category ON gigs(category);

CREATE INDEX idx_milestones_gig_id ON milestones(gig_id);

-- Create triggers
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_role_definitions_updated_at
    BEFORE UPDATE ON role_definitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gigs_updated_at
    BEFORE UPDATE ON gigs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
-- ============================================
-- HAPPLOYED DATABASE SETUP - PART 4
-- Financial and Payment Tables
-- ============================================

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10, 2) DEFAULT 0,
    available_balance DECIMAL(10, 2) DEFAULT 0,
    pending_balance DECIMAL(10, 2) DEFAULT 0,
    total_earned DECIMAL(10, 2) DEFAULT 0,
    credit_limit DECIMAL(10, 2) DEFAULT 65000,
    credit_used DECIMAL(10, 2) DEFAULT 0,
    savings_enabled BOOLEAN DEFAULT FALSE,
    savings_balance DECIMAL(10, 2) DEFAULT 0,
    savings_interest_rate DECIMAL(5, 2) DEFAULT 2.5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'credit', 'debit', 'withdrawal', 'deposit'
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    status payment_status DEFAULT 'pending',
    reference_id VARCHAR(100),
    payment_method VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    method_type VARCHAR(50) NOT NULL, -- 'bank_account', 'credit_card', 'paypal', etc.
    provider VARCHAR(100),
    account_number VARCHAR(100),
    last_four VARCHAR(4),
    expiry_date VARCHAR(7),
    is_default BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    gig_id UUID REFERENCES gigs(id) ON DELETE SET NULL,
    from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    status payment_status DEFAULT 'pending',
    due_date DATE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Earnings table
CREATE TABLE IF NOT EXISTS earnings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    gig_id UUID REFERENCES gigs(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'available', 'withdrawn'
    earned_date DATE DEFAULT CURRENT_DATE,
    available_date DATE,
    withdrawn_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_is_default ON payment_methods(is_default);
CREATE INDEX idx_invoices_from_user ON invoices(from_user_id);
CREATE INDEX idx_invoices_to_user ON invoices(to_user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_earnings_user_id ON earnings(user_id);
CREATE INDEX idx_earnings_status ON earnings(status);

-- Create triggers
CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
-- ============================================
-- HAPPLOYED DATABASE SETUP - PART 5
-- Verification and Skills Tables
-- ============================================

-- Verifications table
CREATE TABLE IF NOT EXISTS verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    level verification_level NOT NULL,
    status verification_status DEFAULT 'pending',
    identity_verified BOOLEAN DEFAULT FALSE,
    skills_verified BOOLEAN DEFAULT FALSE,
    experience_verified BOOLEAN DEFAULT FALSE,
    reputation_verified BOOLEAN DEFAULT FALSE,
    trust_score INTEGER DEFAULT 0,
    documents JSONB DEFAULT '[]'::JSONB,
    reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewer_notes TEXT,
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill Assessments table
CREATE TABLE IF NOT EXISTS skill_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    assessment_type VARCHAR(50), -- 'quiz', 'project', 'certification'
    score INTEGER,
    max_score INTEGER DEFAULT 100,
    status VARCHAR(50) DEFAULT 'pending',
    questions JSONB,
    answers JSONB,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table (for Grow system)
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
    duration_hours INTEGER,
    instructor_name VARCHAR(255),
    rating DECIMAL(3, 2) DEFAULT 0,
    enrolled_count INTEGER DEFAULT 0,
    price DECIMAL(10, 2) DEFAULT 0,
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Course Progress table
CREATE TABLE IF NOT EXISTS user_course_progress (
