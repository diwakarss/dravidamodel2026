# Security Configuration

## CloudFront Security Headers

Add these headers via CloudFront Response Headers Policy or Lambda@Edge:

```json
{
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hcaptcha.com https://*.hcaptcha.com; style-src 'self' 'unsafe-inline' https://hcaptcha.com https://*.hcaptcha.com; img-src 'self' data: https:; font-src 'self' data:; frame-src https://hcaptcha.com https://*.hcaptcha.com; connect-src 'self' https://hcaptcha.com https://*.hcaptcha.com",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
}
```

### CloudFront Console Setup

1. Go to CloudFront → Policies → Response headers policies
2. Create custom policy with headers above
3. Attach to distribution behavior

## Rate Limiting

### Client-Side (Chat)
- 20 messages per minute window
- Persisted in localStorage (survives refresh)
- Resets every 60 seconds

### Server-Side (Lambda Feedback API)
- IP-based: 10 requests per hour per IP
- Implement via API Gateway throttling or Lambda logic

## hCaptcha Configuration

### Environment Variables

See `.env.example` for client-side configuration.

```
# Client-side (Next.js build)
NEXT_PUBLIC_FEEDBACK_API=https://your-api-gateway-id.execute-api.us-east-1.amazonaws.com/feedback
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your-site-key

# Server-side (Lambda only - never commit!)
HCAPTCHA_SECRET_KEY=your-secret-key
```

### Test Keys (Development)
- Site Key: `10000000-ffff-ffff-ffff-000000000001`
- Secret Key: `0x0000000000000000000000000000000000000000`

### Production Setup
1. Sign up at https://www.hcaptcha.com/
2. Add site domain to hCaptcha dashboard
3. Get site key and secret key
4. Set environment variables

## Lambda Feedback API Security

### Required Validations
1. Verify hCaptcha token server-side
2. Validate email format (if provided)
3. Sanitize message content
4. Rate limit by IP (10/hour)

### hCaptcha Verification
```javascript
const verifyResponse = await fetch('https://hcaptcha.com/siteverify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: `response=${captchaToken}&secret=${process.env.HCAPTCHA_SECRET_KEY}`
});
const { success } = await verifyResponse.json();
if (!success) return { statusCode: 400, body: 'Invalid captcha' };
```

## DDoS Protection

CloudFront Shield Standard provides:
- Automatic DDoS mitigation for L3/L4 attacks
- Always-on detection and inline mitigation
- No additional cost

Consider Shield Advanced for:
- L7 attack protection
- Real-time metrics
- 24/7 DRT access

## Prompt Injection Protection

The chatbot uses keyword matching (no LLM), making traditional prompt injection impossible.
Additional safeguards:
- Regex-based injection pattern detection
- Rejection response for suspicious queries
- No user input passed to any AI model

## Checklist Before Deploy

- [ ] Set NEXT_PUBLIC_HCAPTCHA_SITE_KEY in build environment
- [ ] Configure CloudFront response headers policy
- [ ] Set up Lambda with HCAPTCHA_SECRET_KEY
- [ ] Configure API Gateway throttling
- [ ] Verify SES sending limits (50/day sandbox, higher after verification)
- [ ] Test captcha in production mode
