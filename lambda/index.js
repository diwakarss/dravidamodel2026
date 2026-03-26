const https = require('https');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

// Helper to verify hCaptcha token
async function verifyHCaptcha(token, secret) {
    return new Promise((resolve, reject) => {
        const postData = `response=${encodeURIComponent(token)}&secret=${encodeURIComponent(secret)}`;

        const options = {
            hostname: 'hcaptcha.com',
            port: 443,
            path: '/siteverify',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    // Return full result for debugging
                    resolve(result);
                } catch (e) {
                    console.error("hCaptcha parsing error", e);
                    resolve({ success: false, 'error-codes': ['json-parse-error'] });
                }
            });
        });

        req.on('error', (e) => {
            console.error("hCaptcha request error", e);
            resolve({ success: false, 'error-codes': ['request-error'] });
        });
        req.write(postData);
        req.end();
    });
}

// Helper to send email via SES (SDK v3)
async function sendEmail(ses, params) {
    return ses.send(new SendEmailCommand(params));
}

// Helper to sanitize input
function sanitize(str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Helper to validate email format
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Helper to get CORS headers
function getCorsHeaders(origin) {
    // Allow configured domain and localhost
    const allowedOrigins = [
        process.env.ALLOWED_ORIGIN || 'https://dravidamodel2026.top',
        'http://localhost:3000'
    ];

    const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

    return {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,h-captcha-response',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
        'Access-Control-Allow-Credentials': 'true',
    };
}

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
    const headers = event.headers || {};
    const origin = headers.origin || headers.Origin || '';
    const corsHeaders = getCorsHeaders(origin);

    // Determine HTTP method (supports v1 and v2 payload)
    const method = event.requestContext?.http?.method || event.httpMethod;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: '',
        };
    }

    // Only allow POST
    if (method !== 'POST') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: `Method not allowed: ${method}` }),
        };
    }

    // Get client IP for rate limiting
    const clientIp = event.requestContext?.http?.sourceIp || // v2
        event.requestContext?.identity?.sourceIp || // v1
        headers['x-forwarded-for']?.split(',')[0] ||
        'unknown';

    // Check rate limit
    // Note: For a robust solution, use DynamoDB or Redis. This simple in-memory check
    // only works if the same Lambda container is reused, which is not guaranteed.
    // But it helps against simple bursts.
    // Implementation skipped for simplicity in this artifact, rely on WAF/Shield for heavy DDoS.

    // Parse request body
    let body;
    try {
        let rawBody = event.body || '{}';
        if (event.isBase64Encoded) {
            rawBody = Buffer.from(rawBody, 'base64').toString('utf-8');
        }
        body = JSON.parse(rawBody);
    } catch (e) {
        console.error('JSON Parse Error:', e);
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Invalid JSON request body' }),
        };
    }

    const { message, email, captchaToken } = body;

    // Validate required fields
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Message must be at least 10 characters' }),
        };
    }

    if (!captchaToken) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Captcha verification required' }),
        };
    }

    // Validate email format if provided
    if (email && !isValidEmail(email)) {
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Invalid email format' }),
        };
    }

    // Verify hCaptcha
    const hcaptchaSecret = process.env.HCAPTCHA_SECRET_KEY;
    if (!hcaptchaSecret) {
        console.error('HCAPTCHA_SECRET_KEY not configured');
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Server configuration error: Missing hCaptcha secret' }),
        };
    }

    const captchaResult = await verifyHCaptcha(captchaToken, hcaptchaSecret);

    // Log the result for debugging (check CloudWatch if needed)
    console.log('hCaptcha verification result:', JSON.stringify(captchaResult));

    if (!captchaResult.success) {
        const errorCodes = captchaResult['error-codes'] || [];
        console.error('hCaptcha verification failed:', errorCodes);
        return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({
                error: `Captcha verification failed`,
                details: errorCodes
            }),
        };
    }

    // Sanitize inputs
    const sanitizedMessage = sanitize(message);
    const sanitizedEmail = email ? sanitize(email) : 'Not provided';

    // Send email via SES
    const ses = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });

    const fromEmail = process.env.SES_FROM_EMAIL || 'noreply@b2sell.com';
    const toEmail = process.env.FEEDBACK_TO_EMAIL || 'nalan19ai@gmail.com';

    const emailParams = {
        Source: fromEmail,
        Destination: {
            ToAddresses: [toEmail],
        },
        Message: {
            Subject: {
                Data: '[DravidaModel2026] New Feedback',
                Charset: 'UTF-8',
            },
            Body: {
                Text: {
                    Data: [
                        'New feedback received from DravidaModel2026 site:',
                        '',
                        'Message:',
                        sanitizedMessage,
                        '',
                        `Email: ${sanitizedEmail}`,
                        `IP: ${clientIp}`,
                        `Time: ${new Date().toISOString()}`,
                        '',
                        '---',
                        'This is an automated message from NalaN Feedback System.',
                    ].join('\n'),
                    Charset: 'UTF-8',
                },
            },
        },
    };

    try {
        await sendEmail(ses, emailParams);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ success: true, message: 'Feedback submitted successfully' }),
        };
    } catch (error) {
        console.error('SES Error:', error);
        // Return actual error message for debugging (remove in prod if sensitive)
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: `SES Error: ${error.message}` }),
        };
    }
};
