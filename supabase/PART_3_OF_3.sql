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
