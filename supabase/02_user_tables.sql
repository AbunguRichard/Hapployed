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
