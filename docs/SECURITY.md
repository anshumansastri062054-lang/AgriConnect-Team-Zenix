# Security checklist

Implemented/starter:
- Helmet
- CORS boundary
- Zod validation
- Prisma parameterized access
- Sensitive identity separation in schema
- Cryptographic token hash
- Demo-only identity boundary

Before production:
- Argon2id password hashing
- Short-lived JWT + refresh rotation
- HTTP-only secure cookies
- CSRF protection where cookie-authenticated
- Redis-backed OTP/session rate limits
- RBAC guards on every privileged endpoint
- Malware scanning and MIME validation for uploads
- Encryption at rest and in transit
- Centralized audit logging
- Secrets manager
- Dependency/SAST/DAST scans
- Authorized identity/government/payment integrations only
