#!/bin/bash

# Configuration
API_URL="https://YOUR_API_GATEWAY_ID.execute-api.us-east-1.amazonaws.com/feedback"
CAPTCHA_TOKEN="10000000-aaaa-bbbb-cccc-000000000001" # Test token (hCaptcha test keys often work, or this might fail but show backend logic)

# Payload
PAYLOAD=$(cat <<EOF
{
  "name": "Test User",
  "email": "test@example.com",
  "message": "This is a direct API test message to debug the backend.",
  "captchaToken": "$CAPTCHA_TOKEN",
  "h-captcha-response": "$CAPTCHA_TOKEN" 
}
EOF
)

echo "🚀 Sending test request to $API_URL..."
echo "Payload: $PAYLOAD"
echo "---------------------------------------------------"

curl -v -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Origin: https://dravidamodel2026.top" \
  -d "$PAYLOAD"

echo ""
echo "---------------------------------------------------"
