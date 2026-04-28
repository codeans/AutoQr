# AutoQr

Production-ready MERN monorepo starter for `autoqr.de` with:

- Owner and admin role-based platforms
- Public QR incident reporting flow
- Stripe one-time payment + payment webhook
- Admin-only QR generation and lifecycle management
- Socket.IO real-time notifications and call signaling
- Agora-powered voice calling for masked incident calls

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

## Production deployment (Docker + GitHub Actions + Hetzner VPS)

The production stack now uses:

- `docker-compose.yml`
- `docker-compose.prod.yml`
- `apps/api/Dockerfile`
- `apps/web/Dockerfile`
- `.github/workflows/deploy.yml`
- `infra/nginx/autoqr.conf`

Deployment guide:

- [`README_DEPLOYMENT.md`](README_DEPLOYMENT.md)
- [`docs/deployment/production.md`](docs/deployment/production.md)

## Environment variable references

- Backend template: `apps/api/.env.example`
- Frontend template: `apps/web/.env.example`
- VPS deployment template: `.env.example`

## Key business rules implemented

- QR is generated only after verified payment success webhook.
- QR image/token stays admin-only and is not exposed in owner APIs.
- Public scanner can report incident without account.
- Owner receives real-time incident notifications.
- Reporter and owner can establish masked voice calls through Agora RTC, with Socket.IO kept for call state sync.

## Important routes

- Public:
  - `/incident/:token`
- Owner:
  - `/dashboard`, `/dashboard/vehicle`, `/dashboard/incidents`, `/dashboard/calls`, `/dashboard/orders`
- Admin:
  - `/admin`, `/admin/users`, `/admin/qrs`, `/admin/shipments`, `/admin/incidents`, `/admin/calls`

## API docs

- OpenAPI skeleton available at `GET /api/docs/openapi`
