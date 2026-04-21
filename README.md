# AutoQr

Production-ready MERN monorepo starter for `autoqr.de` with:

- Owner and admin role-based platforms
- Public QR incident reporting flow
- Stripe one-time payment + payment webhook
- Admin-only QR generation and lifecycle management
- Socket.IO real-time notifications and call signaling
- WebRTC browser audio call flow

## Tech stack

- Backend: Node.js, Express, MongoDB, Mongoose, Socket.IO, Stripe
- Frontend: React, TypeScript, Tailwind CSS, React Router, React Query
- Shared: workspace package for domain constants

## Monorepo structure

- `apps/api` - REST API + real-time signaling server
- `apps/web` - marketing site + owner/admin portals + incident page
- `packages/shared` - shared constants/types

## Local setup

1. Copy env files:
   - `cp apps/api/.env.example apps/api/.env`
   - `cp apps/web/.env.example apps/web/.env`
2. Configure Stripe keys in `apps/api/.env`.
3. Start MongoDB locally.
4. Install dependencies and run:
   - `npm install`
   - `npm run dev`

## Production deployment (Docker + external MongoDB)

Use the production compose stack:

- `docker-compose.prod.yml`
- `apps/api/Dockerfile`
- `apps/web/Dockerfile`
- `infra/nginx/autoqr.conf`

Production deployment guide:

- [`docs/deployment/production.md`](docs/deployment/production.md)

Quick start:

1. Configure env files:
   - `cp apps/api/.env.production.example apps/api/.env.production`
   - `cp .env.production.example .env.production`
2. Update secrets and URLs (external `MONGODB_URI`, JWT secrets, Stripe keys, frontend URLs).
3. Build and run:
   - `docker compose --env-file .env.production -f docker-compose.prod.yml build`
   - `docker compose --env-file .env.production -f docker-compose.prod.yml up -d`

## Environment variable references

- Backend template: `apps/api/.env.example` and `apps/api/.env.production.example`
- Frontend template: `apps/web/.env.example` and `apps/web/.env.production.example`
- Compose/frontend build template: `.env.production.example`

## Key business rules implemented

- QR is generated only after verified payment success webhook.
- QR image/token stays admin-only and is not exposed in owner APIs.
- Public scanner can report incident without account.
- Owner receives real-time incident notifications.
- Reporter and owner can establish browser audio call using Socket.IO + WebRTC.

## Important routes

- Public:
  - `/incident/:token`
- Owner:
  - `/dashboard`, `/dashboard/vehicle`, `/dashboard/incidents`, `/dashboard/calls`, `/dashboard/orders`
- Admin:
  - `/admin`, `/admin/users`, `/admin/qrs`, `/admin/shipments`, `/admin/incidents`, `/admin/calls`

## API docs

- OpenAPI skeleton available at `GET /api/docs/openapi`
