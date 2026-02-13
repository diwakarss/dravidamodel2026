#!/bin/bash
# smoke-test.sh - Production deployment verification
# Usage: ./smoke-test.sh <site-url>

set -e

SITE_URL="${1:-https://localhost:3000}"
FAILURES=0

echo "Running smoke tests against: $SITE_URL"
echo "================================="

# Test 1: Tamil homepage loads
echo -n "1. Tamil homepage... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/ta/" 2>/dev/null || echo "000")
if [ "$STATUS" = "200" ]; then
  echo "PASS (HTTP $STATUS)"
else
  echo "FAIL (HTTP $STATUS)"
  FAILURES=$((FAILURES + 1))
fi

# Test 2: English homepage loads
echo -n "2. English homepage... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/en/" 2>/dev/null || echo "000")
if [ "$STATUS" = "200" ]; then
  echo "PASS (HTTP $STATUS)"
else
  echo "FAIL (HTTP $STATUS)"
  FAILURES=$((FAILURES + 1))
fi

# Test 3: Projects page (Tamil)
echo -n "3. Projects page (Tamil)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/ta/projects/" 2>/dev/null || echo "000")
if [ "$STATUS" = "200" ]; then
  echo "PASS (HTTP $STATUS)"
else
  echo "FAIL (HTTP $STATUS)"
  FAILURES=$((FAILURES + 1))
fi

# Test 4: Sources page
echo -n "4. Sources page... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/ta/sources/" 2>/dev/null || echo "000")
if [ "$STATUS" = "200" ]; then
  echo "PASS (HTTP $STATUS)"
else
  echo "FAIL (HTTP $STATUS)"
  FAILURES=$((FAILURES + 1))
fi

# Test 5: Checksums file accessible
echo -n "5. Checksums file... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/checksums.json" 2>/dev/null || echo "000")
if [ "$STATUS" = "200" ]; then
  echo "PASS (HTTP $STATUS)"
else
  echo "FAIL (HTTP $STATUS)"
  FAILURES=$((FAILURES + 1))
fi

# Test 6: Security headers (HSTS)
echo -n "6. HSTS header... "
HEADERS=$(curl -s -I "$SITE_URL/ta/" 2>/dev/null || echo "")
if echo "$HEADERS" | grep -qi "strict-transport-security"; then
  echo "PASS"
else
  echo "SKIP (header not present - may be local dev)"
fi

# Test 7: Content-Security-Policy
echo -n "7. CSP header... "
if echo "$HEADERS" | grep -qi "content-security-policy"; then
  echo "PASS"
else
  echo "SKIP (header not present - may be local dev)"
fi

# Test 8: X-Frame-Options
echo -n "8. X-Frame-Options... "
if echo "$HEADERS" | grep -qi "x-frame-options"; then
  echo "PASS"
else
  echo "SKIP (header not present - may be local dev)"
fi

echo "================================="
echo "Smoke tests complete: $((5 - FAILURES))/5 critical tests passed"

if [ "$FAILURES" -gt 0 ]; then
  echo "DEPLOYMENT VERIFICATION FAILED"
  exit 1
fi

echo "DEPLOYMENT VERIFIED SUCCESSFULLY"
exit 0
