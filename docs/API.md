# API starter

- GET `/api/health`
- POST `/api/auth/mobile/send-otp`
- POST `/api/auth/mobile/verify-otp`
- GET `/api/lands`
- POST `/api/lands/:id/request`
- GET `/api/equipment`
- POST `/api/equipment/:id/book`
- POST `/api/recommendations`
- POST `/api/tokens/generate`
- GET `/api/tokens/:id/verify`

Production expansion should add authorization guards, pagination, filtering, ownership checks, refresh-token rotation, persistent repositories and integration adapters.
