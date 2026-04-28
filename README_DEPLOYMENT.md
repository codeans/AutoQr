# AutoQr Production Deployment

This setup deploys AutoQr to the Hetzner VPS at `91.99.142.173` and keeps production data safe.

## Stack

- Server: Hetzner Ubuntu VPS
- Deploy path: `/var/www/autoqr`
- Trigger: GitHub Actions on `push` to `main` and manual `workflow_dispatch`
- Containers: `frontend`, `backend`, `mongodb`
- Reverse proxy: host Nginx
- SSL: Let's Encrypt
- MongoDB: internal Docker container with persistent volume
- Safe deploy commands:
  - `git pull origin main`
  - `docker compose up -d --build`
  - `docker image prune -f`

## Files Included

- `.github/workflows/deploy.yml`
- `docker-compose.yml`
- `docker-compose.prod.yml`
- `apps/api/Dockerfile`
- `apps/web/Dockerfile`
- `.dockerignore`
- `.env.example`
- `infra/nginx/autoqr.conf`

## 1. Server Preparation

Install Docker, the Compose plugin, Nginx, and Certbot on the Ubuntu server:

```bash
apt update
apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx
systemctl enable --now docker nginx
mkdir -p /var/www/autoqr
```

Clone the repo once on the server:

```bash
cd /var/www
git clone <your-repository-url> autoqr
cd /var/www/autoqr
cp .env.example .env
```

Edit `/var/www/autoqr/.env` and set real production values before the first deploy.

## 2. Production Environment File

The workflow never writes secrets into the repository. Production values stay on the server in:

- `/var/www/autoqr/.env`

Important variables in `.env`:

- `CLIENT_URL=https://autoqr.de`
- `CORS_ORIGINS=https://autoqr.de,https://www.autoqr.de`
- `PUBLIC_BASE_URL=https://autoqr.de`
- `JWT_ACCESS_SECRET=...`
- `JWT_REFRESH_SECRET=...`
- `MONGO_ROOT_USERNAME=autoqr`
- `MONGO_ROOT_PASSWORD=use_a_long_url_safe_password`
- `MONGO_DATABASE=autoqr`
- `VITE_API_URL=https://api.autoqr.de/api`
- `VITE_SOCKET_URL=https://api.autoqr.de`
- `VITE_AGORA_APP_ID=...`
- `AGORA_APP_ID=...`
- `AGORA_APP_CERTIFICATE=...`

Notes:

- Keep the `.env` file only on the server.
- Do not commit production secrets.
- Use a URL-safe Mongo password because it is interpolated into the internal Docker connection string.

## 3. GitHub Secrets

Add these repository secrets in GitHub:

- `HETZNER_HOST=91.99.142.173`
- `HETZNER_USER=root`
- `HETZNER_SSH_KEY=<private ssh key>`
- `HETZNER_PORT=22`

No secrets are hardcoded in the workflow.

## 4. SSH Key Setup For GitHub Actions

Create a deployment key pair on your local machine:

```bash
ssh-keygen -t ed25519 -C "github-actions-autoqr"
```

Then:

1. Add the public key to the server:

```bash
mkdir -p /root/.ssh
chmod 700 /root/.ssh
cat github-actions-autoqr.pub >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
```

2. Add the private key contents to GitHub repository secret `HETZNER_SSH_KEY`.

## 5. Docker Deployment Layout

The compose stack does the following:

- `mongodb`
  - Uses an internal Docker network only
  - Exposes no public port
  - Stores data in persistent volume `autoqr_mongodb_data`
- `backend`
  - Builds from `apps/api/Dockerfile`
  - Binds to `127.0.0.1:4000`
  - Stores uploads in persistent volume `autoqr_uploads`
  - Uses the internal MongoDB container
- `frontend`
  - Builds from `apps/web/Dockerfile`
  - Binds to `127.0.0.1:3000`

Safe behavior:

- `docker compose up -d --build` recreates only what is needed
- MongoDB data stays in Docker volume storage
- No `docker compose down -v`
- No `docker system prune --volumes`
- No database folder deletion

## 6. Nginx And SSL

The repo includes a sample host Nginx config at:

- `infra/nginx/autoqr.conf`

Use it only if the server does not already have a working config. Do not overwrite an existing stable production config unless you intend to replace it.

Expected routing:

- `autoqr.de` -> frontend container on `127.0.0.1:3000`
- `www.autoqr.de` -> frontend container on `127.0.0.1:3000`
- `api.autoqr.de` -> backend container on `127.0.0.1:4000`

Install the config only if needed:

```bash
cp /var/www/autoqr/infra/nginx/autoqr.conf /etc/nginx/sites-available/autoqr.conf
ln -sf /etc/nginx/sites-available/autoqr.conf /etc/nginx/sites-enabled/autoqr.conf
nginx -t
systemctl reload nginx
```

Issue certificates with Certbot if they are not already active:

```bash
certbot --nginx -d autoqr.de -d www.autoqr.de -d api.autoqr.de
```

SSL remains managed by host Nginx and is not touched by Docker deployments.

## 7. GitHub Actions Workflow Behavior

Workflow file:

- `.github/workflows/deploy.yml`

Triggers:

- Push to `main`
- Manual `workflow_dispatch`

Deployment flow:

1. Checkout repository in GitHub Actions
2. SSH into the Hetzner VPS
3. Change to `/var/www/autoqr`
4. Run `git pull origin main`
5. Create `.env` from `.env.example` only if `.env` is missing, then stop so secrets can be filled safely
6. Run `docker compose pull mongodb`
7. Run `docker compose up -d --build`
8. Run `docker image prune -f`
9. Print `docker compose ps`
10. Wait for `mongodb`, `backend`, and `frontend` health
11. Check backend health with `GET /api/health`
12. Check backend readiness with `GET /api/health/ready`
13. Check frontend health with `GET /`
14. Print recent deployment logs

## 8. Health Checks

Backend:

- `GET /api/health`
- Response:

```json
{
  "status": "ok",
  "service": "AutoQr API"
}
```

Frontend:

- `GET /`

MongoDB:

- Container running and health status via Docker

Useful commands on the server:

```bash
cd /var/www/autoqr
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
curl -fsS http://127.0.0.1:4000/api/health
```

## 9. First Manual Deployment

For the first deployment or for a manual release on the server:

```bash
cd /var/www/autoqr
git pull origin main
docker compose up -d --build
docker image prune -f
docker compose ps
```

## 10. Rollback

If a release needs to be rolled back:

```bash
cd /var/www/autoqr
git log --oneline
git checkout PREVIOUS_COMMIT
docker compose up -d --build
```

This rollback flow does not remove MongoDB volumes.

## 11. Final Validation Checklist

- GitHub Actions workflow exists
- GitHub secrets are documented
- Server deploy path is `/var/www/autoqr`
- Docker containers rebuild with `docker compose up -d --build`
- MongoDB data is persistent in `autoqr_mongodb_data`
- Nginx stays on the host and remains stable
- SSL stays active through Let's Encrypt
- Pushes to `main` trigger deployment
- Manual workflow runs are supported
- No production data is deleted during deployment
