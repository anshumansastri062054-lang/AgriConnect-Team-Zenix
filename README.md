# AgriConnect — Land to Market Digital Agriculture Ecosystem

Team Zenix — SIH-ready full-stack starter and interactive demo.

## What is included

- Farmer-first, mobile-responsive UI
- Demo Aadhaar/Farmer ID/Mobile OTP login flows using synthetic data
- Farmer dashboard with connected Land → Soil → Crop → Tools → Harvest → Procurement → Token → Payment journey
- Land discovery and rental requests
- Agricultural equipment marketplace and booking conflict prevention
- Land Health Card
- Explainable rule-based crop recommendation engine
- Cultivation and harvest records
- Government procurement demo workflow
- Cryptographic procurement token references + QR verification page
- Transparent Farmer Crop Reliability Score
- Digital Mitra workflow
- Partner ecosystem UI
- In-app notifications
- Demo Complete Farmer Journey simulator
- Express + TypeScript API starter
- PostgreSQL + Prisma schema
- Security-oriented middleware structure
- API documentation starter
- Docker Compose for PostgreSQL
- Clear DEMO vs integration-ready boundaries

## Important identity note

The included Aadhaar flow is DEMO ONLY. It does not process real Aadhaar data. Production deployment must use an authorized identity/authentication provider and applicable UIDAI/legal requirements.

## Run the frontend demo

The quickest demo is the frontend in `apps/web/index.html`.

Open it directly in a browser, or serve the folder with a static server.

## Run the API

```bash
cd apps/api
npm install
npm run dev
```

Copy `.env.example` to `.env`.

## Database

```bash
docker compose up -d postgres
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

## Production notes

This repository is deliberately integration-ready rather than falsely claiming live government integrations. Replace demo identity, procurement and payment adapters with authorized services before production.

## Suggested deployment

- Web: Vercel/Netlify
- API: Render/Railway/AWS
- PostgreSQL: Supabase/AWS RDS/managed PostgreSQL
- Object storage: Cloudinary/S3-compatible storage

## Demo credentials

- Farmer: `DEMO-FARMER-001`
- Digital Mitra: `DEMO-MITRA-001`
- Procurement Officer: `DEMO-OFFICER-001`
- Admin: `DEMO-ADMIN-001`
- Demo OTP: `123456`

All demo data is synthetic.
