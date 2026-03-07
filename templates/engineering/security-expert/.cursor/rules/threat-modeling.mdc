---
description: Threat Modeling and Secure Design
alwaysApply: false
---

# Threat Modeling

Before writing code, identify what can go wrong. Apply this at feature design, not after deployment.

## STRIDE per Trust Boundary

For each place where trusted meets untrusted (browser <-> API, service <-> database, internal <-> third-party), evaluate:

| Threat | Question | Mitigation Pattern |
|--------|----------|-------------------|
| **Spoofing** | Can an attacker pretend to be someone else? | Strong authentication, mutual TLS, API key validation |
| **Tampering** | Can data be modified in transit or at rest? | HMAC signatures, TLS, checksums, immutable audit logs |
| **Repudiation** | Can a user deny they performed an action? | Audit logging with tamper-evident storage, signed timestamps |
| **Information Disclosure** | Can sensitive data leak? | Encryption at rest/transit, field-level access control, log redaction |
| **Denial of Service** | Can the system be overwhelmed? | Rate limiting, circuit breakers, resource quotas, CDN |
| **Elevation of Privilege** | Can a user gain unauthorized access? | RBAC/ABAC enforcement, input validation, sandboxing |

## Threat Model Workflow

1. Draw the data flow diagram — actors, processes, data stores, trust boundaries
2. Enumerate threats using STRIDE for each boundary crossing
3. Score by impact x likelihood (critical/high/medium/low)
4. Define mitigations: prevent, detect, or accept (with documented rationale)
5. Track as security requirements alongside functional requirements

## Assets to Protect

- User PII, payment data, credentials
- Admin access, API keys, service accounts
- Business logic (pricing, permissions, feature flags)
- Infrastructure secrets (database credentials, TLS certs)
