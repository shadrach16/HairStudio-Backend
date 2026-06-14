# AI Hairstyle Studio Backend

Express API for authentication, hairstyle catalogs, AI generation, analytics, payments, rewards, push notifications, saved looks, collections, and watermark rendering.

## Local Setup

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

The API defaults to `http://localhost:5000` and exposes a health endpoint at `GET /health`.

## Required Environment

See [.env.example](.env.example) for the full template. Minimum local API startup values are:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hairstudio
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRE=30d
```

Production seed/upload workflows also require Cloudinary credentials. AI generation requires `GEMINI_API_KEY`. RevenueCat, support, cron, and benchmark routes require their corresponding tokens.

Push notifications use Firebase Admin through [services/pushService.js](services/pushService.js), which loads the service account JSON from the backend directory.

## Scripts

```powershell
npm start                 # run server.js
npm run dev               # run server.js with nodemon
npm test -- --runInBand   # run Jest tests serially
npm run benchmark:ai      # run AI benchmark harness
```

## Core Endpoints

- `GET /health`
- `POST /api/auth/google`
- `GET /api/auth/me`
- `GET /api/hairstyles`
- `POST /api/generations/generate`
- `GET /api/generations/history`
- `GET /api/payments/plans`
- `GET /api/payments/catalog`
- `POST /api/webhooks/revenuecat`
- `POST /api/push/register`

## Deployment Notes

Production runs on the VPS in `/var/www/hairstudio` under PM2 process `hairstudio`.

```powershell
ssh root@213.136.65.247 "cd /var/www/hairstudio; pm2 status"
ssh root@213.136.65.247 "cd /var/www/hairstudio; pm2 logs hairstudio --lines 100"
```

When adding new hairstyle batches, upload seed scripts to `/var/www/hairstudio/scripts/` and run them from the VPS so production MongoDB and Cloudinary credentials are used.
