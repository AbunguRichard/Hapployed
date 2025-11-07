#!/bin/bash

# ============================================
# HAPPLOYED SUPABASE SETUP - QUICK START
# ============================================

echo "🚀 Starting Hapployed Supabase Database Setup..."
echo ""

# Supabase project details
PROJECT_REF="jytudqxwlimtwseokdkg"
SUPABASE_URL="https://jytudqxwlimtwseokdkg.supabase.co"
DB_PASSWORD="GorMahiafc100#\$"

echo "📋 Project Information:"
echo "   Organization: Hapployed.OrgFree"
echo "   Project REF: $PROJECT_REF"
echo "   API URL: $SUPABASE_URL"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ psql not found. Please install PostgreSQL client:"
    echo "   Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "   MacOS: brew install postgresql"
    exit 1
fi

echo "✅ PostgreSQL client found"
echo ""

# Directory containing SQL files
SQL_DIR="/app/supabase"

if [ ! -d "$SQL_DIR" ]; then
    echo "❌ SQL directory not found: $SQL_DIR"
    exit 1
fi

echo "📂 Found SQL directory: $SQL_DIR"
echo ""

# Connection string
DB_URL="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

echo "🔌 Testing database connection..."
if ! PGPASSWORD="$DB_PASSWORD" psql "$DB_URL" -c "SELECT version();" > /dev/null 2>&1; then
    echo "❌ Failed to connect to database"
    echo "   Please check your credentials and network connection"
    exit 1
fi

echo "✅ Database connection successful"
echo ""

# Execute SQL files in order
SQL_FILES=(
    "01_extensions_and_setup.sql"
    "02_user_tables.sql"
    "03_jobs_and_applications.sql"
    "04_financial_tables.sql"
    "05_verification_and_skills.sql"
    "06_communication_and_community.sql"
    "07_rls_policies.sql"
    "08_functions_and_views.sql"
    "09_sample_data_and_verification.sql"
)

echo "📝 Executing SQL migration scripts..."
echo ""

for sql_file in "${SQL_FILES[@]}"; do
    file_path="${SQL_DIR}/${sql_file}"
    
    if [ ! -f "$file_path" ]; then
        echo "⚠️  File not found: $sql_file (skipping)"
        continue
    fi
    
    echo "   ⏳ Executing: $sql_file"
    
    if PGPASSWORD="$DB_PASSWORD" psql "$DB_URL" -f "$file_path" > /dev/null 2>&1; then
        echo "   ✅ Completed: $sql_file"
    else
        echo "   ❌ Failed: $sql_file"
        echo "   Check the file for errors and try again"
        exit 1
    fi
done

echo ""
echo "🔍 Verifying database setup..."
echo ""

# Run verification query
VERIFY_QUERY="SELECT check_name, status, details FROM verify_database_setup();"
PGPASSWORD="$DB_PASSWORD" psql "$DB_URL" -c "$VERIFY_QUERY"

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📊 Quick Stats:"
PGPASSWORD="$DB_PASSWORD" psql "$DB_URL" -c "
SELECT 
    'Tables Created' as metric, 
    COUNT(*)::TEXT as value 
FROM information_schema.tables 
WHERE table_schema = 'public'
UNION ALL
SELECT 
    'Extensions Enabled',
    COUNT(*)::TEXT
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pg_trgm', 'postgis')
UNION ALL
SELECT
    'RLS Enabled Tables',
    COUNT(*)::TEXT
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true;
"

echo ""
echo "🎉 Hapployed database is ready to use!"
echo ""
echo "Next steps:"
echo "1. Update backend .env with Supabase credentials"
echo "2. Install supabase-py: pip install supabase-py"
echo "3. Update API endpoints to use Supabase client"
echo "4. Test authentication and data operations"
echo ""
echo "📚 Documentation: /app/supabase/README.md"
echo ""
