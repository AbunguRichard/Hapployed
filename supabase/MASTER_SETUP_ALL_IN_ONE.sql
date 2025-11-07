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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0,
    completed_lessons INTEGER DEFAULT 0,
    total_lessons INTEGER,
    last_accessed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_name VARCHAR(100) NOT NULL,
    badge_description TEXT,
    badge_icon VARCHAR(50),
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mentorships table
CREATE TABLE IF NOT EXISTS mentorships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mentee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    focus_area VARCHAR(255),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(mentor_id, mentee_id)
);

-- Create indexes
CREATE INDEX idx_verifications_user_id ON verifications(user_id);
CREATE INDEX idx_verifications_status ON verifications(status);
CREATE INDEX idx_verifications_level ON verifications(level);

CREATE INDEX idx_skill_assessments_user_id ON skill_assessments(user_id);
CREATE INDEX idx_skill_assessments_skill_name ON skill_assessments(skill_name);
CREATE INDEX idx_skill_assessments_status ON skill_assessments(status);

CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_difficulty ON courses(difficulty);
CREATE INDEX idx_courses_rating ON courses(rating DESC);

CREATE INDEX idx_user_course_progress_user_id ON user_course_progress(user_id);
CREATE INDEX idx_user_course_progress_course_id ON user_course_progress(course_id);

CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_earned_at ON achievements(earned_at DESC);

CREATE INDEX idx_mentorships_mentor_id ON mentorships(mentor_id);
CREATE INDEX idx_mentorships_mentee_id ON mentorships(mentee_id);
CREATE INDEX idx_mentorships_status ON mentorships(status);

-- Create triggers
CREATE TRIGGER update_verifications_updated_at
    BEFORE UPDATE ON verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_course_progress_updated_at
    BEFORE UPDATE ON user_course_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
-- ============================================
-- HAPPLOYED DATABASE SETUP - PART 6
-- Communication and Community Tables
-- ============================================

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    gig_id UUID REFERENCES gigs(id) ON DELETE SET NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    parent_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Posts table
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    category VARCHAR(100),
    upvotes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Comments table
CREATE TABLE IF NOT EXISTS community_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    parent_comment_id UUID REFERENCES community_comments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50), -- 'job_match', 'application', 'payment', 'message', etc.
    reference_id UUID,
    reference_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews and Ratings table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    gig_id UUID REFERENCES gigs(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    reliability_rating INTEGER CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    review_text TEXT,
    response_text TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS Offline Gigs table (for SMS Gateway)
CREATE TABLE IF NOT EXISTS offline_gigs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_phone VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10, 2),
    duration VARCHAR(100),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending_sync', -- 'pending_sync', 'synced', 'published'
    sync_attempts INTEGER DEFAULT 0,
    synced_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS History table
CREATE TABLE IF NOT EXISTS sms_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_phone VARCHAR(50) NOT NULL,
    direction VARCHAR(20) NOT NULL, -- 'inbound', 'outbound'
    message_content TEXT,
    command VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    response_sent TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_messages_from_user ON messages(from_user_id);
CREATE INDEX idx_messages_to_user ON messages(to_user_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_category ON community_posts(category);
CREATE INDEX idx_community_posts_tags ON community_posts USING GIN(tags);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);

CREATE INDEX idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX idx_community_comments_user_id ON community_comments(user_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX idx_reviews_job_id ON reviews(job_id);
CREATE INDEX idx_reviews_gig_id ON reviews(gig_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);

CREATE INDEX idx_offline_gigs_user_phone ON offline_gigs(user_phone);
CREATE INDEX idx_offline_gigs_status ON offline_gigs(status);

CREATE INDEX idx_sms_history_user_phone ON sms_history(user_phone);
CREATE INDEX idx_sms_history_created_at ON sms_history(created_at DESC);

-- Create triggers
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
    BEFORE UPDATE ON community_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offline_gigs_updated_at
    BEFORE UPDATE ON offline_gigs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
-- ============================================
-- HAPPLOYED DATABASE SETUP - PART 7
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Users Policies
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- Worker Profiles Policies
-- ============================================

-- Anyone can view published worker profiles
CREATE POLICY "Public worker profiles are viewable"
    ON worker_profiles FOR SELECT
    USING (true);

-- Users can insert their own worker profile
CREATE POLICY "Users can create own worker profile"
    ON worker_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own worker profile
CREATE POLICY "Users can update own worker profile"
    ON worker_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- Jobs Policies
-- ============================================

-- Published jobs are viewable by everyone
CREATE POLICY "Published jobs are viewable"
    ON jobs FOR SELECT
    USING (status = 'published' OR auth.uid() = user_id);

-- Users can create jobs
CREATE POLICY "Users can create jobs"
    ON jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own jobs
CREATE POLICY "Users can update own jobs"
    ON jobs FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own jobs
CREATE POLICY "Users can delete own jobs"
    ON jobs FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- Role Definitions Policies
-- ============================================

CREATE POLICY "Role definitions viewable with job"
    ON role_definitions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM jobs 
            WHERE jobs.id = role_definitions.job_id 
            AND (jobs.status = 'published' OR jobs.user_id = auth.uid())
        )
    );

CREATE POLICY "Job owners can manage role definitions"
    ON role_definitions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM jobs 
            WHERE jobs.id = role_definitions.job_id 
            AND jobs.user_id = auth.uid()
        )
    );

-- ============================================
-- Applications Policies
-- ============================================

-- Users can view applications they created
CREATE POLICY "Users can view own applications"
    ON applications FOR SELECT
    USING (auth.uid() = worker_id OR 
           EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.user_id = auth.uid()));

-- Workers can create applications
CREATE POLICY "Workers can create applications"
    ON applications FOR INSERT
    WITH CHECK (auth.uid() = worker_id);

-- Workers can update their own applications
CREATE POLICY "Workers can update own applications"
    ON applications FOR UPDATE
    USING (auth.uid() = worker_id);

-- Job owners can update applications for their jobs
CREATE POLICY "Job owners can update applications"
    ON applications FOR UPDATE
    USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.user_id = auth.uid()));

-- ============================================
-- Gigs Policies
-- ============================================

CREATE POLICY "Users can view relevant gigs"
    ON gigs FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = worker_id OR status IN ('active', 'published'));

CREATE POLICY "Users can create gigs"
    ON gigs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gigs"
    ON gigs FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() = worker_id);

-- ============================================
-- Wallets and Transactions Policies
-- ============================================

CREATE POLICY "Users can view own wallet"
    ON wallets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
    ON wallets FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM wallets 
            WHERE wallets.id = transactions.wallet_id 
            AND wallets.user_id = auth.uid()
        )
    );

-- ============================================
-- Payment Methods Policies
-- ============================================

CREATE POLICY "Users can manage own payment methods"
    ON payment_methods FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Messages Policies
-- ============================================

CREATE POLICY "Users can view own messages"
    ON messages FOR SELECT
    USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update received messages"
    ON messages FOR UPDATE
    USING (auth.uid() = to_user_id);

-- ============================================
-- Community Policies
-- ============================================

CREATE POLICY "Published posts are viewable"
    ON community_posts FOR SELECT
    USING (is_published = true OR auth.uid() = user_id);

CREATE POLICY "Users can create posts"
    ON community_posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
    ON community_posts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Comments are viewable"
    ON community_comments FOR SELECT
    USING (true);

CREATE POLICY "Users can create comments"
    ON community_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Notifications Policies
-- ============================================

CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- Reviews Policies
-- ============================================

CREATE POLICY "Published reviews are viewable"
    ON reviews FOR SELECT
    USING (is_published = true OR auth.uid() = reviewer_id OR auth.uid() = reviewee_id);

CREATE POLICY "Users can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update own reviews"
    ON reviews FOR UPDATE
    USING (auth.uid() = reviewer_id OR auth.uid() = reviewee_id);

-- ============================================
-- Courses and Learning Policies
-- ============================================

CREATE POLICY "Published courses are viewable"
    ON courses FOR SELECT
    USING (is_published = true);

CREATE POLICY "Users can track own progress"
    ON user_course_progress FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements"
    ON achievements FOR SELECT
    USING (auth.uid() = user_id);
-- ============================================
-- HAPPLOYED DATABASE SETUP - PART 8
-- Helper Functions and Views
-- ============================================

-- Function to calculate worker rating from reviews
CREATE OR REPLACE FUNCTION calculate_worker_rating(worker_user_id UUID)
RETURNS DECIMAL(3, 2) AS $$
DECLARE
    avg_rating DECIMAL(3, 2);
BEGIN
    SELECT AVG(rating)::DECIMAL(3, 2)
    INTO avg_rating
    FROM reviews
    WHERE reviewee_id = worker_user_id AND is_published = true;
    
    RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update worker profile rating
CREATE OR REPLACE FUNCTION update_worker_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE worker_profiles
    SET rating = calculate_worker_rating(NEW.reviewee_id),
        updated_at = NOW()
    WHERE user_id = NEW.reviewee_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update worker rating after review
CREATE TRIGGER update_worker_rating_trigger
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    WHEN (NEW.is_published = true)
    EXECUTE FUNCTION update_worker_rating();

-- Function to increment job view count
CREATE OR REPLACE FUNCTION increment_job_views(job_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE jobs
    SET views = views + 1,
        updated_at = NOW()
    WHERE id = job_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to update application count when application is created
CREATE OR REPLACE FUNCTION update_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE jobs
        SET application_count = application_count + 1,
            updated_at = NOW()
        WHERE id = NEW.job_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE jobs
        SET application_count = application_count - 1,
            updated_at = NOW()
        WHERE id = OLD.job_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_application_count_trigger
    AFTER INSERT OR DELETE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_job_application_count();

-- Function to calculate match score between worker and job
CREATE OR REPLACE FUNCTION calculate_match_score(
    worker_skills TEXT[],
    job_skills TEXT[],
    worker_rate DECIMAL,
    job_budget DECIMAL
)
RETURNS INTEGER AS $$
DECLARE
    skill_match_count INTEGER;
    skill_match_percentage DECIMAL;
    budget_match_percentage DECIMAL;
    total_score INTEGER;
BEGIN
    -- Calculate skill match
    SELECT COUNT(*)
    INTO skill_match_count
    FROM unnest(worker_skills) AS ws
    WHERE ws = ANY(job_skills);
    
    skill_match_percentage := CASE 
        WHEN array_length(job_skills, 1) > 0 THEN
            (skill_match_count::DECIMAL / array_length(job_skills, 1)) * 100
        ELSE 0
    END;
    
    -- Calculate budget match (assuming hourly rate vs project budget)
    budget_match_percentage := CASE
        WHEN worker_rate > 0 AND job_budget > 0 THEN
            LEAST(100, (job_budget / (worker_rate * 40)) * 100) -- Assume 40 hours
        ELSE 50
    END;
    
    -- Weighted score: 70% skills, 30% budget
    total_score := (skill_match_percentage * 0.7 + budget_match_percentage * 0.3)::INTEGER;
    
    RETURN LEAST(100, total_score);
END;
$$ LANGUAGE plpgsql;

-- View for job listings with application stats
CREATE OR REPLACE VIEW job_listings_view AS
SELECT 
    j.*,
    u.name as poster_name,
    u.email as poster_email,
    COUNT(DISTINCT a.id) as total_applications,
    COUNT(DISTINCT CASE WHEN a.status = 'pending' THEN a.id END) as pending_applications,
    COUNT(DISTINCT CASE WHEN a.status = 'accepted' THEN a.id END) as accepted_applications
FROM jobs j
LEFT JOIN users u ON j.user_id = u.id
LEFT JOIN applications a ON j.id = a.job_id
GROUP BY j.id, u.name, u.email;

-- View for worker profiles with stats
CREATE OR REPLACE VIEW worker_profiles_view AS
SELECT 
    wp.*,
    u.email as user_email,
    u.is_verified as user_verified,
    COUNT(DISTINCT r.id) as total_reviews,
    COUNT(DISTINCT CASE WHEN e.status = 'withdrawn' THEN e.id END) as completed_jobs_count,
    COALESCE(SUM(CASE WHEN e.status = 'withdrawn' THEN e.amount ELSE 0 END), 0) as total_earned
FROM worker_profiles wp
LEFT JOIN users u ON wp.user_id = u.id
LEFT JOIN reviews r ON wp.user_id = r.reviewee_id AND r.is_published = true
LEFT JOIN earnings e ON wp.user_id = e.user_id
GROUP BY wp.id, u.email, u.is_verified;

-- Function for full-text search on jobs
CREATE OR REPLACE FUNCTION search_jobs(search_query TEXT)
RETURNS TABLE (
    job_id UUID,
    title VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    similarity REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.title,
        j.description,
        j.category,
        GREATEST(
            similarity(j.title, search_query),
            similarity(j.description, search_query)
        ) as sim
    FROM jobs j
    WHERE j.status = 'published'
    AND (
        j.title % search_query
        OR j.description % search_query
    )
    ORDER BY sim DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Function for full-text search on workers
CREATE OR REPLACE FUNCTION search_workers(search_query TEXT)
RETURNS TABLE (
    profile_id UUID,
    name VARCHAR(255),
    bio TEXT,
    skills TEXT[],
    similarity REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wp.id,
        wp.name,
        wp.bio,
        wp.skills,
        GREATEST(
            similarity(wp.name, search_query),
            similarity(COALESCE(wp.bio, ''), search_query)
        ) as sim
    FROM worker_profiles wp
    WHERE wp.is_available = true
    AND (
        wp.name % search_query
        OR COALESCE(wp.bio, '') % search_query
        OR search_query = ANY(wp.skills)
    )
    ORDER BY sim DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Function to get recommended jobs for a worker
CREATE OR REPLACE FUNCTION get_recommended_jobs(worker_user_id UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    job_id UUID,
    title VARCHAR(255),
    description TEXT,
    budget DECIMAL(10, 2),
    match_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.title,
        j.description,
        j.budget,
        calculate_match_score(wp.skills, j.skills_required, wp.hourly_rate, j.budget) as score
    FROM jobs j
    CROSS JOIN worker_profiles wp
    WHERE wp.user_id = worker_user_id
    AND j.status = 'published'
    ORDER BY score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
-- ============================================
-- HAPPLOYED DATABASE SETUP - PART 9
-- Sample Data and Verification
-- ============================================

-- Insert sample categories for reference
CREATE TABLE IF NOT EXISTS job_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO job_categories (name, description, icon) VALUES
('Web Development', 'Frontend, backend, and full-stack development', '💻'),
('Mobile Development', 'iOS, Android, and cross-platform apps', '📱'),
('Design', 'UI/UX, graphic design, branding', '🎨'),
('Writing & Content', 'Copywriting, content creation, editing', '✍️'),
('Marketing', 'Digital marketing, SEO, social media', '📢'),
('Data & Analytics', 'Data science, analysis, visualization', '📊'),
('Video & Animation', 'Video editing, motion graphics, 3D', '🎬'),
('Photography', 'Product, event, portrait photography', '📷'),
('Accounting', 'Bookkeeping, tax preparation, financial planning', '🧮'),
('Legal', 'Contract review, legal consulting', '⚖️'),
('Sales', 'Business development, lead generation', '💼'),
('Customer Service', 'Support, help desk, community management', '🎧'),
('Administrative', 'Virtual assistance, data entry, scheduling', '📋'),
('Maintenance & Repairs', 'Home repairs, plumbing, electrical', '🔧'),
('Cleaning', 'Home cleaning, commercial cleaning', '🧹'),
('Moving & Delivery', 'Moving services, delivery, logistics', '🚚'),
('Landscaping', 'Lawn care, gardening, outdoor maintenance', '🌳'),
('Catering & Events', 'Event planning, catering, party services', '🍽️')
ON CONFLICT (name) DO NOTHING;

-- Insert sample skills for reference
CREATE TABLE IF NOT EXISTS skill_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO skill_categories (name, category) VALUES
-- Technology Skills
('React', 'Technology'),
('JavaScript', 'Technology'),
('Python', 'Technology'),
('Node.js', 'Technology'),
('CSS', 'Technology'),
('HTML', 'Technology'),
('TypeScript', 'Technology'),
('SQL', 'Technology'),
('MongoDB', 'Technology'),
('AWS', 'Technology'),
-- Creative Skills
('Adobe Photoshop', 'Creative'),
('Figma', 'Creative'),
('Illustrator', 'Creative'),
('Video Editing', 'Creative'),
('3D Modeling', 'Creative'),
('Photography', 'Creative'),
-- Business Skills
('Project Management', 'Business'),
('Marketing', 'Business'),
('Sales', 'Business'),
('Accounting', 'Business'),
('Excel', 'Business'),
('PowerPoint', 'Business'),
-- General Skills
('Communication', 'General'),
('Customer Service', 'General'),
('Writing', 'General'),
('Translation', 'General')
ON CONFLICT (name) DO NOTHING;

-- Create verification query to check database setup
CREATE OR REPLACE FUNCTION verify_database_setup()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Check extensions
    RETURN QUERY
    SELECT 
        'Extension: uuid-ossp'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') 
            THEN 'OK' ELSE 'MISSING' END,
        'UUID generation support'::TEXT;
    
    RETURN QUERY
    SELECT 
        'Extension: pg_trgm'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') 
            THEN 'OK' ELSE 'MISSING' END,
        'Full-text search support'::TEXT;
    
    RETURN QUERY
    SELECT 
        'Extension: postgis'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') 
            THEN 'OK' ELSE 'MISSING' END,
        'Geographic data support'::TEXT;
    
    -- Check core tables
    RETURN QUERY
    SELECT 
        'Table: users'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
            THEN 'OK' ELSE 'MISSING' END,
        (SELECT COUNT(*)::TEXT || ' rows' FROM users);
    
    RETURN QUERY
    SELECT 
        'Table: worker_profiles'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'worker_profiles') 
            THEN 'OK' ELSE 'MISSING' END,
        (SELECT COUNT(*)::TEXT || ' rows' FROM worker_profiles);
    
    RETURN QUERY
    SELECT 
        'Table: jobs'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'jobs') 
            THEN 'OK' ELSE 'MISSING' END,
        (SELECT COUNT(*)::TEXT || ' rows' FROM jobs);
    
    RETURN QUERY
    SELECT 
        'Table: applications'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'applications') 
            THEN 'OK' ELSE 'MISSING' END,
        (SELECT COUNT(*)::TEXT || ' rows' FROM applications);
    
    RETURN QUERY
    SELECT 
        'Table: wallets'::TEXT,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wallets') 
            THEN 'OK' ELSE 'MISSING' END,
        (SELECT COUNT(*)::TEXT || ' rows' FROM wallets);
    
    -- Check RLS
    RETURN QUERY
    SELECT 
        'RLS: users'::TEXT,
        CASE WHEN (SELECT relrowsecurity FROM pg_class WHERE relname = 'users') 
            THEN 'ENABLED' ELSE 'DISABLED' END,
        'Row Level Security status'::TEXT;
    
    RETURN QUERY
    SELECT 
        'RLS: jobs'::TEXT,
        CASE WHEN (SELECT relrowsecurity FROM pg_class WHERE relname = 'jobs') 
            THEN 'ENABLED' ELSE 'DISABLED' END,
        'Row Level Security status'::TEXT;
END;
$$ LANGUAGE plpgsql;
