---
description: Security Headers, CORS, and API Hardening
alwaysApply: false
---

# Security Headers & API Hardening

## Recommended HTTP Headers

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.example.com; frame-ancestors 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## CORS Configuration

- Never use Access-Control-Allow-Origin: * for authenticated endpoints
- Whitelist specific origins; validate against an allowlist, not a regex
- Set Access-Control-Allow-Credentials: true only when needed; pair with specific origin
- Limit Access-Control-Allow-Methods to what the API actually uses
- Set Access-Control-Max-Age to cache preflight responses

## Rate Limiting Strategy

| Endpoint Type | Limit | Window | Action on Exceed |
|--------------|-------|--------|-----------------|
| Authentication | 5 requests | 15 min / IP | 429 + exponential backoff |
| Password reset | 3 requests | 1 hour / account | 429 + silent |
| Read endpoints | 100 requests | 1 min / token | 429 + Retry-After header |
| Write endpoints | 20 requests | 1 min / token | 429 + Retry-After header |
| File upload | 5 requests | 1 hour / user | 429 |

## API Key Security

- Generate with crypto.randomBytes(32) (256 bits entropy)
- Store hashed (SHA-256 is fine for high-entropy values); show the key once at creation
- Scope keys to specific endpoints, IP ranges, or rate limits
- Expire keys on a schedule; support key rotation without downtime

## Secure Defaults

- HTTPS everywhere; redirect HTTP to HTTPS; set HSTS
- Disable directory listing, debug endpoints, verbose error pages in production
- Use .env files (gitignored) with .env.example (committed); support rotation without downtime
