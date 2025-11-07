#!/bin/bash

# Test Supabase Registration and Login

BACKEND_URL="https://hapployed-migrate.preview.emergentagent.com/api"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@hapployed.com"
TEST_PASSWORD="TestPass123!"
TEST_NAME="Test User ${TIMESTAMP}"

echo "================================================"
echo "TESTING SUPABASE AUTHENTICATION"
echo "================================================"
echo ""

# Test 1: Register a new user
echo "1. Testing Registration..."
echo "   Email: $TEST_EMAIL"
echo "   Password: $TEST_PASSWORD"
echo ""

REGISTER_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"name\": \"${TEST_NAME}\",
    \"role\": \"worker\"
  }")

echo "Registration Response:"
echo "$REGISTER_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

# Check if registration was successful
if echo "$REGISTER_RESPONSE" | grep -q "access_token"; then
    echo "✅ Registration SUCCESSFUL!"
    echo ""
    
    # Extract token for testing
    ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
    
    # Test 2: Login with same credentials
    echo "2. Testing Login with same credentials..."
    LOGIN_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/auth/login" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"${TEST_EMAIL}\",
        \"password\": \"${TEST_PASSWORD}\"
      }")
    
    echo "Login Response:"
    echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"
    echo ""
    
    if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
        echo "✅ Login SUCCESSFUL!"
    else
        echo "❌ Login FAILED"
    fi
    
    # Test 3: Get current user info
    if [ -n "$ACCESS_TOKEN" ]; then
        echo ""
        echo "3. Testing Get Current User..."
        USER_RESPONSE=$(curl -s -X GET "${BACKEND_URL}/auth/me" \
          -H "Authorization: Bearer ${ACCESS_TOKEN}")
        
        echo "User Info Response:"
        echo "$USER_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$USER_RESPONSE"
        echo ""
        
        if echo "$USER_RESPONSE" | grep -q "email"; then
            echo "✅ Get User Info SUCCESSFUL!"
        else
            echo "❌ Get User Info FAILED"
        fi
    fi
    
else
    echo "❌ Registration FAILED"
    echo ""
    echo "Please check:"
    echo "1. Have you disabled RLS in Supabase?"
    echo "2. Is the backend connected to Supabase?"
    echo "3. Check backend logs for errors"
fi

echo ""
echo "================================================"
echo "TEST COMPLETE"
echo "================================================"
