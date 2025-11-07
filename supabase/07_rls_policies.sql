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
