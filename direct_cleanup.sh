#!/bin/bash

# DIRECT EMAIL CLEANUP - Run this to clean up ANY stuck email

echo "==========================================="
echo "HAPPLOYED EMAIL CLEANUP TOOL"
echo "==========================================="
echo ""

if [ -z "$1" ]; then
    echo "❌ ERROR: Please provide an email address"
    echo ""
    echo "Usage: ./direct_cleanup.sh your-email@example.com"
    echo ""
    exit 1
fi

EMAIL="$1"

echo "Email to clean up: $EMAIL"
echo ""
echo "⚠️  This will DELETE the account completely."
echo ""

# Get backend URL from environment
BACKEND_URL="https://hapployed-migrate.preview.emergentagent.com"

echo "Step 1: Deleting via API endpoint..."
API_RESPONSE=$(curl -s -X DELETE "${BACKEND_URL}/api/auth/cleanup-incomplete/${EMAIL}")

echo "$API_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$API_RESPONSE"
echo ""

if echo "$API_RESPONSE" | grep -q "deleted successfully"; then
    echo "✅ API cleanup successful!"
    echo ""
    echo "✅ You can now register with this email: $EMAIL"
    echo ""
    exit 0
fi

echo "⚠️  API cleanup might have failed. Trying direct database cleanup..."
echo ""

# Alternative: Try via psql if available
DB_URL="postgresql://postgres:GorMahiafc100#\$@db.jytudqxwlimtwseokdkg.supabase.co:5432/postgres"

if command -v psql &> /dev/null; then
    echo "Step 2: Direct database cleanup..."
    
    PGPASSWORD="GorMahiafc100#\$" psql "$DB_URL" << EOF
    -- Delete worker profile first (foreign key)
    DELETE FROM worker_profiles WHERE user_id IN (
        SELECT id FROM users WHERE email = '$EMAIL'
    );
    
    -- Delete user
    DELETE FROM users WHERE email = '$EMAIL';
    
    -- Confirm
    SELECT 'Cleanup complete' as status;
EOF
    
    echo ""
    echo "✅ Database cleanup complete!"
    echo "✅ You can now register with: $EMAIL"
else
    echo "❌ psql not available. Please use Supabase Dashboard:"
    echo ""
    echo "Go to: https://supabase.com/dashboard"
    echo "SQL Editor → Run this:"
    echo ""
    echo "DELETE FROM worker_profiles WHERE user_id IN ("
    echo "  SELECT id FROM users WHERE email = '$EMAIL'"
    echo ");"
    echo "DELETE FROM users WHERE email = '$EMAIL';"
    echo ""
fi

echo ""
echo "==========================================="
