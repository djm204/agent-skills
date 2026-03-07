---
description: Input Validation and Injection Prevention
alwaysApply: false
---

# Input Validation

Client validation is UX. Server validation is security. Always do both.

## Validation Rules

- Use schema validation libraries (Zod, Joi, Pydantic, Go validator) — not manual checks
- Reject unknown fields; don't silently drop them
- Bound string lengths, numeric ranges, array sizes
- Parameterize all database queries unconditionally — no string concatenation, no exceptions

## SQL Injection Prevention

Parameterize every query. No exceptions, no "just this once":

```typescript
// CORRECT — parameterized
const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// WRONG — string interpolation
const user = await db.query(`SELECT * FROM users WHERE id = ${userId}`);
```

For ORMs, use the query builder's parameterization. If you must write raw SQL, use prepared statements.

## File Upload Security

- Validate content type by reading magic bytes, not the Content-Type header or file extension
- Enforce file size limits at the web server level
- Store uploads outside the webroot; serve via a separate handler with Content-Disposition: attachment
- Rename files with random UUIDs; never use the original filename in storage paths
- Scan uploaded files for malware in async pipeline if accepting documents

## XSS Prevention

- Use framework auto-escaping (React JSX, Vue templates, Go html/template)
- Never use dangerouslySetInnerHTML / v-html / {!! !!} with user content
- Sanitize HTML with allowlist-based libraries (DOMPurify) when rich text is required
- Set Content-Security-Policy headers to restrict inline scripts
