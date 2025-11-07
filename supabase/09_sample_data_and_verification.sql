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
