# AgriConnect Architecture

Browser → Web UI → REST API → Service modules → PostgreSQL/Prisma.

Core bounded modules: auth/identity, farmers, land, equipment, soil/crops, cultivation, procurement/tokens, payments, Mitra/partners, notifications and audit.

Security boundary: identity verification is intentionally separated from farmer application data. Public QR verification uses a token reference and does not expose sensitive identity data.

Demo boundary: synthetic authentication, procurement and payment flows are marked DEMO. Production adapters should be added behind interfaces before live deployment.
