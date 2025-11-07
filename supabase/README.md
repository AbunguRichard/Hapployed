# HAPPLOYED SUPABASE DATABASE SETUP

## Project Information
- **Organization**: Hapployed.OrgFree
- **Project**: richardbray.abungu@gmail.com's Project
- **Project REF**: jytudqxwlimtwseokdkg
- **API URL**: https://jytudqxwlimtwseokdkg.supabase.co
- **Database**: PostgreSQL with PostGIS

## Setup Instructions

### Method 1: Using Supabase Dashboard (Recommended)

1. **Login to Supabase**
   - Go to https://supabase.com/dashboard
   - Navigate to your project: jytudqxwlimtwseokdkg

2. **Execute SQL Scripts in Order**
   - Go to SQL Editor in the left sidebar
   - Execute each script in numerical order:
   
   ```
   01_extensions_and_setup.sql
   02_user_tables.sql
   03_jobs_and_applications.sql
   04_financial_tables.sql
   05_verification_and_skills.sql
   06_communication_and_community.sql
   07_rls_policies.sql
   08_functions_and_views.sql
   09_sample_data_and_verification.sql
   ```

3. **Verify Setup**
   - After running all scripts, execute:
   ```sql
   SELECT * FROM verify_database_setup();
   ```

### Method 2: Using Supabase CLI

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link to Project**
   ```bash
   supabase link --project-ref jytudqxwlimtwseokdkg
   ```

4. **Run Migrations**
   ```bash
   supabase db push
   ```

### Method 3: Using psql (Direct Database Connection)

1. **Connect to Database**
   ```bash
   psql "postgresql://postgres:GorMahiafc100#$@db.jytudqxwlimtwseokdkg.supabase.co:5432/postgres"
   ```

2. **Execute Scripts**
   ```bash
   \i /path/to/supabase/01_extensions_and_setup.sql
   \i /path/to/supabase/02_user_tables.sql
   \i /path/to/supabase/03_jobs_and_applications.sql
   \i /path/to/supabase/04_financial_tables.sql
   \i /path/to/supabase/05_verification_and_skills.sql
   \i /path/to/supabase/06_communication_and_community.sql
   \i /path/to/supabase/07_rls_policies.sql
   \i /path/to/supabase/08_functions_and_views.sql
   \i /path/to/supabase/09_sample_data_and_verification.sql
   ```

## Database Schema Overview

### Core Tables

#### User Management
- **users** - Main user accounts with roles and authentication
- **worker_profiles** - Detailed worker/talent profiles
- **organizations** - Company/organization profiles
- **organization_members** - Team member relationships

#### Jobs & Applications
- **jobs** - Job postings (projects and gigs)
- **role_definitions** - Multi-role hiring definitions
- **applications** - Job applications from workers
- **gigs** - Quick hire gigs
- **milestones** - Gig milestone tracking

#### Financial
- **wallets** - User wallets with balance tracking
- **transactions** - Financial transaction history
- **payment_methods** - Saved payment methods
- **invoices** - Invoice generation and tracking
- **earnings** - Worker earnings tracking

#### Verification & Skills
- **verifications** - Identity and skill verifications
- **skill_assessments** - Skill testing and certification
- **courses** - Learning courses (Grow system)
- **user_course_progress** - Course progress tracking
- **achievements** - User achievement badges
- **mentorships** - Mentor-mentee relationships

#### Communication
- **messages** - Direct messaging between users
- **community_posts** - Community forum posts
- **community_comments** - Post comments
- **notifications** - User notifications
- **reviews** - User ratings and reviews

#### SMS Gateway
- **offline_gigs** - Gigs created via SMS
- **sms_history** - SMS communication log

### Key Features

#### 1. Extensions Enabled
- ✅ uuid-ossp - UUID generation
- ✅ pg_trgm - Full-text search
- ✅ postgis - Geographic data support

#### 2. Custom Types
- user_role - 'worker', 'employer', 'admin'
- job_type - 'project', 'gig'
- job_status - 'draft', 'published', 'active', 'completed', 'cancelled', 'closed'
- application_status - 'pending', 'reviewed', 'accepted', 'rejected', 'withdrawn'
- verification_level - 'basic', 'verified', 'premium', 'expert'
- And more...

#### 3. Row Level Security (RLS)
- ✅ All tables have RLS enabled
- ✅ Policies for user data privacy
- ✅ Public access for published content
- ✅ Owner-based permissions

#### 4. Helper Functions
- `calculate_match_score()` - AI job matching
- `calculate_worker_rating()` - Rating aggregation
- `search_jobs()` - Full-text job search
- `search_workers()` - Full-text worker search
- `get_recommended_jobs()` - Job recommendations
- `verify_database_setup()` - Setup verification

#### 5. Automated Triggers
- Auto-update `updated_at` timestamps
- Auto-update worker ratings after reviews
- Auto-increment job application counts
- Auto-increment job view counts

## API Integration

### Update Backend Connection

Update your backend `/app/backend/.env`:

```env
# Replace MongoDB with Supabase
SUPABASE_URL=https://jytudqxwlimtwseokdkg.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5dHVkcXh3bGltdHdzZW9rZGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MzcxMTcsImV4cCI6MjA3ODAxMzExN30.BaTLL98C8cMut1K9sjHCYtO3Rl4ddmxbBtMDurBQb48
SUPABASE_SERVICE_KEY=[Get from Supabase Dashboard -> Settings -> API]
DATABASE_URL=postgresql://postgres:GorMahiafc100#$@db.jytudqxwlimtwseokdkg.supabase.co:5432/postgres
```

### Install Supabase Client

```bash
cd /app/backend
pip install supabase-py
```

### Example Backend Code

```python
from supabase import create_client, Client

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# Query example
response = supabase.table('jobs').select('*').eq('status', 'published').execute()
jobs = response.data
```

## Verification Checklist

After setup, verify the following:

```sql
-- 1. Check extensions
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'pg_trgm', 'postgis');

-- 2. Count tables
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
-- Expected: 30+ tables

-- 3. Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- 4. Run verification function
SELECT * FROM verify_database_setup();

-- 5. Test a query
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM jobs;
```

## Migration from MongoDB

If you need to migrate existing data from MongoDB:

1. Export MongoDB data:
```bash
mongoexport --uri="mongodb://localhost:27017/hapployed" --collection=users --out=users.json
```

2. Create migration script to transform and import data

3. Use Supabase's bulk insert functionality

## Next Steps

1. ✅ Execute all SQL scripts in Supabase
2. ✅ Verify setup using `verify_database_setup()`
3. ✅ Update backend to use Supabase client
4. ✅ Test API endpoints with new database
5. ✅ Migrate existing MongoDB data (if any)
6. ✅ Update frontend environment variables
7. ✅ Test authentication flow
8. ✅ Test job posting and applications
9. ✅ Test wallet and payments
10. ✅ Deploy to production

## Support

For issues or questions:
- Supabase Docs: https://supabase.com/docs
- Supabase Support: support@supabase.io
- Community: https://github.com/supabase/supabase/discussions

## Security Notes

⚠️ **IMPORTANT**: 
- Keep your database password secure
- Never commit API keys to version control
- Use environment variables for all credentials
- Enable RLS on all user-facing tables
- Regularly backup your database
- Monitor API usage and set up alerts

## Backup Strategy

1. **Automatic Backups**
   - Supabase provides daily backups (check your plan)
   - Backups are retained based on your plan tier

2. **Manual Backups**
   ```bash
   supabase db dump > backup_$(date +%Y%m%d).sql
   ```

3. **Restore from Backup**
   ```bash
   supabase db reset
   psql < backup_20250106.sql
   ```

---

**Setup Status**: Ready for deployment
**Last Updated**: January 2025
**Version**: 1.0
