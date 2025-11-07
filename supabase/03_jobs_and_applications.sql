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
