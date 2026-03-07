---
description: Secure Error Handling and Security Logging
alwaysApply: false
---

# Secure Error Handling & Logging

## Error Responses

- Return generic error messages to clients: "Authentication failed" not "Password incorrect for user admin@example.com"
- Never expose stack traces, database errors, or file paths in API responses
- Use correlation IDs to link generic client errors to detailed server logs

```typescript
// WRONG — leaks internals
res.status(500).json({ error: err.message, stack: err.stack, query: err.sql });

// CORRECT — generic response, detailed logging
const correlationId = crypto.randomUUID();
logger.error({ err, correlationId, path: req.path, userId: req.user?.id });
res.status(500).json({ error: 'Internal server error', correlationId });
```

## Security Event Logging

Log these events with structured data (who, what, when, where, outcome):

- Authentication success/failure (with IP, user-agent)
- Authorization denial
- Input validation failure (log the field name, not the value)
- Privilege escalation (role changes, admin access)
- Resource access outside normal patterns
- Configuration changes
- Dependency vulnerability detections

**Never log:** passwords, tokens, API keys, full credit card numbers, SSNs, or other PII.

## Alerting Triggers

- 5+ failed logins from same IP in 15 minutes
- Login from new country/device for sensitive accounts
- Privilege escalation events
- Spike in 401/403 responses
- Unexpected outbound network connections
