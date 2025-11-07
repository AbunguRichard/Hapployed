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
