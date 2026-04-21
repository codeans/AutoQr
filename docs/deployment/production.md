# AutoQR Production Deployment Guide

This guide prepares AutoQR for repeatable server deployment with Docker Compose, an external MongoDB, and persistent uploads.

## 1) Prerequisites

- Linux server with Docker Engine and Docker Compose plugin installed.
- DNS record pointed to the server (for example `app.example.com`).
- External MongoDB connection string (`MONGODB_URI`) with network access from the server.
- Valid Stripe production credentials if payment is enabled.

## 2) Pull from GitHub

```bash
git clone <your-repo-url> autoqr
cd autoqr
```

For updates:

```bash
git pull --ff-only
```

## 3) Configure environment files

Create backend runtime env:

```bash
cp apps/api/.env.production.example apps/api/.env.production
```

Create compose/web build env:

```bash
cp .env.production.example .env.production
```

Required backend keys in `apps/api/.env.production`:

- `NODE_ENV=production`
- `PORT=4000`
- `MONGODB_URI` (external Mongo, never local container in compose)
- `CLIENT_URL` and `CORS_ORIGINS`
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- `PUBLIC_BASE_URL`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (if using Stripe)
- `UPLOAD_DIR=/app/uploads`
- `UPLOAD_MAX_MB`, `BODY_LIMIT_MB`

Required web build keys in `.env.production`:

- `VITE_API_URL` (for example `https://app.example.com/api`)
- `VITE_SOCKET_URL` (for example `https://app.example.com`)
- `VITE_WEBRTC_ICE_SERVERS` (JSON array of STUN/TURN entries)

## 4) Build and start

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml build --no-cache
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

Services:

- `nginx` listens on port `80` and proxies `/api`, `/socket.io`, `/uploads`.
- `backend` listens internally on `4000`.
- `frontend` serves built static app internally on `80`.
- MongoDB is external only through `MONGODB_URI`.

## 5) Health and logs

Check status:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

Health checks:

- Backend readiness: `GET /api/health/ready`
- Backend liveness: `GET /api/health`
- Edge health: `GET /health`

View logs:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f backend
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f nginx
```

## 6) Upload persistence

- Uploads are stored in Docker volume `autoqr_uploads`.
- Volume is mounted at `/app/uploads` in backend container.
- Files survive container restarts and image redeploys.
- Public file serving is proxied from `/uploads/*`.

To inspect volume:

```bash
docker volume inspect autoqr_uploads
```

## 7) Redeploy and rollback

Redeploy:

```bash
git pull --ff-only
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

Rollback (example):

```bash
git checkout <last-known-good-tag-or-commit>
docker compose --env-file .env.production -f docker-compose.prod.yml build
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

## 8) Troubleshooting

- **Backend unhealthy:** verify `MONGODB_URI` connectivity, DB user permissions, and firewall rules.
- **Frontend cannot call API:** verify `VITE_API_URL`, `CLIENT_URL`, and `CORS_ORIGINS`.
- **Sockets fail behind domain:** verify Nginx `/socket.io` upgrade config and `VITE_SOCKET_URL`.
- **Calls fail for some users:** add TURN entries in `VITE_WEBRTC_ICE_SERVERS`.
- **Uploads missing after restart:** verify backend uses `UPLOAD_DIR=/app/uploads` and `autoqr_uploads` volume is attached.
