---
description: Cryptography Selection and Key Management
alwaysApply: false
---

# Cryptography

Don't invent crypto. Use well-reviewed libraries (libsodium, Web Crypto API, crypto module).

## Decision Guide

| Need | Use | Avoid |
|------|-----|-------|
| Password hashing | argon2id or bcrypt (cost >= 12) | SHA-*, MD5, scrypt |
| Symmetric encryption | AES-256-GCM | AES-ECB, AES-CBC without HMAC, DES |
| Asymmetric encryption | RSA-OAEP (2048+) or X25519 | RSA-PKCS1v1.5, key sizes < 2048 |
| Signing | Ed25519 or ECDSA P-256 | RSA with SHA-1, HMAC with short keys |
| Random values | crypto.randomBytes / secrets.token_urlsafe / crypto/rand | Math.random(), random.random() |
| TLS | 1.2+ only, prefer 1.3 | SSL, TLS 1.0, TLS 1.1 |

## Key Management Rules

- Rotate encryption keys on a schedule (quarterly minimum); support key versioning
- Separate encryption keys from signing keys
- Never store keys in the same database as the data they protect
- Use a secrets manager (Vault, AWS Secrets Manager, GCP Secret Manager) for key storage
- Derive per-purpose keys using HKDF from a root key — prevents cross-context reuse

## Hashing (non-password)

- SHA-256 minimum for integrity checks
- Include purpose prefix to prevent cross-context reuse
- Use HMAC when you need to verify both integrity and authenticity
