---
description: Authentication and Authorization Patterns
alwaysApply: false
---

# Authentication & Authorization

## Password Storage

- Passwords: bcrypt (cost >= 12) or argon2id — never SHA-256, never MD5
- argon2id is preferred (memory-hard, resists GPU attacks)

## Token Architecture

- Access tokens (JWT): short-lived (15 min max), stateless verification, sent in Authorization header
- Refresh tokens: long-lived (7-30 days), stored server-side (allows revocation), rotated on each use
- Store refresh tokens in HTTP-only, Secure, SameSite=Strict cookies
- Never store tokens in localStorage (XSS-accessible)

## Authorization Checklist

- Auth check happens server-side on every request, not just UI hiding
- User can only access resources they own (IDOR check: WHERE user_id = $authenticated_user)
- Role/permission checked at the handler level, not just middleware
- Admin endpoints on separate routes with additional auth requirements
- Rate limiting on auth endpoints: 5 attempts / 15 min / IP; exponential backoff
- Session regenerated after login and privilege escalation
- Logout invalidates both access and refresh tokens server-side

## OAuth / OIDC

- Always validate the state parameter to prevent CSRF
- Use PKCE for public clients (SPAs, mobile apps)
- Validate id_token signature and claims (iss, aud, exp, nonce)
- Never store access tokens in localStorage; use HTTP-only cookies or in-memory with refresh flow

## MFA

- TOTP or WebAuthn for privileged accounts
- SMS is last resort (SIM swap attacks)
- Enforce MFA for admin access and sensitive operations
