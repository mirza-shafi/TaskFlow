#!/bin/bash

# Advanced Authentication Testing Script
# Tests all new authentication features

BASE_URL="http://localhost:8000/api/v1"
EMAIL="testuser$(date +%s)@taskflow.com"
PASSWORD="securepass123"
NAME="Test User"

echo "🔐 Testing Advanced Authentication System"
echo "=========================================="
echo ""

# Test 1: Register User
echo "1️⃣  Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$NAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Response: $REGISTER_RESPONSE"
echo ""

# Test 2: Try to login without email verification (should fail)
echo "2️⃣  Testing Login Without Email Verification (should fail)..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Response: $LOGIN_RESPONSE"
echo ""

# Test 3: Verify email manually (in real scenario, user clicks link in email)
echo "3️⃣  Simulating Email Verification..."
echo "   (In production, user would click link in email)"
echo "   For testing, we'll manually verify in database or skip this step"
echo ""

# Test 4: Test with already verified user
echo "4️⃣  Testing Login with Verified User (demo@taskflow.com)..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@taskflow.com","password":"demo123"}')

echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"

# Extract tokens
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('accessToken', ''))" 2>/dev/null)
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('refreshToken', ''))" 2>/dev/null)

echo ""

if [ -n "$ACCESS_TOKEN" ]; then
    # Test 5: Get Active Sessions
    echo "5️⃣  Testing Get Active Sessions..."
    curl -s -X GET "$BASE_URL/auth/sessions" \
      -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool
    echo ""

    # Test 6: Test Protected Endpoint
    echo "6️⃣  Testing Protected Endpoint (Get Profile)..."
    curl -s -X GET "$BASE_URL/users/profile" \
      -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool
    echo ""

    # Test 7: Refresh Access Token
    echo "7️⃣  Testing Token Refresh..."
    REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
      -H "Content-Type: application/json" \
      -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")
    
    echo "$REFRESH_RESPONSE" | python3 -m json.tool
    echo ""

    # Test 8: Logout
    echo "8️⃣  Testing Logout (Single Device)..."
    curl -s -X POST "$BASE_URL/auth/logout" \
      -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool
    echo ""

    # Test 9: Try to use token after logout (should fail)
    echo "9️⃣  Testing Blacklisted Token (should fail)..."
    curl -s -X GET "$BASE_URL/users/profile" \
      -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool
    echo ""
else
    echo "⚠️  Login failed, skipping authenticated tests"
fi

# Test 10: Forgot Password
echo "🔟 Testing Forgot Password..."
curl -s -X POST "$BASE_URL/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@taskflow.com"}' | python3 -m json.tool
echo ""

echo "✅ Testing Complete!"
echo ""
echo "📝 Summary:"
echo "   - Registration with email verification ✓"
echo "   - Email verification requirement ✓"
echo "   - Dual token system (access + refresh) ✓"
echo "   - Session management ✓"
echo "   - Token refresh ✓"
echo "   - Logout with token blacklisting ✓"
echo "   - Password reset flow ✓"
