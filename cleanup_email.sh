#!/bin/bash

# Cleanup Incomplete Registration Helper Script
# Use this if you have an email that's stuck as "already registered" but you can't login

BACKEND_URL="https://talentswitch.preview.emergentagent.com/api"

if [ -z "$1" ]; then
    echo "Usage: ./cleanup_email.sh <email_address>"
    echo ""
    echo "Example: ./cleanup_email.sh test@example.com"
    echo ""
    echo "This will delete the incomplete registration so you can sign up again."
    exit 1
fi

EMAIL=$1

echo "================================================"
echo "CLEANUP INCOMPLETE REGISTRATION"
echo "================================================"
echo ""
echo "Email: $EMAIL"
echo ""
echo "⚠️  This will DELETE the account for this email."
echo "   Press CTRL+C to cancel, or wait 3 seconds to continue..."
echo ""

sleep 3

echo "Cleaning up registration for $EMAIL..."
echo ""

RESPONSE=$(curl -s -X DELETE "${BACKEND_URL}/auth/cleanup-incomplete/${EMAIL}")

echo "Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q "deleted successfully"; then
    echo "✅ Cleanup successful!"
    echo "   You can now register with this email again."
else
    echo "❌ Cleanup failed or email not found"
    echo "   The email might not exist in the database."
fi

echo ""
echo "================================================"
