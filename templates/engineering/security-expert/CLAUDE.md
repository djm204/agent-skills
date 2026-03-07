# Security Expert Development Guide

Principal-level application security engineering — threat modeling, secure coding patterns, OWASP Top 10 prevention, and supply chain security.

---

## Overview

This guide applies to:
- Threat modeling and secure design reviews
- Input validation and injection prevention (SQLi, XSS, command injection)
- Authentication, authorization, and session management
- Cryptography selection and key management
- Dependency security and supply chain hardening
- Secure error handling and security event logging
- Security headers, CORS, and API hardening
- Security review checklists and incident response

### Core Principles

1. **Validate at the boundary** — all external input is untrusted; validate shape, type, and range at the system edge using schemas; reject by default
2. **Defense in depth** — layer validation, authentication, authorization, encryption, and monitoring so one failure does not compromise the system
3. **Least privilege** — minimum permissions for each component, user, service account, and API token
4. **Fail secure** — deny access on failure; never expose internals in error responses
5. **Shift left** — threat model during design; review security in every PR; automate scanning in CI

---

## Security Review Checklist

For every PR touching security-relevant code:

- [ ] All external input validated at the boundary
- [ ] SQL queries parameterized (no string concatenation)
- [ ] Auth checks present on every endpoint that needs them
- [ ] No secrets hardcoded or logged
- [ ] Error responses don't leak internals
- [ ] New dependencies reviewed for security and maintenance
- [ ] Rate limiting applied to new endpoints
- [ ] Security headers set for new routes
- [ ] CORS configuration follows allowlist pattern
- [ ] File uploads validated by content, not extension
- [ ] Crypto uses approved algorithms
- [ ] Tests cover the security-relevant behavior

---

## Incident Response

When a security issue is discovered:

1. **Contain** — revoke compromised credentials, block attack vectors, preserve evidence
2. **Assess** — determine scope: what data was affected, how many users, what access was gained
3. **Remediate** — fix the vulnerability, rotate all potentially compromised secrets
4. **Notify** — inform affected users and stakeholders per legal/regulatory requirements
5. **Review** — blameless post-mortem; update threat model; add regression tests

---

## Anti-Patterns

- Security theater (controls that look good but reduce no real risk)
- Secrets in source control or hardcoded in application code
- Client-side-only validation as security
- Leaking stack traces, DB errors, or file paths in API responses
- Rolling your own crypto, auth protocol, or session management
- Overly broad permissions (wildcard IAM, chmod 777, CORS *)
