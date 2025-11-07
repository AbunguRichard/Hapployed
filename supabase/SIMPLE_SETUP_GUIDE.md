# 🎯 SUPABASE SETUP - SIMPLE GUIDE (NO TECHNICAL KNOWLEDGE NEEDED)

## What You'll Do:
Copy and paste 9 SQL scripts into Supabase Dashboard. Each takes 30 seconds.

---

## 🚀 START HERE

### Step 1: Open Supabase Dashboard

1. **Open your browser** (Chrome, Firefox, Safari, etc.)
2. **Go to**: https://supabase.com/dashboard
3. **Login** with your email and password
4. **Click** on your project: **richardbray.abungu@gmail.com's Project**

---

### Step 2: Open SQL Editor

1. Look at the **LEFT SIDEBAR**
2. **Click** on **"SQL Editor"** (looks like this: `</>`)
3. You'll see a big text box where you can type

---

### Step 3: Run Script 1 (Extensions)

**COPY THIS ENTIRE TEXT** (click the copy button below or select all and copy):

```sql
-- SCRIPT 1 OF 9: Extensions and Setup

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis";

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

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**NOW:**
1. **Paste** it in the SQL Editor text box
2. **Click** the **"RUN"** button (bottom right, it's green/blue)
3. **Wait** for "Success" message (appears at top)
4. **Clear** the text box (select all and delete)

✅ **Script 1 Complete!**

---

### Step 4: Run Script 2 (Users Tables)

**COPY THIS ENTIRE TEXT:**

```sql
-- SCRIPT 2 OF 9: User Tables

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

CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active',
    joined_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_roles ON users USING GIN(roles);
CREATE INDEX idx_users_current_mode ON users(current_mode);
CREATE INDEX idx_worker_profiles_user_id ON worker_profiles(user_id);
CREATE INDEX idx_worker_profiles_skills ON worker_profiles USING GIN(skills);
CREATE INDEX idx_worker_profiles_rating ON worker_profiles(rating DESC);
CREATE INDEX idx_worker_profiles_hourly_rate ON worker_profiles(hourly_rate);
CREATE INDEX idx_worker_profiles_verification_level ON worker_profiles(verification_level);

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
```

**NOW:**
1. **Paste** it in the SQL Editor
2. **Click RUN**
3. **Wait** for "Success"
4. **Clear** the text box

✅ **Script 2 Complete!**

---

## 🎉 GOOD JOB! You've completed 2 of 9 scripts!

Continue with the remaining 7 scripts below...

---

